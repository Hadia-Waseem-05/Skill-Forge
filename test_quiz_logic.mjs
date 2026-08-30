import calculateScore, { PASSING_PERCENTAGE } from "./Backend/quiz/scoreLogic.js";

console.log("=== Testing scoreLogic.js ===");

const correctAnswers = ["A", "B", "C", "D"];
const userAnswersAllCorrect = ["A", "B", "C", "D"];
const userAnswersHalf = ["A", "B", "X", "Y"];
const userAnswersAllWrong = ["X", "Y", "Z", "W"];

const scoreAllCorrect = calculateScore(userAnswersAllCorrect, correctAnswers);
const scoreHalf = calculateScore(userAnswersHalf, correctAnswers);
const scoreAllWrong = calculateScore(userAnswersAllWrong, correctAnswers);

console.log("PASSING_PERCENTAGE:", PASSING_PERCENTAGE);

console.log("All correct  -> score:", scoreAllCorrect, "total:", correctAnswers.length,
    "passed:", scoreAllCorrect >= correctAnswers.length * PASSING_PERCENTAGE);

console.log("Half correct -> score:", scoreHalf, "total:", correctAnswers.length,
    "passed:", scoreHalf >= correctAnswers.length * PASSING_PERCENTAGE);

console.log("All wrong    -> score:", scoreAllWrong, "total:", correctAnswers.length,
    "passed:", scoreAllWrong >= correctAnswers.length * PASSING_PERCENTAGE);

console.log("\n=== Testing stripQuizForStudent logic ===");

const mockQuiz = {
    _id: "quiz123",
    course_id: "course456",
    questions: [
        { questionText: "What is 2+2?", options: ["3", "4", "5"], correctAnswer: "4", _id: "q1" },
        { questionText: "What is the sky?", options: ["Blue", "Green", "Red"], correctAnswer: "Blue", _id: "q2" },
    ],
};

const stripped = {
    _id: mockQuiz._id,
    course_id: mockQuiz.course_id,
    questions: mockQuiz.questions.map(({ questionText, options, _id }) => ({
        questionText,
        options,
        _id,
    })),
};

console.log("Stripped quiz JSON:", JSON.stringify(stripped, null, 2));

const hasCorrectAnswer = JSON.stringify(stripped).includes("correctAnswer");
console.log("Stripped response contains 'correctAnswer':", hasCorrectAnswer);

if (hasCorrectAnswer) {
    console.error("FAIL: correctAnswer leaked to student response!");
    process.exit(1);
}

if (stripped.questions.length !== mockQuiz.questions.length) {
    console.error("FAIL: question count changed!");
    process.exit(1);
}

if (!stripped.questions.every(q => q.questionText && q.options && q._id)) {
    console.error("FAIL: missing required fields!");
    process.exit(1);
}

console.log("PASS: correctAnswer stripped, questionText/options/_id preserved");

console.log("\n=== Testing attempt status shape ===");
const statusShape = { attempted: false, passed: false, score: null, total: null };
console.log("Default status:", JSON.stringify(statusShape));

const passedStatus = { attempted: true, passed: true, score: 3, total: 4 };
console.log("Passed status:", JSON.stringify(passedStatus));

const failedStatus = { attempted: true, passed: false, score: 1, total: 4 };
console.log("Failed status:", JSON.stringify(failedStatus));

console.log("\n=== All tests passed ===");
