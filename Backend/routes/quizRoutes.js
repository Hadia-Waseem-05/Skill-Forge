console.log("QUIZ ROUTES FILE LOADED ✅");
import express from "express";
const router = express.Router();
import {
    getQuiz,
    submitQuiz,
    getQuizAttemptStatus,
    createQuiz,
    updateQuiz,
    deleteQuiz,
} from "../controllers/quizController.js";
import { verifyUser, verifyInstructor } from "../controllers/authControllers.js";

// Student routes
router.get("/:course_id", verifyUser, getQuiz);
router.get("/:course_id/status", verifyUser, getQuizAttemptStatus);
router.post("/:course_id/submit", verifyUser, submitQuiz);

// Instructor routes
router.post("/", verifyUser, verifyInstructor, createQuiz);
router.put("/:course_id", verifyUser, verifyInstructor, updateQuiz);
router.delete("/:course_id", verifyUser, verifyInstructor, deleteQuiz);

export default router;
