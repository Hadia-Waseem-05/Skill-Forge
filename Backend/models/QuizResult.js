import mongoose from "mongoose";

const quizResultSchema = new mongoose.Schema(
    {
        student_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users",
            required: true,
        },
        course_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Courses",
            required: true,
        },
        score: {
            type: Number,
            required: true,
        },
        totalQuestions: {
            type: Number,
            required: true,
        },
        passed: {
            type: Boolean,
            required: true,
        },
        attempted_date: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

quizResultSchema.index({ student_id: 1, course_id: 1 });

const QuizResult = mongoose.models.QuizResult || mongoose.model("QuizResult", quizResultSchema);

export default QuizResult;