import Enrollments from "../models/Enrollments.js";
import Courses from "../models/Courses.js";
import Users from "../models/Users.js";
import Progress from "../models/Progress.js";
import Lessons from "../models/Lessons.js";

export const enrollInCourse = async (req, res) => {
    try {
        const course_id = req.body.course_id || req.params.course_id;

        if (!course_id) {
            return res.status(400).json({ message: "Course not found" });
        }

        const course = await Courses.findById(course_id);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }
        
        if (req.user.role !== "student") {
        return res.status(403).json({ message: "Only students can enroll in courses" });
        };

        const existingEnrollment = await Enrollments.findOne({
            student_id: req.user.id,
            course_id: course_id,
        });

        if (existingEnrollment) {
            return res.status(400).json({ message: "You are already enrolled in this course" });
        };

        const enrollment = await Enrollments.create({
            student_id: req.user.id,
            course_id: course_id,
        });

        res.status(201).json({
            message: "Enrolled successfully",
            status: true,
            data: enrollment,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getMyEnrollments = async (req, res) => {
    try {
        const enrollments = await Enrollments.find({ student_id: req.user.id })
            .populate("course_id", "title description published thumbnail instructor_id")
            .sort({ enrolled_date: -1 });

        res.status(200).json({ status: true, data: enrollments });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getEnrollmentsForCourse = async (req, res) => {
    try {
        const { course_id } = req.params;

        if (!course_id) {
            return res.status(400).json({ message: "course not found" });
        }

        const course = await Courses.findById(course_id);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        if (course.instructor_id.toString() !== req.user.id) {
        return res.status(403).json({ message: "You are not the instructor of this course" });
        }

        const enrollments = await Enrollments.find({ course_id: course_id })
            .populate("student_id", "name email avatar role")
            .sort({ enrolled_date: -1 });

        res.status(200).json({ status: true, data: enrollments });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const markLessonComplete = async (req, res) => {
    try {
        const lesson_id = req.body.lesson_id || req.params.lesson_id;

        if (!lesson_id) {
            return res.status(400).json({ message: "lesson_id is required" });
        }

        const lesson = await Lessons.findById(lesson_id);
        if (!lesson) {
            return res.status(404).json({ message: "Lesson not found" });
        }

        const enrollment = await Enrollments.findOne({
            student_id: req.user.id,
            course_id: lesson.course_id,
        });

        if (!enrollment) {
            return res.status(403).json({ message: "You are not enrolled in this course" });
        }

        let progress = await Progress.findOne({
            enrollment_id: enrollment._id,
            lesson_id: lesson_id,
        });

        if (!progress) {
            progress = await Progress.create({
                enrollment_id: enrollment._id,
                lesson_id: lesson_id,
                completed: true,
                completed_date: new Date(),
            });
        } else if (!progress.completed) {
            progress.completed = true;
            progress.completed_date = new Date();
            await progress.save();
        }

        res.status(200).json({ status: true, data: progress });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getCourseProgress = async (req, res) => {
    try {
        const { course_id } = req.params;

        if (!course_id) {
            return res.status(400).json({ message: "course_id is required" });
        }

        const enrollment = await Enrollments.findOne({
            student_id: req.user.id,
            course_id: course_id,
        });

        if (!enrollment) {
            return res.status(403).json({ message: "You are not enrolled in this course" });
        }

        const totalLessons = await Lessons.countDocuments({ course_id: course_id });
        const completedLessons = await Progress.countDocuments({
            enrollment_id: enrollment._id,
            completed: true,
        });

        const percentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

        res.status(200).json({
            status: true,
            data: {
                completed_lessons: completedLessons,
                total_lessons: totalLessons,
                percentage: percentage,
            },
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const completeQuizAndFinishCourse = async (req, res) => {
    try {
        const { course_id } = req.params;

        if (!course_id) {
            return res.status(400).json({ message: "course_id is required" });
        }

        const enrollment = await Enrollments.findOne({
            student_id: req.user.id,
            course_id: course_id,
        });

        if (!enrollment) {
            return res.status(403).json({ message: "You are not enrolled in this course" });
        }

        const lessons = await Lessons.find({ course_id: course_id });

        for (const lesson of lessons) {
            await Progress.findOneAndUpdate(
                { enrollment_id: enrollment._id, lesson_id: lesson._id },
                { completed: true, completed_date: new Date() },
                { upsert: true, new: true }
            );
        }

        const totalLessons = lessons.length;
        const completedLessons = await Progress.countDocuments({
            enrollment_id: enrollment._id,
            completed: true,
        });

        const percentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

        res.status(200).json({
            status: true,
            data: {
                completed_lessons: completedLessons,
                total_lessons: totalLessons,
                percentage: percentage,
            },
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getLessonProgressForCourse = async (req, res) => {
    try {
        const { course_id } = req.params;

        if (!course_id) {
            return res.status(400).json({ message: "course_id is required" });
        }

        const enrollment = await Enrollments.findOne({
            student_id: req.user.id,
            course_id: course_id,
        });

        if (!enrollment) {
            return res.status(403).json({ message: "You are not enrolled in this course" });
        }

        const lessons = await Lessons.find({ course_id: course_id }).sort({ order_index: 1 });
        const progressRecords = await Progress.find({ enrollment_id: enrollment._id });

        const progressMap = {};
        for (const record of progressRecords) {
            progressMap[record.lesson_id.toString()] = {
                completed: record.completed,
                completed_date: record.completed_date,
            };
        }

        const lessonsWithProgress = lessons.map((lesson) => {
            const progress = progressMap[lesson._id.toString()] || { completed: false, completed_date: null };
            return {
                lesson_id: lesson._id,
                title: lesson.title,
                order_index: lesson.order_index,
                completed: progress.completed,
                completed_date: progress.completed_date,
            };
        });

        res.status(200).json({ status: true, data: lessonsWithProgress });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getStudentsProgressForCourse = async (req, res) => {
    try {
        const { course_id } = req.params;

        if (!course_id) {
            return res.status(400).json({ message: "course_id is required" });
        }

        const course = await Courses.findById(course_id);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        if (course.instructor_id.toString() !== req.user.id) {
            return res.status(403).json({ message: "You are not the instructor of this course" });
        }

        const enrollments = await Enrollments.find({ course_id: course_id }).populate("student_id", "name email");
        const totalLessons = await Lessons.countDocuments({ course_id: course_id });

        const studentsProgress = await Promise.all(
    enrollments.map(async (enrollment) => {
        const completedLessons = await Progress.countDocuments({
            enrollment_id: enrollment._id,
            completed: true,
        });

        const percentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

        return {
            student: {
                name: enrollment.student_id.name,
                email: enrollment.student_id.email,
            },
            completed_lessons: completedLessons,
            total_lessons: totalLessons,
            percentage: percentage,
        };
    })
);

        res.status(200).json({ status: true, data: studentsProgress });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
