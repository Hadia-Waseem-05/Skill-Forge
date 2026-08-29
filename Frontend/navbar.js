function initNavbar() {
    const placeholder = document.getElementById("navbar-placeholder");
    if (!placeholder) return;

    const token = localStorage.getItem("token");
    const name = localStorage.getItem("name");
    const role = localStorage.getItem("role");

    const dashboardUrl = role === "instructor" ? "dashboard-instructor.html" : "dashboard-student.html";

    const authSection = token && name
        ? `
            <li class="nav-user">
                <a href="${dashboardUrl}" class="nav-username">Hi, ${name.split(" ")[0]}</a>
            </li>
            <li><button id="logoutBtn" class="btn nav-logout-btn">Logout</button></li>
          `
        : `<li><a href="login.html" class="btn nav-login-btn">Login</a></li>`;

    placeholder.innerHTML = `
        <nav class="navbar">
            <div class="logo">
            <a href="index.html"><image src="skillforge.png" class="nav-logo"/></a></div>
            <ul class="nav-links">
                <li><a href="index.html">Home</a></li>
                <li><a href="index.html#courses" class="nav-scroll-link" data-target="courses">Courses</a></li>
                <li><a href="index.html#about" class="nav-scroll-link" data-target="about">About Us</a></li>
                ${authSection}
            </ul>
        </nav>
    `;

    if (token && name) {
        document.getElementById("logoutBtn").addEventListener("click", logoutUser);
    }

    attachScrollLinks();
}

function logoutUser() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    localStorage.removeItem("name");
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