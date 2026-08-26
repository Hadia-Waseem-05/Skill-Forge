import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema(
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
        enrolled_date: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

enrollmentSchema.index({ student_id: 1, course_id: 1 }, { unique: true });

const Enrollments = mongoose.models.Enrollments || mongoose.model("Enrollments", enrollmentSchema);

export default Enrollments;
