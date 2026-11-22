const $ = id => document.getElementById(id);

let sdk;
let catalog;
let writeBatch;
let user;

let profile = {};
let profileExists = false;
let dirty = false;
let saving = false;
let processingPhoto = false;
let photo = "";
let requestsLoading = false;
let profileRevision = 0;

const selectedSubjects = {
  self: [],
  child: [],
  teacher: []
};

const pickers = {};
const pendingRequestUpdates = new Set();

function make(tag, className, text) {
  const element = document.createElement(tag);

  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;

  return element;
}

function value(id) {
  return $(id).value.trim();
}

function notice(id, text, error = false) {
  const element = $(id);

  element.textContent = text;
  element.className = error
    ? "site-notice site-notice-error"
    : "site-notice site-notice-success";

  element.hidden = !text;
}

function currentUserIsValid() {
  return Boolean(user && sdk?.auth.currentUser?.uid === user.uid);
}

/* לשוניות וכתובת העמוד */

const panelKeys = ["profile", "requests", "messages"];

function activatePanel(key, updateAddress = false, focus = false) {
  if (!panelKeys.includes(key)) key = "profile";

  for (const panelKey of panelKeys) {
    const selected = panelKey === key;

    $(panelKey).hidden = !selected;
    $(`tab-${panelKey}`).setAttribute(
      "aria-selected",
      String(selected)
    );
    $(`tab-${panelKey}`).tabIndex = selected ? 0 : -1;
  }

  if (updateAddress && location.hash !== `#${key}`) {
    const url = new URL(location.href);
    url.hash = key;

    history.pushState(null, "", url);
    window.dispatchEvent(new Event("hashchange"));
  }

  if (focus) {
    $(`tab-${key}`).focus();
  }
}

function syncPanelWithAddress() {
  activatePanel(location.hash.slice(1));
}

for (const key of panelKeys) {
  $(`tab-${key}`).addEventListener("click", () => {
    activatePanel(key, true);
  });
}

$("dashboard-tabs").addEventListener("keydown", event => {
  const tab = event.target.closest('[role="tab"]');
  if (!tab) return;

  const index = panelKeys.indexOf(tab.dataset.panel);
  const rtl = getComputedStyle($("dashboard-tabs")).direction === "rtl";

  let next = null;

  if (event.key === "Home") next = 0;
  if (event.key === "End") next = panelKeys.length - 1;
  if (event.key === "ArrowLeft") next = index + (rtl ? 1 : -1);
  if (event.key === "ArrowRight") next = index + (rtl ? -1 : 1);

  if (next === null) return;

  event.preventDefault();

  next = (next + panelKeys.length) % panelKeys.length;
  activatePanel(panelKeys[next], true, true);
});

document.addEventListener("click", event => {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return;
  }

  const link = event.target.closest("a[href]");

  if (
    !link ||
    link.hasAttribute("download") ||
    (link.target && link.target !== "_self")
  ) {
    return;
  }

  let url;

  try {
    url = new URL(link.href, location.href);
  } catch {
    return;
  }

  if (
    url.origin !== location.origin ||
    url.pathname !== location.pathname ||
    url.search !== location.search
  ) {
    return;
  }

  const key = url.hash.slice(1);
  if (!panelKeys.includes(key)) return;

  event.preventDefault();
  activatePanel(key, true, true);
});

window.addEventListener("hashchange", syncPanelWithAddress);
window.addEventListener("popstate", syncPanelWithAddress);

syncPanelWithAddress();

/* פרטי הפרופיל */

function getUses(data = profile) {
  if (data.accountUses) {
    return {
      selfLearner: Boolean(data.accountUses.selfLearner),
      parent: Boolean(data.accountUses.parent),
      teacher: Boolean(data.accountUses.teacher)
    };
  }

  return {
    selfLearner: !["teacher", "parent"].includes(data.role),
    parent: data.role === "parent",
    teacher: ["teacher", "both"].includes(data.role)
  };
}

