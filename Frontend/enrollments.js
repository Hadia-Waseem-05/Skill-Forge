const API_BASE = "http://localhost:5000/api";

function getAuthHeaders() {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

async function apiFetch(path, options = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: { ...getAuthHeaders(), ...options.headers },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
    return data;
}

async function enrollInCourse(courseId) {
    return apiFetch(`/enrollments`, {
        method: "POST",
        body: JSON.stringify({ course_id: courseId }),
    });
}

async function getMyEnrollments() {
    const data = await apiFetch(`/enrollments/my`);
    return data.data || [];
}

async function getCourseProgress(courseId) {
    const data = await apiFetch(`/progress/course/${courseId}`);
    return data.data || { completed_lessons: 0, total_lessons: 0, percentage: 0 };
}

async function getLessonProgressForCourse(courseId) {
    const data = await apiFetch(`/progress/course/${courseId}/lessons`);
    return data.data || [];
}

async function getStudentsProgressForCourse(courseId) {
    const data = await apiFetch(`/progress/course/${courseId}/students`);
    return data.data || [];
}

async function deleteAccount(userId) {
    return apiFetch(`/auth/${userId}`, { method: "DELETE" });
}

// ---- Courses (instructor) ----
async function getMyCoursesApi() {
    const data = await apiFetch(`/courses/my`);
    return data.data || [];
}

async function updateCourseApi(courseId, payload) {
    return apiFetch(`/courses/${courseId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
}

async function deleteCourseApi(courseId) {
    return apiFetch(`/courses/${courseId}`, { method: "DELETE" });
}

// ---- Lessons ----
async function getLessonsByCourse(courseId) {
    const data = await apiFetch(`/lessons/course/${courseId}`);
    return data.data || [];
}

async function getLessonApi(lessonId) {
    const data = await apiFetch(`/lessons/${lessonId}`);
    return data.data || null;
}

async function createLessonApi(payload) {
    const data = await apiFetch(`/lessons`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
    return data.data || {};
}

async function updateLessonApi(lessonId, payload) {
    const data = await apiFetch(`/lessons/${lessonId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
    return data.data || {};
}

async function deleteLessonApi(lessonId) {
    return apiFetch(`/lessons/${lessonId}`, { method: "DELETE" });
}

// ---- Enrollments (instructor roster) ----
async function getEnrollmentsForCourse(courseId) {
    const data = await apiFetch(`/enrollments/course/${courseId}`);
    return data.data || [];
}

// ---- Progress ----
// NOTE TO BACKEND: markLessonComplete only marks a lesson complete.
// There is no "unmark" endpoint, so the UI must not offer an undo/toggle-off.
async function markLessonComplete(lessonId) {
    return apiFetch(`/progress/lesson/${lessonId}/complete`, { method: "POST" });
}

async function completeQuizAndFinishCourse(courseId) {
    const data = await apiFetch(`/progress/course/${courseId}/complete-quiz`, {
        method: "POST",
    });
    return data.data || {};
}
