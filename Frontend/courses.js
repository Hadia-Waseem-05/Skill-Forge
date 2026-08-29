const COURSES_API = "http://localhost:5000/api/courses/"; 
const ENROLL_API = "http://localhost:5000/api/enrollments/";

async function loadCourses() {
    const grid = document.getElementById("courseGrid");
    const errorEl = document.getElementById("coursesError");

    try {
        const res = await fetch(COURSES_API);
        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Failed to load courses");
        }

        const courses = data.data || data;

        if (!courses.length) {
            grid.innerHTML = `<p class="empty-text">No courses available yet.</p>`;
            return;
        }

        grid.innerHTML = courses.map(renderCourseCard).join("");
        attachEnrollHandlers();

    } catch (err) {
        console.error(err);
        errorEl.textContent = "Couldn't load courses. Please try again later.";
        errorEl.hidden = false;
        grid.innerHTML = "";
    }
}

function renderCourseCard(course) {
    return `
        <div class="course-card">
            <h3>${course.title}</h3>
            <p>${course.description || ""}</p>
            <button class="btn accent-btn enroll-btn" data-course-id="${course._id}">
                Enroll Now
            </button>
        </div>
    `;
}

function attachEnrollHandlers() {
    document.querySelectorAll(".enroll-btn").forEach((btn) => {
        btn.addEventListener("click", () => handleEnroll(btn));
    });
}

async function handleEnroll(btn) {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const courseId = btn.dataset.courseId;

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    if (role === "instructor") {
        alert("Instructors can't enroll in courses.");
        return;
    }

    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = "Enrolling...";

    try {
        const res = await fetch(ENROLL_API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
                body: JSON.stringify({ course_id: courseId })
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Enrollment failed");
        }

        btn.textContent = "Enrolled ✓";
        btn.classList.add("enrolled-btn");
        btn.classList.remove("accent-btn");

    } catch (err) {
        console.error(err);
        btn.disabled = false;
        btn.textContent = originalText;
        alert(err.message || "Something went wrong enrolling in this course.");
    }
}

document.addEventListener("DOMContentLoaded", loadCourses);