function getLearning(kind) {
  if (kind === "child") {
    return profile.childLearningProfile || {};
  }

  if (profile.selfLearningProfile) {
    return profile.selfLearningProfile;
  }

  if (profile.studentProfile) {
    return profile.studentProfile;
  }

  return getUses().selfLearner ? profile : {};
}

function getTeacherProfile() {
  return profile.teacherProfile || (
    getUses().teacher ? profile : {}
  );
}

function setAvatar(element, name, source) {
  const initial = Array.from(name || "כ")[0];
  element.textContent = initial;

  if (typeof source !== "string" || !source) return;

  let allowed =
    /^data:image\/(?:png|jpeg|webp|gif);base64,/i.test(source);

  if (!allowed) {
    try {
      allowed = new URL(source).protocol === "https:";
    } catch {
      allowed = false;
    }
  }

  if (!allowed) return;

  const image = document.createElement("img");
  image.alt = "";
  image.referrerPolicy = "no-referrer";

  image.addEventListener("error", () => {
    if (element.contains(image)) {
      element.textContent = initial;
    }
  });

  image.src = source;
  element.replaceChildren(image);
}

function addDetails(section, entries) {
  const list = make("dl", "site-data-list");

  for (const [label, content] of entries) {
    const row = document.createElement("div");

    row.append(
      make("dt", "", label),
      make("dd", "", String(content ?? "").trim() || "טרם הוגדר")
    );

    list.append(row);
  }

  section.append(list);
}

function createProfileSection(title, data, teacher = false) {
  const section = make("section", "profile-section");
  section.append(make("h3", "", title));

  const tags = make("div", "site-tags");
  const subjects = catalog.normalizeList(data.subjects);

  for (const subject of subjects) {
    tags.append(make("span", "site-tag", subject));
  }

  if (!subjects.length) {
    tags.append(
      make("span", "site-muted site-small", "עדיין לא נבחרו מקצועות")
    );
  }

  section.append(tags);

  if (teacher) {
    const price = Number(data.price);

    const hasPrice =
      data.price !== undefined &&
      data.price !== null &&
      data.price !== "" &&
      Number.isFinite(price) &&
      price >= 0;

    addDetails(section, [
      ["מחיר לשיעור", hasPrice ? `${price} ₪` : ""],
      ["אופן הלימוד", data.format],
      ["ניסיון בהוראה", data.experience],
      ["זמינות", data.availability]
    ]);

    if (data.bio) {
      section.append(make("p", "site-profile-bio", data.bio));
    }
  } else {
    addDetails(section, [
      ["רמה או כיתה", data.level],
      ["סגנון למידה", data.learningStyle],
      ["מטרת הלמידה", data.goal],
      ["זמינות", data.availability]
    ]);
  }

  return section;
}

