import Enrollments from "../models/Enrollments.js";
import Courses from "../models/Courses.js";
import Users from "../models/Users.js";

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
