/*
  קטלוג משותף לכיוון:
  מקצועות לימוד, בחירת מקצועות ופרופילי הדגמה.
*/

export const SUBJECTS = [
  "אזרחות",
  "איטלקית",
  "אמהרית",
  "אומנות חזותית",
  "אומנויות בין־תחומיות",
  "אומנויות העיצוב",
  "אוריינות דיגיטלית",
  "אנגלית",
  "ביולוגיה",
  "ביוטכנולוגיה",
  "בריאות",
  "גאוגרפיה – אדם וסביבה",
  "גרמנית",
  "היסטוריה",
  "היסטוריה בחינוך הדרוזי",
  "היסטוריה בחינוך הערבי והבדואי",
  "היסטוריה חמ״ד",
  "הנדסה יישומית",
  "הנדסת אלקטרוניקה ומחשבים",
  "הנדסת בנייה ואדריכלות",
  "הנדסת חשמל, בקרה ואנרגיה",
  "הנדסת תוכנה",
  "הנדסת תעשייה וניהול",
  "זהירות בדרכים",
  "חינוך",
  "חינוך גופני",
  "חינוך פיננסי",
  "חקלאות",
  "חשיבה מחשובית",
  "חשיבה מחשובית ורובוטיקה",
  "יידיש",
  "כימיה",
  "כישורי חיים",
  "לימודי ארץ ישראל וארכיאולוגיה",
  "מבוא למדעים",
  "מדע וטכנולוגיה",
  "מדע וטכנולוגיה לכל",
  "מדעי החברה",
  "מדעי הסביבה",
  "מדעי המחשב",
  "מדעי כדור הארץ",
  "מידע ונתונים",
  "מוזיקה",
  "מולדת, חברה ואזרחות",
  "מורשת דרוזית",
  "מורשת ודת האסלאם",
  "מורשת ודת הנצרות",
  "מורשת ומסורת",
  "מחול",
  "מחשבת ישראל",
  "מחשבת ישראל חמ״ד",
  "מנהיגות ויזמות",
  "מערכות בריאות",
  "מתמטיקה",
  "ניהול עסקי",
  "סינית",
  "ספרדית",
  "ספרות",
  "ספרות חמ״ד",
  "עברית",
  "עברית – הבנה, הבעה ולשון",
  "עברית בחינוך הדרוזי והצ׳רקסי",
  "עברית בחינוך הערבי והבדואי",
  "עולם הערבים והאסלאם",
  "עיצוב",
  "עיצוב אופנה ותלבושות",
  "ערבית",
  "ערבית בבתי הספר העבריים",
  "ערבית בחינוך הערבי והבדואי",
  "ערבית שפת אם",
  "פיזיקה",
  "פילוסופיה",
  "פורטוגזית",
  "פרסית",
  "צרפתית",
  "קולנוע",
  "קולנוע ותקשורת",
  "רובוטיקה",
  "רוסית",
  "שינוי אקלים",
  "שפה ואוריינות",
  "תיירות",
  "תיאטרון",
  "תלמוד",
  "תושב״ע",
  "תנ״ך",
  "תנ״ך חמ״ד",
  "תקשוב",
  "תקשורת",
  "תחבורה מתקדמת"
].sort((first, second) =>
  first.localeCompare(second, "he")
);

export const LEVELS = [
  "גן ילדים",
  "כיתה א׳",
  "כיתה ב׳",
  "כיתה ג׳",
  "כיתה ד׳",
  "כיתה ה׳",
  "כיתה ו׳",
  "כיתה ז׳",
  "כיתה ח׳",
  "כיתה ט׳",
  "כיתה י׳",
  "כיתה י״א",
  "כיתה י״ב",
  "בגרות – 3 יח״ל",
  "בגרות – 4 יח״ל",
  "בגרות – 5 יח״ל",
  "מכינה",
  "אקדמי",
  "מבוגרים",
  "ללא רמה מוגדרת"
];

export const LEARNING_STYLES = [
  "הסבר רגוע ובגובה העיניים",
  "תרגול רב",
  "הכנה למבחנים ולבגרויות",
  "תוכנית לימוד מסודרת",
  "למידה בקצב מהיר",
  "למידה בקצב אישי",
  "למידה חזותית",
  "למידה דרך דוגמאות",
  "חיזוק ביטחון",
  "העמקה והעשרה"
];

export const LESSON_FORMATS = [
  "אונליין",
  "פרונטלי",
  "גם אונליין וגם פרונטלי"
];