function renderProfile() {
  const uses = getUses();
  const name = profile.name || user.displayName || "החשבון שלי";

  $("welcome").textContent = `שלום, ${name}`;
  $("profile-name").textContent = name;
  $("profile-email").textContent = user.email || "";
  $("profile-city").textContent = profile.city || "העיר עדיין לא הוגדרה";

  setAvatar(
    $("profile-avatar"),
    name,
    profile.photo ?? user.photoURL
  );

  $("profile-roles").replaceChildren();

  for (const [enabled, label] of [
    [uses.selfLearner, "לומד/ת"],
    [uses.parent, "הורה"],
    [uses.teacher, "מורה"]
  ]) {
    if (enabled) {
      $("profile-roles").append(
        make("span", "site-badge site-badge-success", label)
      );
    }
  }

  const sections = $("profile-sections");
  sections.replaceChildren();

  if (uses.selfLearner) {
    sections.append(
      createProfileSection("הלמידה שלי", getLearning("self"))
    );
  }

  if (uses.parent) {
    sections.append(
      createProfileSection("הלמידה של הילד/ה", getLearning("child"))
    );
  }

  if (uses.teacher) {
    sections.append(
      createProfileSection("ההוראה שלי", getTeacherProfile(), true)
    );
  }

  $("find-teacher-link").hidden = !(uses.selfLearner || uses.parent);
  $("public-profile-link").hidden = !uses.teacher;
  $("public-profile-link").href =
    `teacher-profile.html?id=${encodeURIComponent(user.uid)}`;

  const incomplete =
    !profileExists ||
    !profile.name ||
    (
      uses.selfLearner &&
      !catalog.normalizeList(getLearning("self").subjects).length
    ) ||
    (
      uses.parent &&
      !catalog.normalizeList(getLearning("child").subjects).length
    ) ||
    (
      uses.teacher &&
      !catalog.normalizeList(getTeacherProfile().subjects).length
    );

  const actions = $("next-actions");
  actions.replaceChildren();

  if (incomplete) {
    $("next-title").textContent = "נשלים את הפרופיל שלך";
    $("next-description").textContent =
      "כמה פרטים על המקצועות והמטרות יעזרו להתחיל.";

    const button = make("button", "site-btn", "השלמת הפרופיל");
    button.type = "button";
    button.addEventListener("click", openEditor);
    actions.append(button);
  } else if (uses.selfLearner || uses.parent) {
    $("next-title").textContent = "מוצאים את המורה שמתאים לך";
    $("next-description").textContent =
      "אפשר לחפש מורה לפי הצורך שלך או לחזור לבקשות שכבר שלחת.";

    const link = make("a", "site-btn", "מציאת מורה");
    link.href = "matches.html";
    actions.append(link);
  } else {
    $("next-title").textContent = "ממשיכים מהבקשות שלך";
    $("next-description").textContent =
      "בדקו בקשות מתלמידים ואשרו את השיעורים שמתאימים לכם.";

    const link = make("a", "site-btn", "לצפייה בבקשות");
    link.href = "#requests";
    actions.append(link);
  }

  const conversations = make(
    "a",
    "site-btn site-btn-secondary",
    "השיחות שלי"
  );
  conversations.href = "#messages";
  actions.append(conversations);
}

/* יצירת שדות הלמידה ובוררי המקצועות */

function buildEditors() {
  for (const kind of ["self", "child"]) {
    const section = document.createElement("fieldset");
    section.className = "editor-section";
    section.id = `${kind}-editor`;

    section.innerHTML = `
      <legend>
        ${kind === "self" ? "הלמידה שלי" : "הלמידה של הילד/ה"}
      </legend>

      <div class="site-form-grid">
        <div class="site-field site-field-full">
          <label class="site-label" id="${kind}-subject-label">
            מקצועות ללמידה
          </label>
          <div class="subject-picker" id="${kind}-subject-picker"></div>
        </div>

        <div class="site-field">
          <label class="site-label" for="${kind}-level">רמה או כיתה</label>
          <input class="site-input" id="${kind}-level" maxlength="100">
        </div>

        <div class="site-field">
          <label class="site-label" for="${kind}-style">סגנון למידה</label>
          <select class="site-select" id="${kind}-style">
            <option value="">בחירה</option>
            <option>הסברים ותרגול</option>
            <option>למידה חזותית</option>
            <option>למידה בקצב מהיר</option>
            <option>למידה רגועה ומסודרת</option>
          </select>
        </div>

        <div class="site-field site-field-full">
          <label class="site-label" for="${kind}-goal">מטרת הלמידה</label>
          <textarea
            class="site-textarea"
            id="${kind}-goal"
            maxlength="1000"
          ></textarea>
        </div>

        <div class="site-field site-field-full">
          <label class="site-label" for="${kind}-availability">
            ימים ושעות נוחים
          </label>
          <input
            class="site-input"
            id="${kind}-availability"
            maxlength="300"
          >
        </div>
      </div>
    `;

    $("learning-editors").append(section);
  }

  for (const kind of ["self", "child", "teacher"]) {
    pickers[kind] = catalog.createTagPicker({
      root: $(`${kind}-subject-picker`),
      options: catalog.SUBJECTS,
      selected: [],
      placeholder: "חיפוש ובחירת מקצועות…",
      maximum: 12,
      onChange(subjects) {
        selectedSubjects[kind] = [...subjects];
        dirty = true;
      }
    });

    const search = $(`${kind}-subject-picker`).querySelector("input");

    if (search) {
      search.id = `${kind}-subject-search`;
      $(`${kind}-subject-label`).htmlFor = search.id;
    }
  }

  toggleEditorSections();
}

