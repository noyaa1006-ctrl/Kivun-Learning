/*
 * כיוון — ניווט משותף
 * navigation.js
 *
 * בדפים החדשים נשתמש באלמנט:
 * <header data-site-header></header>
 *
 * הקובץ תומך גם בתפריט הישן בזמן המעבר לעיצוב החדש.
 */

function startNavigation() {
  addSkipLink();
  initializeExistingMenu();
  initializeSharedHeader();
  initializeAccessNotice();
}

/* קישור נגיש לדילוג לתוכן העמוד */

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

  const skip = document.createElement("a");

  skip.className = "skip-link site-skip-link";
  skip.href = `#${main.id}`;
  skip.textContent = "דילוג לתוכן העמוד";

  document.body.prepend(skip);
}

/* תמיכה בתפריט של הדפים הקיימים */

function initializeExistingMenu() {
  const button = document.querySelector(".menu-toggle");
  const menu = document.getElementById("public-menu");

  if (!button || !menu) return;

  connectMobileMenu(button, menu);
}

/* פתיחה וסגירה של תפריט בנייד */

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

    if (returnFocus) {
      button.focus();
    }
  }

  setOpen(false);

  button.addEventListener("click", () => {
    const open = button.getAttribute("aria-expanded") === "true";
    setOpen(!open);
  });

  menu.addEventListener("click", event => {
    if (event.target.closest("a")) {
      setOpen(false);
    }
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

  desktop.addEventListener("change", () => {
    setOpen(false);
  });
}

/* בניית הכותרת המשותפת בדפים החדשים */

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
  let accountVersion = 0;

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

  function renderLinks(items) {
    nav.replaceChildren();

    const currentPage =
      window.location.pathname.split("/").pop() || "index.html";

    for (const item of items) {
      const link = document.createElement("a");

      link.className = "site-nav-link";
      link.href = item.href;
      link.textContent = item.label;

      if (item.href === currentPage) {
        link.setAttribute("aria-current", "page");
      }

      nav.appendChild(link);
    }
  }

  function showPublicNavigation() {
    accountVersion += 1;
    closeAccountMenu = () => {};

    renderLinks([
      {
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

    renderLinks([
      {
        href: "dashboard.html",
        label: "האזור שלי"
      },
      {
        href: "matches.html",
        label: "מציאת מורה"
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
          <a href="dashboard.html">האזור האישי שלי</a>

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

    const trigger = accountArea.querySelector("#site-account-trigger");
    const menu = accountArea.querySelector("#site-account-menu");
    const nameElement = accountArea.querySelector("#site-account-name");
    const avatar = accountArea.querySelector("#site-account-avatar");
    const logoutButton = accountArea.querySelector("#site-logout");
    const status = accountArea.querySelector("#site-account-status");

    let signingOut = false;

    function updateIdentity(name, photo) {
      const displayName =
        typeof name === "string" && name.trim()
          ? name.trim()
          : "החשבון שלי";

      nameElement.textContent = displayName;

      avatar.replaceChildren();

      const initials = Array.from(displayName)[0] || "כ";
      avatar.textContent = initials;

      if (typeof photo !== "string" || !photo) return;

      let allowed = /^data:image\/(?:png|jpeg|webp|gif);base64,/i.test(
        photo
      );

      if (!allowed) {
        try {
          const url = new URL(photo);
          allowed = url.protocol === "https:";
        } catch {
          allowed = false;
        }
      }

      if (!allowed) return;

      const image = document.createElement("img");

      image.alt = "";
      image.referrerPolicy = "no-referrer";

      image.addEventListener("error", () => {
        avatar.textContent = initials;
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

    const account = accountArea.querySelector(".site-account");

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
       * דף עם שינויים שלא נשמרו יכול לעצור התנתקות
       * באמצעות האירוע kivun:before-signout.
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
        window.location.replace("login.html");
      } catch (error) {
        console.error("Sign out failed:", error?.code);

        status.textContent =
          "לא הצלחנו להתנתק. נסו שוב בעוד רגע.";

        status.hidden = false;
        signingOut = false;
        logoutButton.disabled = false;
        logoutButton.textContent = "התנתקות";
      }
    });

    updateIdentity(user.displayName, user.photoURL);

    /*
     * טעינת השם והתמונה מפרופיל האתר.
     * אם הטעינה נכשלת, תפריט החשבון נשאר זמין.
     */
    sdk.getDoc(sdk.doc(sdk.db, "users", user.uid))
      .then(snapshot => {
        if (version !== accountVersion) return;
        if (sdk.auth.currentUser?.uid !== user.uid) return;
        if (!snapshot.exists()) return;

        const profile = snapshot.data();

        updateIdentity(
          profile.name || user.displayName,
          profile.photo || user.photoURL
        );
      })
      .catch(error => {
        console.error("Navigation profile load failed:", error?.code);
      });

    /*
     * מאפשר לעמוד הפרופיל לעדכן את הכותרת לאחר שמירה.
     */
    return details => {
      if (version !== accountVersion) return;

      updateIdentity(details.name, details.photo);
    };
  }

  let updateHeaderProfile = null;

  window.addEventListener("kivun:profile-updated", event => {
    if (event.detail && updateHeaderProfile) {
      updateHeaderProfile(event.detail);
    }
  });

  const loadingTimer = window.setTimeout(() => {
    const waiting = accountArea.querySelector("[role='status']");

    if (waiting) {
      waiting.textContent = "בדיקת ההתחברות מתעכבת…";
    }
  }, 12000);

  try {
    const sdk = await import("./firebase.js");

    await sdk.auth.authStateReady();

    window.clearTimeout(loadingTimer);

    const unsubscribe = sdk.onAuthStateChanged(
      sdk.auth,
      user => {
        if (user) {
          updateHeaderProfile = showSignedInNavigation(user, sdk);
        } else {
          updateHeaderProfile = null;
          showPublicNavigation();
        }
      }
    );

    window.addEventListener("pagehide", event => {
      if (!event.persisted) {
        unsubscribe();
      }
    }, { once: true });
  } catch (error) {
    window.clearTimeout(loadingTimer);

    console.error("Navigation initialization failed:", error);

    renderLinks([
      {
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

/* הודעה במקרה שבדיקת ההתחברות בעמוד מתעכבת */

function initializeAccessNotice() {
  window.setTimeout(() => {
    const box = document.getElementById("access-status");

    const waiting = document.documentElement.classList.contains(
      "access-pending"
    );

    if (!box || !waiting) return;

    const heading = box.querySelector("strong");
    const description = box.querySelector("p");

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