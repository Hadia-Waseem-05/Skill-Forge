import express from "express";
import {
    markLessonComplete,
    getCourseProgress,
    completeQuizAndFinishCourse,
    getLessonProgressForCourse,
    getStudentsProgressForCourse,
} from "../controllers/enrollmentController.js";
import { verifyUser } from "../controllers/authControllers.js";

const router = express.Router();

router.post("/lesson/:lesson_id/complete", verifyUser, markLessonComplete);
router.get("/course/:course_id", verifyUser, getCourseProgress);
router.post("/course/:course_id/complete-quiz", verifyUser, completeQuizAndFinishCourse);
router.get("/course/:course_id/lessons", verifyUser, getLessonProgressForCourse);
router.get("/course/:course_id/students", verifyUser, getStudentsProgressForCourse);

export default router;