function setSelect(id, content) {
  const select = $(id);
  const next = content || "";

  if (
    next &&
    !Array.from(select.options).some(option => option.value === next)
  ) {
    select.add(new Option(next, next));
  }

  select.value = next;
}

function toggleEditorSections() {
  for (const [kind, enabled] of [
    ["self", $("use-self").checked],
    ["child", $("use-parent").checked],
    ["teacher", $("use-teacher").checked]
  ]) {
    const section = $(`${kind}-editor`);
    if (!section) continue;

    section.hidden = !enabled;
    section.disabled = !enabled;
  }
}

function openEditor() {
  if (saving || processingPhoto || !user) return;

  activatePanel("profile", true);

  if (!$("profile-editor").hidden) {
    $("editor-title").focus();
    return;
  }

  notice("editor-message", "");

  const uses = getUses();

  $("name").value = profile.name || user.displayName || "";
  $("email").value = user.email || "";
  $("city").value = profile.city || "";
  $("phone").value = profile.phone || "";

  $("use-self").checked = uses.selfLearner;
  $("use-parent").checked = uses.parent;
  $("use-teacher").checked = uses.teacher;

  photo = profile.photo ?? user.photoURL ?? "";
  $("photo-input").value = "";
  setAvatar($("edit-avatar"), value("name"), photo);

  for (const kind of ["self", "child"]) {
    const data = getLearning(kind);

    $(`${kind}-level`).value = data.level || "";
    $(`${kind}-goal`).value = data.goal || "";
    $(`${kind}-availability`).value = data.availability || "";
    setSelect(`${kind}-style`, data.learningStyle);

    selectedSubjects[kind] = catalog.normalizeList(data.subjects);
    pickers[kind].setSelected(selectedSubjects[kind]);
  }

  const teacher = getTeacherProfile();

  $("teacher-price").value = teacher.price ?? "";
  $("teacher-experience").value = teacher.experience || "";
  $("teacher-availability").value = teacher.availability || "";
  $("teacher-bio").value = teacher.bio || "";
  setSelect("teacher-format", teacher.format || "אונליין");

  selectedSubjects.teacher = catalog.normalizeList(teacher.subjects);
  pickers.teacher.setSelected(selectedSubjects.teacher);

  document.querySelectorAll(".tag-picker-options").forEach(element => {
    element.classList.add("hidden");
  });

  toggleEditorSections();
  dirty = false;

  $("profile-view").hidden = true;
  $("profile-editor").hidden = false;
  $("editor-title").focus();
}

function closeEditor() {
  $("profile-editor").hidden = true;
  $("profile-view").hidden = false;
  dirty = false;

  if (!$("profile").hidden) {
    $("edit-button").focus();
  }
}

function learningData(kind) {
  const existing = kind === "child"
    ? profile.childLearningProfile
    : profile.selfLearningProfile || profile.studentProfile;

  return {
    ...(existing || {}),
    subjects: [...selectedSubjects[kind]],
    level: value(`${kind}-level`),
    learningStyle: value(`${kind}-style`),
    goal: value(`${kind}-goal`),
    availability: value(`${kind}-availability`)
  };
}

/* שמירת פרופיל */

