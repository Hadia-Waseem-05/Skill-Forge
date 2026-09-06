const API_BASE = "http://localhost:5000/api/auth";

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const errorMsg = document.getElementById("errorMsg");
const successMsg = document.getElementById("successMsg");

function showError(message) {
    errorMsg.textContent = message;
    errorMsg.hidden = false;
}

function showSuccess(message) {
    if (successMsg) {
        successMsg.textContent = message;
        successMsg.hidden = false;
    }
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
            localStorage.setItem("avatar", data.user.avatar);

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
            localStorage.setItem("avatar", data.user.avatar);

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

// ---------- FORGOT PASSWORD ----------
const forgotPasswordForm = document.getElementById("forgotPasswordForm");

if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (errorMsg) errorMsg.hidden = true;
        if (successMsg) successMsg.hidden = true;

        const submitBtn = document.getElementById("submitBtn");
        const email = document.getElementById("email").value.trim();

        submitBtn.disabled = true;
        submitBtn.textContent = "Sending...";

        try {
            const res = await fetch(`${API_BASE}/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            });

            const data = await res.json();

            if (!res.ok) {
                showError(data.message || "Something went wrong. Please try again.");
                return;
            }

            showSuccess(data.message || "Reset link sent! Please check your email.");
            forgotPasswordForm.reset();
        } catch (err) {
            showError("Something went wrong. Please try again.");
            console.error(err);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = "Send Reset Link";
        }
    });
}

// ---------- RESET PASSWORD ----------
const resetPasswordForm = document.getElementById("resetPasswordForm");

if (resetPasswordForm) {
    resetPasswordForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (errorMsg) errorMsg.hidden = true;
        if (successMsg) successMsg.hidden = true;

        const resetBtn = document.getElementById("resetBtn");
        const newPassword = document.getElementById("newPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        if (newPassword !== confirmPassword) {
            showError("Passwords do not match.");
            return;
        }

        if (newPassword.length < 6) {
            showError("Password must be at least 6 characters.");
            return;
        }

        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get("token");

        if (!token) {
            showError("Invalid or missing reset token. Please use the link from your email.");
            return;
        }

        resetBtn.disabled = true;
        resetBtn.textContent = "Resetting...";

        try {
            const res = await fetch(`${API_BASE}/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, newPassword })
            });

            const data = await res.json();

            if (!res.ok) {
                showError(data.message || "Failed to reset password.");
                return;
            }

            showSuccess("Password reset successfully! Redirecting to login...");
            setTimeout(() => {
                window.location.href = "login.html";
            }, 2000);
        } catch (err) {
            showError("Something went wrong. Please try again.");
            console.error(err);
        } finally {
            resetBtn.disabled = false;
            resetBtn.textContent = "Reset Password";
        }
    });
}