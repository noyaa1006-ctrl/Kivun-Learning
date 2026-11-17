import { safeNext } from "./routes.js";

export async function requireAccess() {
  try {
    const sdk = await import("./firebase.js");

    await sdk.auth.authStateReady();

    if (!sdk.auth.currentUser) {
      const currentPage =
        window.location.pathname.split("/").pop();

      const next = safeNext(
        currentPage + window.location.search
      );

      window.location.replace(
        "login.html?next=" + encodeURIComponent(next)
      );

      // עוצרים את טעינת העמוד עד למעבר למסך הכניסה.
      return new Promise(() => {});
    }

    document.documentElement.classList.remove(
      "access-pending"
    );

    document.getElementById("access-status")?.remove();

    sdk.onAuthStateChanged(sdk.auth, user => {
      if (!user) {
        document.documentElement.classList.add(
          "access-pending"
        );

        window.location.replace("login.html");
      }
    });
  } catch {
    const box = document.getElementById("access-status");

    if (box) {
      box.innerHTML = `
        <strong>לא הצלחנו לבדוק את הכניסה</strong>
        <p>
          בדקו את החיבור לאינטרנט ונסו לרענן את העמוד.
        </p>
        <a href="login.html">חזרה לכניסה</a>
      `;
    }

    // לא ממשיכים למסך הפנימי אם בדיקת הכניסה נכשלה.
    return new Promise(() => {});
  }
}