async function saveProfile(event) {
  event.preventDefault();

  if (saving || processingPhoto) return;

  $("name").value = value("name");
  if (!$("profile-form").reportValidity()) return;

  const uses = {
    selfLearner: $("use-self").checked,
    parent: $("use-parent").checked,
    teacher: $("use-teacher").checked
  };

  if (!Object.values(uses).some(Boolean)) {
    notice("editor-message", "בחרו לפחות שימוש אחד לחשבון.", true);
    return;
  }

  for (const [kind, active] of [
    ["self", uses.selfLearner],
    ["child", uses.parent],
    ["teacher", uses.teacher]
  ]) {
    if (active && !selectedSubjects[kind].length) {
      notice(
        "editor-message",
        "בחרו לפחות מקצוע אחד בכל פרופיל פעיל.",
        true
      );
      $(`${kind}-subject-search`)?.focus();
      return;
    }
  }

  const selfProfile = uses.selfLearner
    ? learningData("self")
    : profile.selfLearningProfile || profile.studentProfile || null;

  const childProfile = uses.parent
    ? learningData("child")
    : profile.childLearningProfile || null;

  const teacherProfile = uses.teacher
    ? {
        ...(profile.teacherProfile || {}),
        subjects: [...selectedSubjects.teacher],
        price: Number(value("teacher-price")),
        experience: value("teacher-experience"),
        availability: value("teacher-availability"),
        format: value("teacher-format"),
        bio: value("teacher-bio")
      }
    : profile.teacherProfile || null;

  const learner = uses.selfLearner || uses.parent;
  const matchingProfile = uses.selfLearner ? selfProfile : childProfile;
  const wasTeacher = getUses().teacher;

  const next = {
    uid: user.uid,
    name: value("name"),
    email: user.email || "",
    phone: value("phone"),
    city: value("city"),
    photo,
    accountUses: uses,
    role: uses.teacher ? (learner ? "both" : "teacher") : "student",
    roles: [
      ...(learner ? ["student"] : []),
      ...(uses.teacher ? ["teacher"] : [])
    ],
    selfLearningProfile: selfProfile,
    childLearningProfile: childProfile,
    studentProfile: selfProfile,
    teacherProfile,
    subjects: matchingProfile?.subjects || [],
    level: matchingProfile?.level || "",
    learningStyle: matchingProfile?.learningStyle || "",
    goal: matchingProfile?.goal || "",
    availability: matchingProfile?.availability || "",
    updatedAt: sdk.serverTimestamp()
  };

  if (!profileExists) {
    next.createdAt = sdk.serverTimestamp();
  }

  saving = true;
  $("profile-form").inert = true;
  $("profile-form").setAttribute("aria-busy", "true");
  $("save-button").textContent = "שומרים…";
  notice("editor-message", "");

  try {
    if (!currentUserIsValid()) {
      throw new Error("The signed-in account changed.");
    }

    const batch = writeBatch(sdk.db);

    batch.set(
      sdk.doc(sdk.db, "users", user.uid),
      next,
      { merge: true }
    );

    if (uses.teacher) {
      const teacherData = {
        uid: user.uid,
        name: next.name,
        city: next.city,
        photo: next.photo,
        subjects: teacherProfile.subjects,
        price: teacherProfile.price,
        experience: teacherProfile.experience,
        availability: teacherProfile.availability,
        format: teacherProfile.format,
        bio: teacherProfile.bio,
        updatedAt: sdk.serverTimestamp()
      };

      // הפעלה ראשונית או חזרה להוראה.
      // בעריכה רגילה נשמר מצב הפעילות הקיים.
      if (!wasTeacher || !profileExists) {
        teacherData.active = true;
        teacherData.acceptingStudents = true;
      }

      batch.set(
        sdk.doc(sdk.db, "teachers", user.uid),
        teacherData,
        { merge: true }
      );
    } else if (wasTeacher) {
      batch.set(
        sdk.doc(sdk.db, "teachers", user.uid),
        {
          active: false,
          acceptingStudents: false,
          updatedAt: sdk.serverTimestamp()
        },
        { merge: true }
      );
    }

    await batch.commit();

    profile = { ...profile, ...next };
    profileExists = true;
    dirty = false;
    profileRevision += 1;

    renderProfile();
    closeEditor();

    window.dispatchEvent(new CustomEvent("kivun:profile-updated", {
      detail: {
        name: next.name,
        photo: next.photo
      }
    }));

    notice("page-message", "הפרופיל עודכן בהצלחה.");

    // השם בפרופיל האתר כבר נשמר.
    // עדכון השם בנתוני ההתחברות אינו מעכב את המסך.
    sdk.updateProfile(user, { displayName: next.name }).catch(error => {
      console.error("Auth name update failed:", error?.code);
    });
  } catch (error) {
    console.error("Profile save failed:", error);

    notice(
      "editor-message",
      "לא הצלחנו לשמור. הפרטים שהזנת נשארו בטופס. בדקו את החיבור ונסו שוב.",
      true
    );
  } finally {
    saving = false;
    $("profile-form").inert = false;
    $("profile-form").setAttribute("aria-busy", "false");
    $("save-button").textContent = "שמירת שינויים";
  }
}