/*
  פרופילים אלו מיועדים לתצוגת האתר בלבד.
  הם אינם נשמרים ב-Firebase ואינם מוצגים כמשתמשים אמיתיים.
*/
export const DEMO_TEACHERS = [
  {
    id: "demo-noam",
    isDemo: true,
    name: "נועם לוי",
    subjects: ["מתמטיקה"],
    levels: ["בגרות – 4 יח״ל", "בגרות – 5 יח״ל"],
    styles: [
      "הסבר רגוע ובגובה העיניים",
      "הכנה למבחנים ולבגרויות",
      "תרגול רב"
    ],
    city: "אונליין",
    price: 120,
    experience: "6 שנות ניסיון",
    format: "אונליין",
    availability: "ימים א׳, ג׳ וה׳ בשעות הערב",
    bio:
      "פרופיל הדגמה של מורה למתמטיקה. מציג כיצד ייראה פרופיל מלא באתר, כולל מקצועות, ניסיון, מחיר וזמינות.",
    rating: 4.9,
    reviewCount: 48,
    photo: "",
    verified: false
  },
  {
    id: "demo-maya",
    isDemo: true,
    name: "מאיה כהן",
    subjects: ["מתמטיקה", "פיזיקה"],
    levels: [
      "כיתה י׳",
      "כיתה י״א",
      "כיתה י״ב",
      "בגרות – 5 יח״ל"
    ],
    styles: [
      "תוכנית לימוד מסודרת",
      "הכנה למבחנים ולבגרויות",
      "למידה דרך דוגמאות"
    ],
    city: "חיפה",
    price: 135,
    experience: "5 שנות ניסיון",
    format: "גם אונליין וגם פרונטלי",
    availability: "ימים ב׳, ג׳ וד׳ אחר הצהריים",
    bio:
      "פרופיל הדגמה של מורה למתמטיקה ולפיזיקה. מציג תוכנית לימוד מסודרת והכנה הדרגתית למבחנים.",
    rating: 5,
    reviewCount: 31,
    photo: "",
    verified: false
  },
  {
    id: "demo-omer",
    isDemo: true,
    name: "עומר גבע",
    subjects: ["מתמטיקה", "מדעי המחשב"],
    levels: [
      "כיתה ח׳",
      "כיתה ט׳",
      "כיתה י׳",
      "בגרות – 4 יח״ל"
    ],
    styles: [
      "למידה דרך דוגמאות",
      "למידה בקצב אישי",
      "תרגול רב"
    ],
    city: "תל אביב",
    price: 110,
    experience: "4 שנות ניסיון",
    format: "גם אונליין וגם פרונטלי",
    availability: "ימים א׳–ה׳ בשעות אחר הצהריים",
    bio:
      "פרופיל הדגמה של מורה למתמטיקה ולמדעי המחשב. מציג למידה באמצעות דוגמאות ותרגול מעשי.",
    rating: 4.8,
    reviewCount: 67,
    photo: "",
    verified: false
  },
  {
    id: "demo-shira",
    isDemo: true,
    name: "שירה זיו",
    subjects: ["מתמטיקה"],
    levels: [
      "כיתה ט׳",
      "כיתה י׳",
      "כיתה י״א",
      "בגרות – 3 יח״ל",
      "בגרות – 4 יח״ל"
    ],
    styles: [
      "חיזוק ביטחון",
      "הסבר רגוע ובגובה העיניים",
      "למידה בקצב אישי"
    ],
    city: "ירושלים",
    price: 125,
    experience: "7 שנות ניסיון",
    format: "אונליין",
    availability: "ימים ב׳ וד׳ בשעות הערב",
    bio:
      "פרופיל הדגמה של מורה למתמטיקה. מציג דגש על חיזוק ביטחון, הסברים ברורים ולמידה בקצב אישי.",
    rating: 4.9,
    reviewCount: 22,
    photo: "",
    verified: false
  }
];

export function normalizeList(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter(Boolean);
  }

  if (!value) {
    return [];
  }

  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function sharedSubjects(firstSubjects, secondSubjects) {
  const first = normalizeList(firstSubjects);
  const second = normalizeList(secondSubjects);

  return first.filter((subject) =>
    second.includes(subject)
  );
}

