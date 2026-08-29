function initFooter() {
    const placeholder = document.getElementById("footer-placeholder");
    if (!placeholder) return;

    placeholder.innerHTML = `
        <footer class="footer">
            <div class="footer-content">
                <div class="footer-brand">
                    <div class="footer-logo">SkillForge</div>
                    <p class="footer-tagline">Learn new skills, track your progress, and earn certificates.</p>
                </div>

                <div class="footer-links">
                    <h4>Quick Links</h4>
                    <ul>
                        <li><a href="index.html">Home</a></li>
                        <li><a href="index.html#courses">Courses</a></li>
                        <li><a href="index.html#about">About Us</a></li>
                    </ul>
                </div>

                <div class="footer-links">
                    <h4>Account</h4>
                    <ul>
                        <li><a href="login.html">Login</a></li>
                        <li><a href="register.html">Register</a></li>
                    </ul>
                </div>

                <div class="footer-links">
                    <h4>Support</h4>
                    <ul>
                        <li><a href="#">Help Center</a></li>
                        <li><a href="#">Contact Us</a></li>
                        <li><a href="#">FAQs</a></li>
                    </ul>
                </div>
            </div>

            <div class="footer-bottom">
                <p>&copy; ${new Date().getFullYear()} SkillForge. All rights reserved.</p>
            </div>
        </footer>
    `;
}

document.addEventListener("DOMContentLoaded", initFooter);