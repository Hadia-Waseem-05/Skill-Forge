import { completeQuizAndFinishCourse } from "../controllers/enrollmentController.js";
import Quiz from "../quiz/Quiz.js";
import calculateScore from "../quiz/scoreLogic.js";
import QuizResult from "../models/QuizResult.js";

// Quiz create karna (naya)
const createQuiz = async (req, res) => {
  try {
    const { questions } = req.body;
    const courseId = req.params.courseId;

    if (!questions || questions.length === 0) {
      return res.status(400).json({ message: "Questions are required" });
    }

    const existingQuiz = await Quiz.findOne({ courseId });
    if (existingQuiz) {
      return res.status(409).json({ message: "Quiz already exists for this course" });
    }

    const quiz = await Quiz.create({ courseId, questions });
    res.status(201).json({ status: true, message: "Quiz created successfully", quiz });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Quiz creation failed", error: error.message });
  }
};

// Quiz fetch karna
const getQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ courseId: req.params.courseId });
    res.status(200).json(quiz);
  } catch (error) {
    res.status(500).json({ message: "Quiz not found" });
  }
};

// Quiz submit karna
const submitQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ courseId: req.params.courseId });
    const correctAnswers = quiz.questions.map(q => q.correctAnswer);
    const userAnswers = req.body.answers;

    const score = calculateScore(userAnswers, correctAnswers);
    const totalQuestions = correctAnswers.length;
    const passed = score >= totalQuestions / 2;

    await QuizResult.findOneAndUpdate(
      { student_id: req.user.id, course_id: req.params.courseId },
      {
        student_id: req.user.id,
        course_id: req.params.courseId,
        score: score,
        totalQuestions: totalQuestions,
        passed: passed,
        attempted_date: Date.now(),
      },
      { upsert: true, new: true }
    );

    let progressData = null;
    if (passed) {
      const fakeRes = {
        status: function () { return this; },
        json: function (data) { progressData = data; },
      };
      await completeQuizAndFinishCourse(req, fakeRes);
    }

    res.status(200).json({ score: score, total: totalQuestions, passed: passed, progress: progressData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Submission failed" });
  }
};

export { getQuiz, submitQuiz, createQuiz };