export function calculateMatch(teacher, studentProfile) {
  if (!studentProfile) {
    return 0;
  }

  const studentSubjects = normalizeList(
    studentProfile.subjects
  );

  const teacherSubjects = normalizeList(
    teacher.subjects
  );

  if (!studentSubjects.length || !teacherSubjects.length) {
    return 0;
  }

  const commonSubjects = sharedSubjects(
    studentSubjects,
    teacherSubjects
  );

  if (!commonSubjects.length) {
    return 0;
  }

  let score = 65;

  score += Math.min(commonSubjects.length * 8, 16);

  const studentLevels = normalizeList(
    studentProfile.levels || studentProfile.level
  );

  const teacherLevels = normalizeList(teacher.levels);

  if (
    studentLevels.some((level) =>
      teacherLevels.includes(level)
    )
  ) {
    score += 7;
  }

  const studentStyles = normalizeList(
    studentProfile.styles ||
    studentProfile.learningStyle
  );

  const teacherStyles = normalizeList(teacher.styles);

  if (
    studentStyles.some((style) =>
      teacherStyles.includes(style)
    )
  ) {
    score += 7;
  }

  if (
    studentProfile.format &&
    teacher.format &&
    teacher.format.includes(studentProfile.format)
  ) {
    score += 5;
  }

  return Math.min(score, 99);
}

export function createTagPicker({
  root,
  options,
  selected = [],
  placeholder = "חיפוש...",
  maximum = 12,
  onChange = () => {}
}) {
  const rootElement =
    typeof root === "string"
      ? document.querySelector(root)
      : root;

  if (!rootElement) {
    throw new Error("Tag picker root was not found");
  }

  let selectedItems = normalizeList(selected);

  rootElement.innerHTML = `
    <div class="tag-picker-selected"></div>

    <input
      class="tag-picker-search"
      type="search"
      autocomplete="off"
      placeholder="${placeholder}"
    >

    <div class="tag-picker-options hidden"></div>
  `;

  const selectedElement = rootElement.querySelector(
    ".tag-picker-selected"
  );

  const searchElement = rootElement.querySelector(
    ".tag-picker-search"
  );

  const optionsElement = rootElement.querySelector(
    ".tag-picker-options"
  );

  function notify() {
    onChange([...selectedItems]);
  }

  function renderSelected() {
    selectedElement.innerHTML = "";

    if (!selectedItems.length) {
      const empty = document.createElement("span");
      empty.className = "tag-picker-empty";
      empty.textContent = "עדיין לא נבחרו אפשרויות";
      selectedElement.appendChild(empty);
      return;
    }

    selectedItems.forEach((item) => {
      const tag = document.createElement("button");
      tag.type = "button";
      tag.className = "tag-picker-tag";
      tag.textContent = item + " ×";
      tag.setAttribute("aria-label", "הסרת " + item);

      tag.addEventListener("click", () => {
        selectedItems = selectedItems.filter(
          (selectedItem) => selectedItem !== item
        );

        renderSelected();
        renderOptions(searchElement.value);
        notify();
      });

      selectedElement.appendChild(tag);
    });
  }

  function addItem(item) {
    if (
      selectedItems.includes(item) ||
      selectedItems.length >= maximum
    ) {
      return;
    }

    selectedItems.push(item);
    searchElement.value = "";

    renderSelected();
    renderOptions("");
    notify();

    searchElement.focus();
  }

  function renderOptions(searchValue = "") {
    const search = searchValue.trim().toLowerCase();

    const filteredOptions = options
      .filter((option) => !selectedItems.includes(option))
      .filter((option) =>
        option.toLowerCase().includes(search)
      )
      .slice(0, 30);

    optionsElement.innerHTML = "";

    if (!filteredOptions.length) {
      const empty = document.createElement("div");
      empty.className = "tag-picker-no-results";
      empty.textContent = "לא נמצאו אפשרויות";
      optionsElement.appendChild(empty);
    } else {
      filteredOptions.forEach((option) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "tag-picker-option";
        button.textContent = option;

        button.addEventListener("click", () => {
          addItem(option);
        });

        optionsElement.appendChild(button);
      });
    }

    optionsElement.classList.remove("hidden");
  }

  searchElement.addEventListener("focus", () => {
    renderOptions(searchElement.value);
  });

  searchElement.addEventListener("input", () => {
    renderOptions(searchElement.value);
  });

  searchElement.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      optionsElement.classList.add("hidden");
    }

    if (event.key === "Enter") {
      event.preventDefault();

      const firstOption = optionsElement.querySelector(
        ".tag-picker-option"
      );

      if (firstOption) {
        firstOption.click();
      }
    }
  });

  document.addEventListener("click", (event) => {
    if (!rootElement.contains(event.target)) {
      optionsElement.classList.add("hidden");
    }
  });

  renderSelected();

  return {
    getSelected() {
      return [...selectedItems];
    },

    setSelected(items) {
      selectedItems = normalizeList(items)
        .filter((item) => options.includes(item))
        .slice(0, maximum);

      renderSelected();
      renderOptions(searchElement.value);
    },

    clear() {
      selectedItems = [];
      searchElement.value = "";
      renderSelected();
      renderOptions("");
      notify();
    }
  };
}