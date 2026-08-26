import mongoose from "mongoose";

const quizSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
  },
  questions: [
    {
      questionText: { type: String, required: true },
      options: [String],
      correctAnswer: { type: String, required: true },
    },
  ],
});

export default mongoose.model("Quiz", quizSchema);