import mongoose from "mongoose";

const progressSchema = new mongoose.Schema(
    {
        enrollment_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Enrollments",
            required: true,
        },
        lesson_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Lessons",
            required: true,
        },
        completed: {
            type: Boolean,
            default: false,
        },
        completed_date: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

progressSchema.index({ enrollment_id: 1, lesson_id: 1 }, { unique: true });

const Progress = mongoose.models.Progress || mongoose.model("Progress", progressSchema);

export default Progress;