/* תמונת פרופיל */

async function processPhoto() {
  const file = $("photo-input").files[0];

  if (!file || saving || processingPhoto) return;

  if (
    !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
    file.size > 5 * 1024 * 1024
  ) {
    notice("editor-message", "בחרו תמונת JPG, PNG או WebP עד 5MB.", true);
    $("photo-input").value = "";
    return;
  }

  processingPhoto = true;
  $("profile-form").inert = true;
  notice("editor-message", "מכינים את התמונה…");

  const url = URL.createObjectURL(file);

  try {
    const image = new Image();
    image.src = url;
    await image.decode();

    const scale = Math.min(
      1,
      600 / Math.max(image.width, image.height)
    );

    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));

    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas is unavailable.");

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    photo = canvas.toDataURL("image/jpeg", .82);
    dirty = true;

    setAvatar($("edit-avatar"), value("name"), photo);

    notice(
      "editor-message",
      "התמונה מוכנה. לחצו על שמירת שינויים כדי לשמור אותה."
    );
  } catch (error) {
    console.error("Photo processing failed:", error);
    notice("editor-message", "לא הצלחנו לקרוא את התמונה.", true);
  } finally {
    URL.revokeObjectURL(url);
    processingPhoto = false;
    $("profile-form").inert = false;
    $("photo-input").value = "";
  }
}

/* בקשות ושיחות */

function emptyState(target, title, description) {
  const box = make("div", "site-empty");

  box.append(
    make("h3", "", title),
    make("p", "", description)
  );

  target.replaceChildren(box);
}

function requestCard(request, conversation = false) {
  const incoming = request.teacherId === user.uid;

  const name = incoming
    ? request.studentName
    : request.teacherName;

  const card = make("article", "request-card");
  const top = make("div", "site-between");

  top.append(
    make("h3", "", name || "משתמש/ת בכיוון")
  );

  const statuses = {
    pending: ["ממתינה לאישור", "site-badge-pending"],
    accepted: ["הבקשה אושרה", "site-badge-success"],
    declined: ["הבקשה לא אושרה", "site-badge-danger"],
    cancelled: ["הבקשה בוטלה", ""]
  };

  const [label, style] = statuses[request.status] || [
    "מצב לא מוכר",
    ""
  ];

  top.append(
    make("span", `site-badge ${style}`, label)
  );

  card.append(top);

  const details = [
    request.subject,
    request.preferredTime
  ].filter(Boolean).join(" · ");

  if (details) card.append(make("p", "", details));

  if (!conversation && request.message) {
    card.append(make("p", "", request.message));
  }

  if (conversation && request.lastMessage) {
    card.append(make(
      "p",
      "",
      `הודעה אחרונה: ${String(request.lastMessage).slice(0, 160)}`
    ));
  }

  const date = request.createdAt?.toDate?.();

  card.append(make(
    "p",
    "request-meta",
    [
      incoming ? "בקשה שהתקבלה" : "בקשה ששלחת",
      date ? date.toLocaleDateString("he-IL") : ""
    ].filter(Boolean).join(" · ")
  ));

  const actions = make("div", "site-row");

  if (request.status === "accepted") {
    const link = make(
      "a",
      "site-btn site-btn-secondary",
      "פתיחת השיחה"
    );

    link.href = `chat.html?id=${encodeURIComponent(request.id)}`;
    actions.append(link);

    const unread = Number(
      incoming
        ? request.unreadForTeacher
        : request.unreadForStudent
    );

    if (Number.isFinite(unread) && unread > 0) {
      actions.append(make(
        "span",
        "site-badge site-badge-info",
        `${unread} הודעות חדשות`
      ));
    }
  }

  if (incoming && request.status === "pending") {
    for (const [status, text, className] of [
      ["accepted", "אישור הבקשה", "site-btn"],
      ["declined", "דחיית הבקשה", "site-btn site-btn-secondary"]
    ]) {
      const button = make("button", className, text);
      button.type = "button";

      button.disabled = pendingRequestUpdates.has(request.id);

      button.addEventListener("click", async () => {
        if (
          pendingRequestUpdates.has(request.id) ||
          !currentUserIsValid()
        ) {
          return;
        }

        pendingRequestUpdates.add(request.id);

        actions.querySelectorAll("button").forEach(item => {
          item.disabled = true;
        });

        notice("requests-message", "");

        try {
          await sdk.updateDoc(
            sdk.doc(sdk.db, "requests", request.id),
            {
              status,
              updatedAt: sdk.serverTimestamp()
            }
          );

          notice(
            "requests-message",
            status === "accepted"
              ? "הבקשה אושרה. אפשר לפתוח שיחה."
              : "הבקשה נדחתה."
          );
        } catch (error) {
          console.error("Request update failed:", error?.code);

          notice(
            "requests-message",
            "לא הצלחנו לעדכן את הבקשה. נסו שוב.",
            true
          );
        } finally {
          pendingRequestUpdates.delete(request.id);
          await loadRequests();
        }
      });

      actions.append(button);
    }
  }

  card.append(actions);
  return card;
}

