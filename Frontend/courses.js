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
        updateCourseCards();

    } catch (err) {
        console.error(err);
        errorEl.textContent = "Couldn't load courses. Please try again later.";
        errorEl.hidden = false;
        grid.innerHTML = "";
    }
}

function renderCourseCard(course) {
    const thumbnail = course.thumbnail || "https://placehold.co/600x400/D6E6F2/333333?text=Course";
    const instructorId = course.instructor_id?._id || course.instructor_id || "";
    return `
        <div class="course-card" data-course-id="${course._id}" data-instructor-id="${instructorId}">
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

async function updateCourseCards() {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const userId = localStorage.getItem("userId");

    if (!token || !role || !userId) return;

    const cards = document.querySelectorAll(".course-card");
    if (!cards.length) return;

    let enrolledIds = new Set();
    if (role === "student") {
        try {
            const enrollments = await getMyEnrollments();
            enrollments.forEach((e) => {
                const cid = e.course_id?._id || e.course_id;
                if (cid) enrolledIds.add(cid.toString());
            });
        } catch (err) {
            console.error("Failed to fetch enrollments:", err);
            return;
        }
    }

    const enrolledCards = Array.from(cards).filter((card) =>
        enrolledIds.has(card.dataset.courseId)
    );

    const progressResults = await Promise.all(
        enrolledCards.map((card) =>
            getCourseProgress(card.dataset.courseId).catch(() => ({
                percentage: 0,
                completed_lessons: 0,
                total_lessons: 0,
            }))
        )
    );

    const progressMap = {};
    enrolledCards.forEach((card, i) => {
        progressMap[card.dataset.courseId] = progressResults[i];
    });

    cards.forEach((card) => {
        const courseId = card.dataset.courseId;
        const instructorId = card.dataset.instructorId;
        const isInstructorOwner = role === "instructor" && instructorId === userId;
        const isEnrolled = enrolledIds.has(courseId);

        const existingBtn = card.querySelector(".enroll-btn");
        const existingBadge = card.querySelector(".course-owner-badge");
        const existingProgress = card.querySelector(".course-progress-wrap");
        if (existingBtn) existingBtn.remove();
        if (existingBadge) existingBadge.remove();
        if (existingProgress) existingProgress.remove();

        if (isInstructorOwner) {
            const badge = document.createElement("span");
            badge.className = "badge badge-owner course-owner-badge";
            badge.textContent = "Your Course";
            badge.style.cursor = "pointer";
            badge.title = "Go to instructor dashboard";
            badge.addEventListener("click", (e) => {
                e.stopPropagation();
                window.location.href = "dashboard-instructor.html";
            });
            card.querySelector("h3").after(badge);
        } else if (isEnrolled) {
            const progress = progressMap[courseId] || { percentage: 0 };
            const progressWrap = document.createElement("div");
            progressWrap.className = "course-progress-wrap";
            progressWrap.innerHTML = `
                <div class="progress-bar-bg">
                    <div class="progress-bar-fill" style="width: ${progress.percentage}%;"></div>
                </div>
                <span class="progress-text">${progress.percentage}% complete</span>
            `;
            card.querySelector("p").after(progressWrap);
        } else {
            const btn = document.createElement("button");
            btn.className = "btn accent-btn enroll-btn";
            btn.dataset.courseId = courseId;
            btn.textContent = "Enroll Now";
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                handleEnroll(btn);
            });
            card.querySelector("p").after(btn);
        }
    });
}

let pendingEnrollCourseId = null;

async function handleEnroll(btn) {
    hideCoursesError();
    hideEnrollSuccess();

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const courseId = btn.dataset.courseId;

    if (!token) {
        showCoursesError("Please login to enroll in this course.");
        return;
    }

    if (role === "instructor") {
        showCoursesError("Instructors cannot enroll in courses.");
        return;
    }

    pendingEnrollCourseId = courseId;
    openEnrollModal();
}

function openEnrollModal() {
    document.getElementById("enrollModal").hidden = false;
}

function closeEnrollModal() {
    document.getElementById("enrollModal").hidden = true;
}

async function confirmEnroll() {
    closeEnrollModal();
    const courseId = pendingEnrollCourseId;
    if (!courseId) return;

    const btn = document.querySelector(`.enroll-btn[data-course-id="${courseId}"]`);
    const originalText = btn ? btn.textContent : "Enroll Now";
    if (btn) {
        btn.disabled = true;
        btn.textContent = "Enrolling...";
    }

    try {
        await enrollInCourse(courseId);
        hideCoursesError();
        showEnrollSuccess();
        updateCourseCards();
    } catch (err) {
        console.error(err);
        if (btn) {
            btn.disabled = false;
            btn.textContent = originalText;
        }
        showCoursesError(err.message || "Something went wrong enrolling in this course.");
    }
}

function showEnrollSuccess() {
    const el = document.getElementById("enrollSuccess");
    el.textContent = "Congrats! You are enrolled in this course.";
    el.hidden = false;
}

function hideEnrollSuccess() {
    const el = document.getElementById("enrollSuccess");
    if (el) el.hidden = true;
}

document.addEventListener("DOMContentLoaded", () => {
    loadCourses();

    const cancelBtn = document.getElementById("enrollCancelBtn");
    const confirmBtn = document.getElementById("enrollConfirmBtn");
    if (cancelBtn) cancelBtn.addEventListener("click", closeEnrollModal);
    if (confirmBtn) confirmBtn.addEventListener("click", confirmEnroll);
});
