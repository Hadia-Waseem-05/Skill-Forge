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
