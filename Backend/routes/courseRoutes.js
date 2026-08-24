import express from "express";
import {
    getCourses,
    getCourse,
    createCourse,
    updateCourse,
    deleteCourse,
    getMyCourses,
} from "../controllers/courseControllers.js";
import { verifyUser, verifyInstructor } from "../controllers/authControllers.js";

const router = express.Router();

router.get("/", getCourses);
router.get("/my", verifyUser, verifyInstructor, getMyCourses);
router.get("/:id", getCourse);
router.post("/", verifyUser, verifyInstructor, createCourse);
router.put("/:id", verifyUser, verifyInstructor, updateCourse);
router.delete("/:id", verifyUser, verifyInstructor, deleteCourse);

export default router;
