/*
 * כיוון — ניווט משותף
 *
 * מופעל בכותרת של הדפים הפנימיים:
 * <header data-site-header></header>
 *
 * משתמש בעיצוב הקיים מתוך site.css.
 */

function startNavigation() {
  addSkipLink();
  initializeExistingMenu();
  initializeSharedHeader();
  initializeAccessNotice();
}

/* מעבר נגיש לתוכן הראשי */

function addSkipLink() {
  const main =
    document.querySelector("main") ||
    document.querySelector(".hero-grid");

  if (!main) return;

  if (!main.id) {
    main.id = "main-content";
  }

  if (!main.hasAttribute("tabindex")) {
    main.setAttribute("tabindex", "-1");
  }

  if (document.querySelector(".skip-link, .site-skip-link")) {
    return;
  }

  const link = document.createElement("a");

  link.className = "skip-link site-skip-link";
  link.href = `#${main.id}`;
  link.textContent = "דילוג לתוכן העמוד";

  document.body.prepend(link);
}

/* תמיכה בתפריט הישן, אם הוא קיים בעמוד */

function initializeExistingMenu() {
  const button = document.querySelector(".menu-toggle");
  const menu = document.getElementById("public-menu");

  if (button && menu) {
    connectMobileMenu(button, menu);
  }
}

/* תפריט נייד */

function connectMobileMenu(button, menu) {
  if (button.dataset.navigationReady === "true") return;

  button.dataset.navigationReady = "true";

  if (menu.id) {
    button.setAttribute("aria-controls", menu.id);
  }

  function setOpen(open, returnFocus = false) {
    menu.classList.toggle("is-open", open);

    button.setAttribute("aria-expanded", String(open));
    button.setAttribute(
      "aria-label",
      open ? "סגירת תפריט הניווט" : "פתיחת תפריט הניווט"
    );

    if (returnFocus && !button.hidden) {
      button.focus();
    }
  }

  setOpen(false);

  button.addEventListener("click", () => {
    setOpen(button.getAttribute("aria-expanded") !== "true");
  });

  menu.addEventListener("click", event => {
    if (!event.target.closest("a")) return;

    const mobile = window.matchMedia("(max-width: 800px)").matches;
    setOpen(false, mobile);
  });

  document.addEventListener("click", event => {
    if (
      !button.contains(event.target) &&
      !menu.contains(event.target)
    ) {
      setOpen(false);
    }
  });

  document.addEventListener("keydown", event => {
    if (
      event.key === "Escape" &&
      button.getAttribute("aria-expanded") === "true"
    ) {
      setOpen(false, true);
    }
  });

  const desktop = window.matchMedia("(min-width: 801px)");

  function updateScreenSize() {
    setOpen(false);

    if (button.classList.contains("site-menu-toggle")) {
      button.hidden = desktop.matches;
    }
  }

  desktop.addEventListener("change", updateScreenSize);
  updateScreenSize();
}

/* כותרת הדפים הפנימיים */

