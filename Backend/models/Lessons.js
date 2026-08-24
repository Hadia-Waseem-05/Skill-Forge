import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema(
    {
        course_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Courses",
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 150,
        },
        content: {
            type: String,
            trim: true,
            default: "",
        },
        description: {
            type: String,
            trim: true,
            default: "",
        },
        order_index: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

lessonSchema.virtual("lesson_id").get(function () {
    return this._id;
});

lessonSchema.index({ course_id: 1, order_index: 1 });

const Lessons = mongoose.models.Lessons || mongoose.model("Lessons", lessonSchema);

export default Lessons;
