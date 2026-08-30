import Quiz from "../quiz/Quiz.js";
import QuizAttempt from "../models/QuizAttempt.js";
import calculateScore, { PASSING_PERCENTAGE } from "../quiz/scoreLogic.js";
import Courses from "../models/Courses.js";
import Enrollments from "../models/Enrollments.js";
import Lessons from "../models/Lessons.js";
import Progress from "../models/Progress.js";
import { completeQuizAndFinishCourse } from "../controllers/enrollmentController.js";

const getCourseAndCheckOwnership = async (courseId, userId) => {
    const course = await Courses.findById(courseId);
    if (!course) return { error: { status: 404, message: "Course not found" } };
    if (course.instructor_id.toString() !== userId) {
        return { error: { status: 403, message: "You are not authorized" } };
    }
    return { course };
};

const stripQuizForStudent = (quiz) => ({
    _id: quiz._id,
    course_id: quiz.course_id,
    questions: quiz.questions.map(({ questionText, options, _id }) => ({
        questionText,
        options,
        _id,
    })),
});

// GET /quiz/:course_id  — students get stripped quiz, owning instructor gets full quiz
const getQuiz = async (req, res) => {
    try {
        const { course_id } = req.params;
        const quiz = await Quiz.findOne({ course_id });

        if (!quiz) {
            return res.status(404).json({ status: false, message: "Quiz not found" });
        }

        const course = await Courses.findById(course_id);
        if (!course) {
            return res.status(404).json({ status: false, message: "Course not found" });
        }

        const isOwner = req.user && course.instructor_id.toString() === req.user.id;

        if (!isOwner) {
            return res.status(200).json({ status: true, data: stripQuizForStudent(quiz) });
        }

        res.status(200).json({ status: true, data: quiz });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// GET /quiz/:course_id/status  — returns attempt status for the logged-in student
const getQuizAttemptStatus = async (req, res) => {
    try {
        const { course_id } = req.params;

        const attempts = await QuizAttempt.find({
            student_id: req.user.id,
            course_id,
        }).sort({ submitted_at: -1 });

        if (!attempts.length) {
            return res.status(200).json({
                status: true,
                data: { attempted: false, passed: false, score: null, total: null },
            });
        }

        const latest = attempts[0];
        res.status(200).json({
            status: true,
            data: {
                attempted: true,
                passed: latest.passed,
                score: latest.score,
                total: latest.total,
            },
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// POST /quiz/:course_id/submit  — submit quiz answers
const submitQuiz = async (req, res) => {
    try {
        const { course_id } = req.params;
        const quiz = await Quiz.findOne({ course_id });

        if (!quiz) {
            return res.status(404).json({ status: false, message: "Quiz not found" });
        }

        // --- Lesson-completion gate ---
        const enrollment = await Enrollments.findOne({
            student_id: req.user.id,
            course_id,
        });

        if (!enrollment) {
            return res.status(403).json({ status: false, message: "You are not enrolled in this course" });
        }

        const totalLessons = await Lessons.countDocuments({ course_id });
        const completedLessons = await Progress.countDocuments({
            enrollment_id: enrollment._id,
            completed: true,
        });

        if (completedLessons < totalLessons) {
            return res
                .status(403)
                .json({ status: false, message: "Complete all lessons before taking the quiz" });
        }

        // --- Reject resubmission if already passed ---
        const existingPass = await QuizAttempt.findOne({
            student_id: req.user.id,
            course_id,
            passed: true,
        });

        if (existingPass) {
            return res.status(400).json({
                status: false,
                message: "You have already passed this quiz",
                data: {
                    score: existingPass.score,
                    total: existingPass.total,
                    passed: existingPass.passed,
                    submitted_at: existingPass.submitted_at,
                    attempt_id: existingPass._id,
                },
            });
        }

        const correctAnswers = quiz.questions.map((q) => q.correctAnswer);
        const userAnswers = req.body.answers || [];
        const score = calculateScore(userAnswers, correctAnswers);
        const total = correctAnswers.length;
        const passed = score >= total * PASSING_PERCENTAGE;

        const attempt = await QuizAttempt.create({
            student_id: req.user.id,
            course_id,
            score,
            total,
            passed,
            submitted_at: new Date(),
        });

        let progressData = null;
        if (passed) {
            const fakeRes = {
                status() {
                    return this;
                },
                json(data) {
                    progressData = data;
                },
            };
            await completeQuizAndFinishCourse(req, fakeRes);
        }

        res.status(200).json({
            status: true,
            data: {
                score,
                total,
                passed,
                attempt_id: attempt._id,
                submitted_at: attempt.submitted_at,
                progress: progressData,
            },
        });
    } catch (error) {
        res.status(500).json({ message: "Submission failed", error: error.message });
    }
};

// POST /quiz  — create a quiz (instructor owns the course)
const createQuiz = async (req, res) => {
    try {
        const { course_id, questions } = req.body;

        if (
            !course_id ||
            !questions ||
            !Array.isArray(questions) ||
            questions.length === 0
        ) {
            return res
                .status(400)
                .json({ status: false, message: "course_id and a non-empty questions array are required" });
        }

        for (const q of questions) {
            if (!q.questionText || !Array.isArray(q.options) || q.options.length < 2 || !q.correctAnswer) {
                return res
                    .status(400)
                    .json({ status: false, message: "Each question needs questionText, options (min 2), and correctAnswer" });
            }

            if (!q.options.includes(q.correctAnswer)) {
                return res
                    .status(400)
                    .json({ status: false, message: "correctAnswer must be one of the provided options" });
            }
        }

        const { error } = await getCourseAndCheckOwnership(course_id, req.user.id);
        if (error) {
            return res.status(error.status).json({ status: false, message: error.message });
        }

        const existing = await Quiz.findOne({ course_id });
        if (existing) {
            return res.status(400).json({ status: false, message: "A quiz already exists for this course" });
        }

        const quiz = await Quiz.create({ course_id, questions });

        res.status(201).json({ status: true, data: quiz });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// PUT /quiz/:course_id  — update a quiz (instructor owns the course)
const updateQuiz = async (req, res) => {
    try {
        const { course_id } = req.params;
        const { questions } = req.body;

        if (!questions || !Array.isArray(questions) || questions.length === 0) {
            return res
                .status(400)
                .json({ status: false, message: "A non-empty questions array is required" });
        }

        for (const q of questions) {
            if (!q.questionText || !Array.isArray(q.options) || q.options.length < 2 || !q.correctAnswer) {
                return res
                    .status(400)
                    .json({ status: false, message: "Each question needs questionText, options (min 2), and correctAnswer" });
            }

            if (!q.options.includes(q.correctAnswer)) {
                return res
                    .status(400)
                    .json({ status: false, message: "correctAnswer must be one of the provided options" });
            }
        }

        const { error } = await getCourseAndCheckOwnership(course_id, req.user.id);
        if (error) {
            return res.status(error.status).json({ status: false, message: error.message });
        }

        const updated = await Quiz.findOneAndUpdate(
            { course_id },
            { questions },
            { new: true, runValidators: true }
        );

        if (!updated) {
            return res.status(404).json({ status: false, message: "Quiz not found" });
        }

        res.status(200).json({ status: true, data: updated });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// DELETE /quiz/:course_id  — delete a quiz (instructor owns the course)
const deleteQuiz = async (req, res) => {
    try {
        const { course_id } = req.params;

        const { error } = await getCourseAndCheckOwnership(course_id, req.user.id);
        if (error) {
            return res.status(error.status).json({ status: false, message: error.message });
        }

        const deleted = await Quiz.findOneAndDelete({ course_id });

        if (!deleted) {
            return res.status(404).json({ status: false, message: "Quiz not found" });
        }

        await QuizAttempt.deleteMany({ course_id });

        res.status(200).json({ status: true, message: "Quiz deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export { getQuiz, submitQuiz, getQuizAttemptStatus, createQuiz, updateQuiz, deleteQuiz };
