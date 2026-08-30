console.log("QUIZ ROUTES FILE LOADED ✅");
import express from "express";
const router = express.Router();
import { getQuiz, submitQuiz, createQuiz } from "../controllers/quizController.js";
import { verifyUser } from "../controllers/authControllers.js";

router.post("/:courseId/create", verifyUser, createQuiz);   // ← naya route
router.get("/:courseId", verifyUser, getQuiz);
router.post("/:courseId/submit", verifyUser, submitQuiz);

export default router;