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
        attachCardHandlers();
        attachEnrollHandlers();
        setupScrollReveal();

    } catch (err) {
        console.error(err);
        errorEl.textContent = "Couldn't load courses. Please try again later.";
        errorEl.hidden = false;
        grid.innerHTML = "";
    }
}

function renderCourseCard(course) {
    const thumbnail = course.thumbnail || "https://placehold.co/600x400/D6E6F2/333333?text=Course";
    return `
        <div class="course-card" data-course-id="${course._id}">
            <img src="${thumbnail}" alt="${course.title}" class="course-thumbnail">
            <h3>${course.title}</h3>
            <p>${course.description || ""}</p>
            <button class="btn accent-btn enroll-btn" data-course-id="${course._id}">
                Enroll Now
            </button>
        </div>
    `;
}

function attachCardHandlers() {
    document.querySelectorAll(".course-card").forEach((card) => {
        card.addEventListener("click", () => {
            const courseId = card.dataset.courseId;
            window.location.href = `course-details.html?id=${courseId}`;
        });
    });
}

function attachEnrollHandlers() {
    document.querySelectorAll(".enroll-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation(); 
            handleEnroll(btn);
        });
    });
}

function setupScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
    });

    document.querySelectorAll(".course-card").forEach((card) => {
        observer.observe(card);
    });
}

function showCoursesError(message) {
    const errorEl = document.getElementById("coursesError");
    errorEl.textContent = message;
    errorEl.hidden = false;
    errorEl.scrollIntoView({ behavior: "smooth", block: "center" });
}

function hideCoursesError() {
    document.getElementById("coursesError").hidden = true;
}

async function handleEnroll(btn) {
    hideCoursesError();

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const courseId = btn.dataset.courseId;

    if (!token) {
        showCoursesError("Please login to enroll in this course.");
        return;
    }

    if (role === "instructor") {
        showCoursesError("Instructors can't enroll in a course.");
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
        showCoursesError(err.message || "Something went wrong enrolling in this course.");
    }
}

document.addEventListener("DOMContentLoaded", loadCourses);