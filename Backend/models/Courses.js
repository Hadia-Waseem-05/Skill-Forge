import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
    {
        instructor_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users",
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 150,
        },
        description: {
            type: String,
            required: true,
            trim: true,
            maxlength: 2000,
        },
        published: {
            type: Boolean,
            default: false,
        },
           thumbnail: {
           type: String,
           trim: true,
           default: "https://placehold.co/600x400/D6E6F2/333333?text=Course",
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

courseSchema.virtual("course_id").get(function () {
    return this._id;
});

const Courses = mongoose.models.Courses || mongoose.model("Courses", courseSchema);

export default Courses;