async function loadRequests() {
  if (requestsLoading || !currentUserIsValid()) return;

  requestsLoading = true;
  $("refresh-requests").disabled = true;
  $("refresh-messages").disabled = true;

  const requestBox = $("requests-content");
  const messageBox = $("messages-content");

  requestBox.setAttribute("aria-busy", "true");
  messageBox.setAttribute("aria-busy", "true");

  try {
    const snapshots = await Promise.all([
      sdk.getDocs(sdk.query(
        sdk.collection(sdk.db, "requests"),
        sdk.where("studentId", "==", user.uid)
      )),
      sdk.getDocs(sdk.query(
        sdk.collection(sdk.db, "requests"),
        sdk.where("teacherId", "==", user.uid)
      ))
    ]);

    if (!currentUserIsValid()) return;

    const unique = new Map();

    for (const snapshot of snapshots) {
      for (const item of snapshot.docs) {
        unique.set(item.id, {
          ...item.data(),
          id: item.id
        });
      }
    }

    const requests = [...unique.values()].sort((a, b) =>
      (b.createdAt?.toMillis?.() || 0) -
      (a.createdAt?.toMillis?.() || 0)
    );

    requestBox.replaceChildren();
    messageBox.replaceChildren();

    if (!requests.length) {
      emptyState(
        requestBox,
        "עדיין אין בקשות",
        "בקשות שתשלחו או תקבלו יופיעו כאן עם המצב שלהן."
      );
    } else {
      for (const request of requests) {
        requestBox.append(requestCard(request));
      }
    }

    const conversations = requests
      .filter(request => request.status === "accepted")
      .sort((a, b) =>
        (b.lastMessageAt?.toMillis?.() || b.createdAt?.toMillis?.() || 0) -
        (a.lastMessageAt?.toMillis?.() || a.createdAt?.toMillis?.() || 0)
      );

    if (!conversations.length) {
      emptyState(
        messageBox,
        "השיחות יתחילו כאן",
        "לאחר אישור בקשה אפשר לפתוח שיחה ולתאם את פרטי השיעור."
      );
    } else {
      for (const request of conversations) {
        messageBox.append(requestCard(request, true));
      }
    }
  } catch (error) {
    console.error("Requests load failed:", error?.code);

    requestBox.textContent =
      "לא הצלחנו לטעון את הבקשות. לחצו על רענון כדי לנסות שוב.";

    messageBox.textContent =
      "לא הצלחנו לטעון את השיחות. לחצו על רענון כדי לנסות שוב.";
  } finally {
    requestsLoading = false;

    $("refresh-requests").disabled = false;
    $("refresh-messages").disabled = false;

    requestBox.setAttribute("aria-busy", "false");
    messageBox.setAttribute("aria-busy", "false");
  }
}

