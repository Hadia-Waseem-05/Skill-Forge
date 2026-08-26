import express from "express";
import {
    getLessonsByCourse,
    getLesson,
    createLesson,
    updateLesson,
    deleteLesson,
} from "../controllers/lessonControllers.js";
import { verifyUser, verifyInstructor } from "../controllers/authControllers.js";

const router = express.Router();

router.get("/course/:courseId", verifyUser, getLessonsByCourse);
router.get("/:id", verifyUser, getLesson);
router.post("/", verifyUser, verifyInstructor, createLesson);
router.put("/:id", verifyUser, verifyInstructor, updateLesson);
router.delete("/:id", verifyUser, verifyInstructor, deleteLesson);

export default router;
