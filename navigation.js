const toggle = document.querySelector(".menu-toggle");
const menu = document.getElementById("public-menu");

function closeMenu() {
  toggle?.setAttribute("aria-expanded", "false");
  menu?.classList.remove("is-open");
}

if (toggle && menu) {
  toggle.addEventListener("click", () => {
    const open =
      toggle.getAttribute("aria-expanded") !== "true";

    toggle.setAttribute("aria-expanded", String(open));
    menu.classList.toggle("is-open", open);
  });

  menu.addEventListener("click", event => {
    if (event.target.closest("a")) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", event => {
    if (
      event.key === "Escape" &&
      toggle.getAttribute("aria-expanded") === "true"
    ) {
      closeMenu();
      toggle.focus();
    }
  });

  document.addEventListener("click", event => {
    if (
      !menu.contains(event.target) &&
      !toggle.contains(event.target)
    ) {
      closeMenu();
    }
  });
}

// קישור המאפשר למשתמשי מקלדת להגיע ישירות לתוכן.
const main =
  document.querySelector("main") ||
  document.querySelector(".hero-grid");

if (main) {
  if (!main.id) {
    main.id = "main-content";
  }

  main.tabIndex = -1;

  const skip = document.createElement("a");

  skip.className = "skip-link";
  skip.href = "#" + main.id;
  skip.textContent = "דילוג לתוכן";

  document.body.prepend(skip);
}

// הודעה למקרה שבדיקת ההתחברות מתעכבת.
setTimeout(() => {
  const box = document.getElementById("access-status");

  const waiting =
    document.documentElement.classList.contains(
      "access-pending"
    );

  if (!box || !waiting) {
    return;
  }

  const heading = box.querySelector("strong");
  const description = box.querySelector("p");

  if (heading) {
    heading.textContent = "בדיקת הכניסה מתעכבת";
  }

  if (description) {
    description.textContent =
      "בדקו את החיבור לאינטרנט. אפשר לרענן או לחזור למסך הכניסה.";
  }
}, 12000);