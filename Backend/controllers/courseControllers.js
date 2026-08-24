import Courses from "../models/Courses.js";
import Lessons from "../models/Lessons.js";

export const getCourses = async (req, res) => {
    try {
        const courses = await Courses.find({ published: true })
            .populate("instructor_id", "name avatar")
            .sort({ createdAt: -1 });

        res.status(200).json({ status: true, data: courses });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const course = await Courses.findById(id).populate("instructor_id", "name avatar bio");

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        const isOwner = req.user && course.instructor_id._id.toString() === req.user.id;

        if (!course.published && !isOwner) {
            return res.status(404).json({ message: "Course not found" });
        }

        const lessons = await Lessons.find({ course_id: id }).sort({ order_index: 1 });

        res.status(200).json({ status: true, data: { course, lessons } });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const createCourse = async (req, res) => {
    try {
        const { title, description, published, thumbnail } = req.body;

        if (!title || title.trim() === "" || !description || description.trim() === "") {
        return res.status(400).json({ message: "Title and description are required" });
        }

        const course = await Courses.create({
            title: title.trim(),
            description: description.trim(),
            published,
            thumbnail: thumbnail || "",
            instructor_id: req.user.id,
        });

        res.status(201).json({
            message: "Course created successfully",
            status: true,
            data: course,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const updateCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const course = await Courses.findById(id);

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        if (course.instructor_id.toString() !== req.user.id) {
            return res.status(403).json({ status: false, message: "You are not authorized" });
        }

        const { title, description, published, thumbnail } = req.body;
        const updateData = {};

        if (title !== undefined) {
            if (title.trim() === "") {
                return res.status(400).json({ message: "Title cannot be empty" });
            }
            updateData.title = title.trim();
        }
        if (description !== undefined) {
            if (description.trim() === "") {
                return res.status(400).json({ message: "Description cannot be empty" });
            }
            updateData.description = description.trim();
        }
        if (published !== undefined) updateData.published = published;

        if (thumbnail !== undefined) updateData.thumbnail = thumbnail;

        const updated = await Courses.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        }).populate("instructor_id", "name avatar");

        res.status(200).json({
            message: "Course updated successfully",
            status: true,
            data: updated,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const course = await Courses.findById(id);

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        if (course.instructor_id.toString() !== req.user.id) {
            return res.status(403).json({ status: false, message: "You are not authorized" });
        }

        await Lessons.deleteMany({ course_id: id });
        await Courses.findByIdAndDelete(id);

        res.status(200).json({ message: "Course deleted successfully", status: true });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getMyCourses = async (req, res) => {
    try {
        const courses = await Courses.find({ instructor_id: req.user.id })
            .populate("instructor_id", "name avatar")
            .sort({ createdAt: -1 });

        res.status(200).json({ status: true, data: courses });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
