const API_BASE = "http://localhost:5000/api/auth";

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const errorMsg = document.getElementById("errorMsg");

function showError(message) {
    errorMsg.textContent = message;
    errorMsg.hidden = false;
}

function redirectByRole(role) {
    if (role === "instructor") {
        window.location.href = "dashboard-instructor.html";
    } else {
        window.location.href = "dashboard-student.html";
    }
}

// ---------- LOGIN ----------
if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        errorMsg.hidden = true;

        const loginBtn = document.getElementById("loginBtn");
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        loginBtn.disabled = true;
        loginBtn.textContent = "Logging in...";

        try {
            const res = await fetch(`${API_BASE}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (!res.ok) {
                showError(data.message || "Invalid email or password.");
                return;
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem("role", data.user.role);
            localStorage.setItem("userId", data.user.id);
            localStorage.setItem("name", data.user.name);

            redirectByRole(data.user.role);
        } catch (err) {
            showError("Something went wrong. Please try again.");
            console.error(err);
        } finally {
            loginBtn.disabled = false;
            loginBtn.textContent = "Login";
        }
    });
}

// ---------- REGISTER ----------
if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        errorMsg.hidden = true;

        const registerBtn = document.getElementById("registerBtn");
        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const role = document.querySelector('input[name="role"]:checked').value;

        registerBtn.disabled = true;
        registerBtn.textContent = "Creating account...";

        try {
            const res = await fetch(`${API_BASE}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password, role })
            });

            const data = await res.json();

            if (!res.ok) {
                showError(data.message || "Registration failed.");
                return;
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem("role", data.user.role);
            localStorage.setItem("userId", data.user.id);
            localStorage.setItem("name", data.user.name);

            redirectByRole(data.user.role);
        } catch (err) {
            showError("Something went wrong. Please try again.");
            console.error(err);
        } finally {
            registerBtn.disabled = false;
            registerBtn.textContent = "Create Account";
        }
    });
}