async function initializeSharedHeader() {
  const header = document.querySelector("[data-site-header]");

  if (!header) return;
  if (header.dataset.navigationReady === "true") return;

  header.dataset.navigationReady = "true";
  header.classList.add("site-header");

  header.innerHTML = `
    <div class="site-container site-header-inner">
      <a
        class="site-brand"
        href="index.html"
        aria-label="כיוון — דף הבית"
      >
        כיוון
        <span class="site-brand-mark" aria-hidden="true">↗</span>
      </a>

      <nav
        class="site-nav"
        id="site-navigation"
        aria-label="ניווט ראשי"
      ></nav>

      <div class="site-header-actions">
        <div id="site-account-area">
          <span
            class="site-muted site-small"
            role="status"
            id="site-auth-loading"
          >
            בודקים התחברות…
          </span>
        </div>

        <button
          class="site-icon-btn site-menu-toggle"
          id="site-menu-toggle"
          type="button"
          aria-controls="site-navigation"
          aria-expanded="false"
          aria-label="פתיחת תפריט הניווט"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            aria-hidden="true"
          >
            <path d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
      </div>
    </div>
  `;

  const nav = header.querySelector("#site-navigation");
  const accountArea = header.querySelector("#site-account-area");
  const menuButton = header.querySelector("#site-menu-toggle");

  connectMobileMenu(menuButton, nav);

  let closeAccountMenu = () => {};
  let updateHeaderProfile = null;
  let accountVersion = 0;
  let mountedUserId = null;
  let signingOut = false;

  const currentPage =
    location.pathname.split("/").pop() || "index.html";

  /* סימון המקום הנוכחי */

  function updateActiveLinks() {
    const hash = location.hash;

    let activeKey = "";

    if (currentPage === "dashboard.html") {
      if (hash === "#requests") {
        activeKey = "requests";
      } else if (hash === "#messages") {
        activeKey = "messages";
      } else {
        activeKey = "dashboard";
      }
    } else if (
      currentPage === "matches.html" ||
      currentPage === "teacher-profile.html"
    ) {
      activeKey = "teachers";
    } else if (currentPage === "chat.html") {
      activeKey = "messages";
    } else if (currentPage === "index.html") {
      activeKey = "home";
    }

    nav.querySelectorAll("a[data-nav-key]").forEach(link => {
      if (link.dataset.navKey === activeKey) {
        const inPageSection =
          currentPage === "dashboard.html" &&
          ["requests", "messages"].includes(activeKey);

        link.setAttribute(
          "aria-current",
          inPageSection ? "location" : "page"
        );

        // site.css משתמש ב־aria-current="page" לצביעה.
        if (inPageSection) {
          link.style.color = "var(--site-primary)";
          link.style.background = "var(--site-primary-soft)";
        } else {
          link.style.removeProperty("color");
          link.style.removeProperty("background");
        }
      } else {
        link.removeAttribute("aria-current");
        link.style.removeProperty("color");
        link.style.removeProperty("background");
      }
    });
  }

  function renderLinks(items) {
    nav.replaceChildren();

    for (const item of items) {
      const link = document.createElement("a");

      link.className = "site-nav-link";
      link.href = item.href;
      link.textContent = item.label;
      link.dataset.navKey = item.key;

      nav.appendChild(link);
    }

    updateActiveLinks();
  }

  window.addEventListener("hashchange", updateActiveLinks);

  function showPublicNavigation() {
    accountVersion += 1;
    mountedUserId = null;
    updateHeaderProfile = null;
    closeAccountMenu = () => {};

    renderLinks([
      {
        key: "home",
        href: "index.html",
        label: "דף הבית"
      }
    ]);

    accountArea.innerHTML = `
      <div class="site-row">
        <a class="site-btn site-btn-quiet" href="login.html">
          כניסה
        </a>

        <a class="site-btn" href="join.html">
          יצירת חשבון
        </a>
      </div>
    `;
  }

  function showSignedInNavigation(user, sdk) {
    const version = ++accountVersion;
    mountedUserId = user.uid;

    renderLinks([
      {
        key: "dashboard",
        href: "dashboard.html",
        label: "האזור שלי"
      },
      {
        key: "teachers",
        href: "matches.html",
        label: "מציאת מורה"
      },
      {
        key: "requests",
        href: "dashboard.html#requests",
        label: "הבקשות שלי"
      },
      {
        key: "messages",
        href: "dashboard.html#messages",
        label: "השיחות שלי"
      }
    ]);

    accountArea.innerHTML = `
      <div class="site-account">
        <button
          class="site-account-trigger"
          id="site-account-trigger"
          type="button"
          aria-expanded="false"
          aria-controls="site-account-menu"
          aria-label="פתיחת תפריט החשבון"
        >
          <span
            class="site-avatar site-avatar-sm"
            id="site-account-avatar"
            aria-hidden="true"
          ></span>

          <span
            class="site-account-name"
            id="site-account-name"
          ></span>

          <span aria-hidden="true">⌄</span>
        </button>

        <div
          class="site-account-menu"
          id="site-account-menu"
          hidden
        >
          <a href="dashboard.html#profile">הפרופיל שלי</a>
          <a href="dashboard.html#requests">הבקשות שלי</a>
          <a href="dashboard.html#messages">השיחות שלי</a>

          <button
            class="site-logout"
            id="site-logout"
            type="button"
          >
            התנתקות
          </button>

          <p
            class="site-small"
            id="site-account-status"
            role="status"
            aria-live="polite"
            hidden
          ></p>
        </div>
      </div>
    `;

    const account = accountArea.querySelector(".site-account");
    const trigger = accountArea.querySelector("#site-account-trigger");
    const menu = accountArea.querySelector("#site-account-menu");
    const nameElement = accountArea.querySelector("#site-account-name");
    const avatar = accountArea.querySelector("#site-account-avatar");
    const logoutButton = accountArea.querySelector("#site-logout");
    const status = accountArea.querySelector("#site-account-status");

    let identityRevision = 0;

    function updateIdentity(name, photo) {
      const displayName =
        typeof name === "string" && name.trim()
          ? name.trim()
          : "החשבון שלי";

      nameElement.textContent = displayName;

      const initial = Array.from(displayName)[0] || "כ";
      avatar.textContent = initial;

      if (typeof photo !== "string" || !photo) return;

      let allowed =
        /^data:image\/(?:png|jpeg|webp|gif);base64,/i.test(photo);

      if (!allowed) {
        try {
          allowed = new URL(photo).protocol === "https:";
        } catch {
          allowed = false;
        }
      }

      if (!allowed) return;

      const image = document.createElement("img");

      image.alt = "";
      image.referrerPolicy = "no-referrer";

      image.addEventListener("error", () => {
        if (avatar.contains(image)) {
          avatar.textContent = initial;
        }
      });

      image.src = photo;
      avatar.replaceChildren(image);
    }

    function setAccountOpen(open, returnFocus = false) {
      menu.hidden = !open;

      trigger.setAttribute("aria-expanded", String(open));
      trigger.setAttribute(
        "aria-label",
        open ? "סגירת תפריט החשבון" : "פתיחת תפריט החשבון"
      );

      if (returnFocus) {
        trigger.focus();
      }
    }

    closeAccountMenu = (returnFocus = false) => {
      if (!menu.hidden) {
        setAccountOpen(false, returnFocus);
      }
    };

    trigger.addEventListener("click", () => {
      setAccountOpen(menu.hidden);
    });

    trigger.addEventListener("keydown", event => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setAccountOpen(true);
        menu.querySelector("a")?.focus();
      }
    });

    menu.addEventListener("click", event => {
      if (event.target.closest("a")) {
        setAccountOpen(false, true);
      }
    });

    account.addEventListener("focusout", () => {
      queueMicrotask(() => {
        if (!account.contains(document.activeElement)) {
          setAccountOpen(false);
        }
      });
    });

    logoutButton.addEventListener("click", async () => {
      if (signingOut) return;

      /*
       * מאפשר לעמוד לעצור התנתקות בזמן שמירה,
       * או לשאול לגבי שינויים שלא נשמרו.
       */
      const beforeSignOut = new CustomEvent(
        "kivun:before-signout",
        { cancelable: true }
      );

      if (!window.dispatchEvent(beforeSignOut)) return;

      signingOut = true;
      logoutButton.disabled = true;
      logoutButton.textContent = "מתנתקים…";
      status.hidden = true;

      try {
        await sdk.signOut(sdk.auth);
        location.replace("login.html");
      } catch (error) {
        console.error("Sign out failed:", error?.code);

        signingOut = false;
        logoutButton.disabled = false;
        logoutButton.textContent = "התנתקות";

        status.textContent =
          "לא הצלחנו להתנתק. נסו שוב בעוד רגע.";
        status.hidden = false;

        setAccountOpen(true);
      }
    });

    updateIdentity(user.displayName, user.photoURL);

    /*
     * לאחר שמירה באזור האישי, מעדכנים מיד
     * גם את השם והתמונה שבתפריט.
     */
    updateHeaderProfile = details => {
      if (version !== accountVersion) return;

      identityRevision += 1;
      updateIdentity(details.name, details.photo);
    };

    const revisionAtLoad = identityRevision;

    sdk.getDoc(sdk.doc(sdk.db, "users", user.uid))
      .then(snapshot => {
        if (version !== accountVersion) return;
        if (identityRevision !== revisionAtLoad) return;
        if (sdk.auth.currentUser?.uid !== user.uid) return;
        if (!snapshot.exists()) return;

        const profile = snapshot.data();

        updateIdentity(
          profile.name || user.displayName,
          profile.photo ?? user.photoURL
        );
      })
      .catch(error => {
        console.error(
          "Navigation profile load failed:",
          error?.code
        );
      });
  }

  document.addEventListener("click", event => {
    const account = accountArea.querySelector(".site-account");

    if (account && !account.contains(event.target)) {
      closeAccountMenu();
    }
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      closeAccountMenu(true);
    }
  });

  window.addEventListener("kivun:profile-updated", event => {
    if (event.detail && updateHeaderProfile) {
      updateHeaderProfile(event.detail);
    }
  });

  const loadingTimer = setTimeout(() => {
    const waiting = header.querySelector("#site-auth-loading");

    if (waiting) {
      waiting.textContent = "בדיקת ההתחברות מתעכבת…";
    }
  }, 12000);

  try {
    const sdk = await import("./firebase.js");

    await sdk.auth.authStateReady();
    clearTimeout(loadingTimer);

    const unsubscribe = sdk.onAuthStateChanged(
      sdk.auth,
      user => {
        if (user) {
          if (mountedUserId !== user.uid) {
            showSignedInNavigation(user, sdk);
          }
        } else {
          showPublicNavigation();
        }
      }
    );

    window.addEventListener("pagehide", event => {
      if (!event.persisted) {
        unsubscribe();
      }
    });
  } catch (error) {
    clearTimeout(loadingTimer);

    console.error("Navigation initialization failed:", error);

    renderLinks([
      {
        key: "home",
        href: "index.html",
        label: "דף הבית"
      }
    ]);

    accountArea.innerHTML = `
      <a class="site-btn site-btn-secondary" href="login.html">
        כניסה לחשבון
      </a>
    `;
  }
}

/* הודעה במקרה שבדיקת הכניסה לעמוד מתעכבת */

function initializeAccessNotice() {
  setTimeout(() => {
    const box = document.getElementById("access-status");

    const waiting =
      document.documentElement.classList.contains("access-pending");

    if (!box || !waiting) return;

    const heading = box.querySelector("strong");
    const description = box.querySelector("p");

    if (heading && heading.textContent.includes("לא הצלחנו")) {
      return;
    }

    if (heading) {
      heading.textContent = "בדיקת הכניסה מתעכבת";
    }

    if (description) {
      description.textContent =
        "בדקו את החיבור לאינטרנט. אפשר לרענן את העמוד או לחזור למסך הכניסה.";
    }
  }, 12000);
}

/* הפעלה */

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    startNavigation,
    { once: true }
  );
} else {
  startNavigation();
}