/* חיבור הכפתורים */

$("edit-button").addEventListener("click", openEditor);
$("profile-form").addEventListener("submit", saveProfile);
$("photo-input").addEventListener("change", processPhoto);
$("refresh-requests").addEventListener("click", loadRequests);
$("refresh-messages").addEventListener("click", loadRequests);
$("reload-button").addEventListener("click", () => location.reload());

$("profile-form").addEventListener("input", () => {
  dirty = true;
});

$("profile-form").addEventListener("change", () => {
  dirty = true;
});

$("name").addEventListener("input", () => {
  setAvatar($("edit-avatar"), value("name"), photo);
});

for (const id of ["use-self", "use-parent", "use-teacher"]) {
  $(id).addEventListener("change", toggleEditorSections);
}

$("cancel-edit").addEventListener("click", () => {
  if (saving || processingPhoto) return;

  if (dirty && !confirm("לבטל את השינויים שלא נשמרו?")) {
    return;
  }

  closeEditor();
});

$("remove-photo").addEventListener("click", () => {
  if (saving || processingPhoto) return;

  photo = "";
  dirty = true;
  setAvatar($("edit-avatar"), value("name"), "");
});

window.addEventListener("beforeunload", event => {
  if (dirty || saving || processingPhoto) {
    event.preventDefault();
    event.returnValue = "";
  }
});

window.addEventListener("kivun:before-signout", event => {
  if (saving || processingPhoto) {
    event.preventDefault();

    notice(
      "page-message",
      "יש להמתין לסיום הפעולה לפני התנתקות.",
      true
    );
    return;
  }

  if (
    dirty &&
    !confirm("יש שינויים שלא נשמרו. להתנתק ולוותר עליהם?")
  ) {
    event.preventDefault();
    return;
  }

  dirty = false;
});

/* טעינה ראשונית */

async function start() {
  try {
    const access = await import("./access.js");
    await access.requireAccess();

    const modules = await Promise.all([
      import("./firebase.js"),
      import("./catalog.js"),
      import("https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js")
    ]);

    sdk = modules[0];
    catalog = modules[1];
    writeBatch = modules[2].writeBatch;

    user = sdk.auth.currentUser;

    if (!user) {
      location.replace("login.html");
      return;
    }

    sdk.onAuthStateChanged(sdk.auth, current => {
      if (current?.uid !== user.uid) {
        dirty = false;
        saving = false;
        processingPhoto = false;
        location.replace("login.html");
      }
    });

    const snapshot = await sdk.getDoc(
      sdk.doc(sdk.db, "users", user.uid)
    );

    if (!currentUserIsValid()) return;

    profileExists = snapshot.exists();

    profile = profileExists
      ? snapshot.data()
      : {
          name: user.displayName || "",
          accountUses: {
            selfLearner: true,
            parent: false,
            teacher: false
          }
        };

    buildEditors();
    renderProfile();

    $("page-loading").hidden = true;
    $("dashboard").hidden = false;
    syncPanelWithAddress();

    if (!profileExists) {
      notice(
        "page-message",
        "החשבון מחובר. השלימו את הפרופיל כדי להתחיל."
      );
    }

    await loadRequests();
  } catch (error) {
    console.error("Dashboard initialization failed:", error);

    if (document.documentElement.classList.contains("access-pending")) {
      const box = $("access-status");
      box.querySelector("strong").textContent =
        "לא הצלחנו לפתוח את האזור האישי";
      box.querySelector("p").textContent =
        "בדקו את החיבור לאינטרנט ונסו לרענן את העמוד.";
      return;
    }

    $("page-loading").hidden = true;
    $("reload-button").hidden = false;

    notice(
      "page-message",
      "לא הצלחנו לטעון את האזור האישי. בדקו את החיבור ונסו שוב.",
      true
    );
  }
}

start();