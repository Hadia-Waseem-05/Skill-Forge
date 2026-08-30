function initNavbar() {
    const placeholder = document.getElementById("navbar-placeholder");
    if (!placeholder) return;

    const token = localStorage.getItem("token");
    const name = localStorage.getItem("name");
    const role = localStorage.getItem("role");
    const avatar = localStorage.getItem("avatar");

    const dashboardUrl = role === "instructor" ? "dashboard-instructor.html" : "dashboard-student.html";

    const authSection = token && name
        ? `
            <li><a href="${dashboardUrl}" class="nav-links">Dashboard</a></li>
            <li class="nav-user">
                <img class="nav-avatar" src="${avatar}" alt="user avatar"/>
                <div class="nav-username">Hi, ${name.split(" ")[0]}</div>
            </li>
            <li><button id="logoutBtn" class="btn nav-logout-btn">Logout</button></li>
          `
        : `<li><a href="login.html" class="btn nav-login-btn">Login</a></li>`;

    // ---- Bottom tab bar (mobile only) ----
    const authTab = token && name
        ? `
            <a href="${dashboardUrl}" class="bottom-nav-item">
                ${icon("dashboard")}
                <span>Dashboard</span>
            </a>
            <button id="logoutBtnMobile" class="bottom-nav-item">
                ${icon("logout")}
                <span>Logout</span>
            </button>
          `
        : `
            <a href="login.html" class="bottom-nav-item">
                ${icon("login")}
                <span>Login</span>
            </a>
          `;

    placeholder.innerHTML = `
        <nav class="navbar">
            <div class="logo">
                <a href="index.html"><img src="skillforge.png" class="nav-logo" alt="SkillForge"/></a>
            </div>
            <ul class="nav-links">
                <li><a href="index.html">Home</a></li>
                <li><a href="index.html#courses" class="nav-scroll-link" data-target="courses">Courses</a></li>
                <li><a href="index.html#about" class="nav-scroll-link" data-target="about">About Us</a></li>
                ${authSection}
            </ul>
        </nav>

        <nav class="bottom-nav">
            <a href="index.html" class="bottom-nav-item">
                ${icon("home")}
                <span>Home</span>
            </a>
            <a href="index.html#courses" class="bottom-nav-item nav-scroll-link" data-target="courses">
                ${icon("courses")}
                <span>Courses</span>
            </a>
            <a href="index.html#about" class="bottom-nav-item nav-scroll-link" data-target="about">
                ${icon("about")}
                <span>About</span>
            </a>
            ${authTab}
        </nav>
    `;

    if (token && name) {
        document.getElementById("logoutBtn").addEventListener("click", logoutUser);
        document.getElementById("logoutBtnMobile")?.addEventListener("click", logoutUser);
    }

    highlightActiveTab();
    attachScrollLinks();
}

function icon(name) {
    const icons = {
        home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></svg>`,
        courses: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
        about: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`,
        dashboard: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>`,
        login: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><path d="M10 17l5-5-5-5"/><path d="M15 12H3"/></svg>`,
        logout: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>`,
    };
    return icons[name] || "";
}

function highlightActiveTab() {
    const onIndexPage = window.location.pathname.endsWith("index.html") || window.location.pathname === "/";
    if (!onIndexPage) return;
    const homeTab = document.querySelector('.bottom-nav-item[href="index.html"]');
    if (homeTab && !window.location.hash) homeTab.classList.add("active");
}

function logoutUser() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    localStorage.removeItem("name");
    localStorage.removeItem("avatar");
    window.location.href = "login.html";
}

function attachScrollLinks() {
    document.querySelectorAll(".nav-scroll-link").forEach((link) => {
        link.addEventListener("click", (e) => {
            const targetId = link.dataset.target;
            const onIndexPage =
                window.location.pathname.endsWith("index.html") ||
                window.location.pathname === "/";

            if (onIndexPage) {
                const targetEl = document.getElementById(targetId);
                if (targetEl) {
                    e.preventDefault();
                    targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
                    document.querySelectorAll(".bottom-nav-item").forEach(el => el.classList.remove("active"));
                    link.classList.add("active");
                }
            }
        });
    });
}

window.addEventListener("load", () => {
    if (window.location.hash) {
        const target = document.getElementById(window.location.hash.substring(1));
        if (target) {
            setTimeout(() => {
                target.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 100);
        }
    }
});

document.addEventListener("DOMContentLoaded", initNavbar);