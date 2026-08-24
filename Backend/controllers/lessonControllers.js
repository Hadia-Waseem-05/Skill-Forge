import Courses from "../models/Courses.js";
import Lessons from "../models/Lessons.js";

const getCourseAndCheckOwnership = async (courseId, userId) => {
    const course = await Courses.findById(courseId);
    if (!course) return { error: { status: 404, message: "Course not found" } };
    if (course.instructor_id.toString() !== userId) {
        return { error: { status: 403, message: "You are not authorized" } };
    }
    return { course };
};

export const getLessonsByCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const course = await Courses.findById(courseId);

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        const isOwner = req.user && course.instructor_id.toString() === req.user.id;

        if (!course.published && !isOwner) {
            return res.status(404).json({ message: "Course not found" });
        }

        const lessons = await Lessons.find({ course_id: courseId }).sort({ order_index: 1 });

        res.status(200).json({ status: true, data: lessons });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getLesson = async (req, res) => {
    try {
        const { id } = req.params;
        const lesson = await Lessons.findById(id).populate({
            path: "course_id",
            populate: { path: "instructor_id", select: "name avatar" },
        });

        if (!lesson) {
            return res.status(404).json({ message: "Lesson not found" });
        }

        const isOwner =
            req.user && lesson.course_id.instructor_id._id.toString() === req.user.id;

        if (!lesson.course_id.published && !isOwner) {
            return res.status(404).json({ message: "Lesson not found" });
        }

        res.status(200).json({ status: true, data: lesson });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const createLesson = async (req, res) => {
    try {
        const { title, content, course_id, order_index } = req.body;

        if (!title || title.trim() === "" || !course_id) {
            return res.status(400).json({ message: "Title and course_id are required" });
        }

        const { error } = await getCourseAndCheckOwnership(course_id, req.user.id);
        if (error) {
            return res.status(error.status).json({ message: error.message });
        }

        const lesson = await Lessons.create({
            title: title.trim(),
            content,
            course_id,
            order_index,
        });

        res.status(201).json({
            message: "Lesson created successfully",
            status: true,
            data: lesson,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const updateLesson = async (req, res) => {
    try {
        const { id } = req.params;
        const lesson = await Lessons.findById(id);

        if (!lesson) {
            return res.status(404).json({ message: "Lesson not found" });
        }

        const { error } = await getCourseAndCheckOwnership(lesson.course_id.toString(), req.user.id);
        if (error) {
            return res.status(error.status).json({ message: error.message });
        }

        const { title, content, order_index } = req.body;
        const updateData = {};

        if (title !== undefined) {
            if (title.trim() === "") {
                return res.status(400).json({ message: "Title cannot be empty" });
            }
            updateData.title = title.trim();
        }
        if (content !== undefined) updateData.content = content;
        if (order_index !== undefined) updateData.order_index = order_index;

        const updated = await Lessons.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({
            message: "Lesson updated successfully",
            status: true,
            data: updated,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const deleteLesson = async (req, res) => {
    try {
        const { id } = req.params;
        const lesson = await Lessons.findById(id);

        if (!lesson) {
            return res.status(404).json({ message: "Lesson not found" });
        }

        const { error } = await getCourseAndCheckOwnership(lesson.course_id.toString(), req.user.id);
        if (error) {
            return res.status(error.status).json({ message: error.message });
        }

        await Lessons.findByIdAndDelete(id);

        res.status(200).json({ message: "Lesson deleted successfully", status: true });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
