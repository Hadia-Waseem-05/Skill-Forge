const userSchema = new mongoose.Schema(
    {
         name: {
            required: true,
            type: String,
         },
         email: {
            type: String,
            required: true,
            unique: true,
         },
         password: {
            type: String,
            required: true,
         },
         role: {
            required: true,
            type: String,
            enum: ["student", "instructor"],
            default: "student",
         },
         bio: {
           type: String,
           trim: true,
           maxlength: 300,
           default: "",
         },
         avatar: {
           type: String,
           default: "https://api.dicebear.com/7.x/initials/svg?seed=User",  
         },
         resetPasswordToken: {
             type: String,
             default: null,
         },
         resetPasswordExpires: {
             type: Date,
             default: null,
         },
    },
    {
        timestamps: true
    }
);