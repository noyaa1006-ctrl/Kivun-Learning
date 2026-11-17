const destinations = new Set([
  "dashboard.html",
  "matches.html",
  "teacher-profile.html",
  "chat.html"
]);

export function safeNext(value) {
  if (!value || /[\\\r\n]/.test(value)) {
    return "dashboard.html";
  }

  try {
    const base = new URL("./", window.location.href);
    const url = new URL(value, base);

    if (
      url.origin !== base.origin ||
      !url.pathname.startsWith(base.pathname)
    ) {
      return "dashboard.html";
    }

    const filename = url.pathname.slice(base.pathname.length);

    if (!destinations.has(filename)) {
      return "dashboard.html";
    }

    return filename + url.search;
  } catch {
    return "dashboard.html";
  }
}