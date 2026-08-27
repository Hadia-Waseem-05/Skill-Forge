import express from "express";
const router = express.Router();
import { getQuiz, submitQuiz } from "../controllers/quizController.js";
import { verifyUser } from "../controllers/authControllers.js";

router.get("/:courseId", verifyUser, getQuiz);
router.post("/:courseId/submit", verifyUser, submitQuiz);

export default router;