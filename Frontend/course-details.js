const API_COURSES = "http://localhost:5000/api/courses";
const API_ENROLLMENTS = "http://localhost:5000/api/enrollments";

function getCourseIdFromUrl() {
    return new URLSearchParams(window.location.search).get("id");
}

function showCourseError(message) {
    const errorBox = document.getElementById("courseErrorMsg");
    errorBox.textContent = message;
    errorBox.hidden = false;
    errorBox.scrollIntoView({ behavior: "smooth", block: "center" });
}

function hideCourseError() {
    document.getElementById("courseErrorMsg").hidden = true;
}

async function loadCourse() {
    const courseId = getCourseIdFromUrl();
    if (!courseId) {
        showCourseError("Course not found.");
        return;
    }

    const token = localStorage.getItem("token");

    try {
        const res = await fetch(`${API_COURSES}/${courseId}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();

        if (!res.ok) {
            showCourseError(data.message || "Could not load this course.");
            return;
        }

        renderCourse(data.data.course, data.data.lessons);
        await checkEnrollmentStatus(courseId);
    } catch (err) {
        console.error(err);
        showCourseError("Something went wrong while loading the course.");
    }
}

function renderCourse(course, lessons) {
    document.title = `${course.title} - SkillForge`;

    const thumbnail = document.getElementById("courseThumbnail");
    thumbnail.src = course.thumbnail;
    thumbnail.alt = course.title;

    document.getElementById("courseTitle").textContent = course.title;
    document.getElementById("courseDescription").textContent = course.description;

    const lessonsList = document.getElementById("lessonsList");
    lessonsList.innerHTML = lessons.length
        ? lessons.map((lesson, index) => `
            <li class="lesson-item">
                <span class="lesson-number">${index + 1}</span>
                <span class="lesson-item-title">${lesson.title}</span>
            </li>
        `).join("")
        : `<li class="empty-text">No lessons added yet.</li>`;

    const instructor = course.instructor_id;
    document.getElementById("instructorAvatar").src =
        instructor?.avatar || "https://api.dicebear.com/7.x/initials/svg?seed=Instructor";
    document.getElementById("instructorName").textContent = instructor?.name || "Unknown instructor";
    document.getElementById("instructorBio").textContent =
        instructor?.bio || "This instructor hasn't added a bio yet.";
}

async function checkEnrollmentStatus(courseId) {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (!token || role !== "student") return;

    try {
        const res = await fetch(`${API_ENROLLMENTS}/my`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (res.ok) {
            const alreadyEnrolled = data.data.some((e) => e.course_id?._id === courseId);
            if (alreadyEnrolled) setEnrolledState();
        }
    } catch (err) {
        console.error(err);
    }
}

function setEnrolledState() {
    const enrollBtn = document.getElementById("enrollBtn");
    enrollBtn.textContent = "Enrolled";
    enrollBtn.classList.remove("accent-btn");
    enrollBtn.classList.add("enrolled-btn");
    enrollBtn.disabled = true;
}

function initEnrollButton() {
    const enrollBtn = document.getElementById("enrollBtn");
    if (!enrollBtn) return;

    enrollBtn.addEventListener("click", async () => {
        hideCourseError();

        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");
        const courseId = getCourseIdFromUrl();

        if (!token) {
            showCourseError("Please login to enroll in this course.");
            return;
        }

        if (role === "instructor") {
            showCourseError("Instructors can't enroll in a course.");
            return;
        }

        enrollBtn.disabled = true;
        enrollBtn.textContent = "Enrolling...";

        try {
            const res = await fetch(API_ENROLLMENTS, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ course_id: courseId }),
            });
            const data = await res.json();

            if (!res.ok) {
                showCourseError(data.message || "Could not enroll in this course.");
                enrollBtn.disabled = false;
                enrollBtn.textContent = "Enroll Now";
                return;
            }

            setEnrolledState();
        } catch (err) {
            console.error(err);
            showCourseError("Something went wrong. Please try again.");
            enrollBtn.disabled = false;
            enrollBtn.textContent = "Enroll Now";
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    loadCourse();
    initEnrollButton();
});