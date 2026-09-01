const Kivun = {
  key: "kivunAccounts",
  currentKey: "kivunCurrentUser",

  all() {
    try {
      return JSON.parse(localStorage.getItem(this.key) || "[]");
    } catch {
      return [];
    }
  },

  save(accounts) {
    localStorage.setItem(this.key, JSON.stringify(accounts));
  },

  current() {
    const id = localStorage.getItem(this.currentKey);
    return this.all().find((account) => account.id === id) || null;
  },

  create(data) {
    const account = {
      ...data,
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      createdAt: new Date().toISOString(),
      verified: false,
    };

    const accounts = this.all();
    accounts.push(account);
    this.save(accounts);
    localStorage.setItem(this.currentKey, account.id);

    return account;
  },

  update(data) {
    const current = this.current();

    if (!current) {
      return null;
    }

    const accounts = this.all();
    const index = accounts.findIndex(
      (account) => account.id === current.id
    );

    accounts[index] = {
      ...current,
      ...data,
      id: current.id,
    };

    this.save(accounts);
    return accounts[index];
  },

  teachers() {
    return this.all().filter(
      (account) => account.role === "teacher"
    );
  },

  esc(value = "") {
    const element = document.createElement("div");
    element.textContent = value;
    return element.innerHTML;
  },
};

function nav(active) {
  document.write(`
    <nav class="container nav">
      <a class="brand" href="index.html">
        <span class="mark">↗</span>
        כיוון
      </a>

      <div class="nav-links">
        <a class="${active === "home" ? "active" : ""}"
           href="index.html">
          בית
        </a>

        <a class="${active === "matches" ? "active" : ""}"
           href="matches.html">
          מורים
        </a>

        <a href="join.html">הרשמה</a>

        <a class="${active === "dashboard" ? "active" : ""}"
           href="dashboard.html">
          האזור שלי
        </a>
      </div>
    </nav>
  `);
}

function footer() {
  document.write(`
    <footer class="footer">
      <div class="container">
        כיוון — החיבור הנכון ללמידה · כל הפרופילים באתר
        נוצרים על ידי המשתמשים עצמם
      </div>
    </footer>
  `);
}
