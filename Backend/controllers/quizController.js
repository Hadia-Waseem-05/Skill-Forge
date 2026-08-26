import Quiz from "../quiz/Quiz.js";
import calculateScore from "../quiz/scoreLogic.js";

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

    res.status(200).json({ score: score, total: correctAnswers.length });
  } catch (error) {
    res.status(500).json({ message: "Submission failed" });
  }
};

export { getQuiz, submitQuiz };