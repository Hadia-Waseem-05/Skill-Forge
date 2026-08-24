import express from "express";
const router = express.Router();
import { getQuiz, submitQuiz } from "../controllers/quizController.js";

router.get("/:courseId", getQuiz);
router.post("/:courseId/submit", submitQuiz);

export default router;