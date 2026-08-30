import mongoose from "mongoose";

const quizAttemptSchema = new mongoose.Schema(
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
        total: {
            type: Number,
            required: true,
        },
        passed: {
            type: Boolean,
            default: false,
        },
        submitted_at: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

quizAttemptSchema.index({ student_id: 1, course_id: 1 });

const QuizAttempt =
    mongoose.models.QuizAttempt || mongoose.model("QuizAttempt", quizAttemptSchema);

export default QuizAttempt;
