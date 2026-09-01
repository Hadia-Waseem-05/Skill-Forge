// import mongoose from "mongoose";
// import bcrypt from "bcrypt";

// <<<<<<< HEAD
// =======

// >>>>>>> 3ec3f84c148b01e467e9247a901b41b8739bcd01
// const userSchema = new mongoose.Schema(
//     {
//          name: {
//             required: true,
//             type: String,
//          },
//          email: {
//             type: String,
//             required: true,
//             unique: true,
//          },
//          password: {
//             type: String,
//             required: true,
//          },
//          role: {
//             required: true,
//             type: String,
//             enum: ["student", "instructor"],
//             default: "student",
//          },
//          bio: {
//            type: String,
//            trim: true,
//            maxlength: 300,
//            default: "",
//          },
//          avatar: {
//            type: String,
//            default: "https://api.dicebear.com/7.x/initials/svg?seed=User",  
//          },
//          resetPasswordToken: {
//              type: String,
//              default: null,
//          },
//          resetPasswordExpires: {
//              type: Date,
//              default: null,
//          },
//     },
//     {
//         timestamps: true
//     }
// );

// <<<<<<< HEAD
// userSchema.pre("save", async function () {
// =======
//     userSchema.pre("save", async function () {
// >>>>>>> 3ec3f84c148b01e467e9247a901b41b8739bcd01
//     if (!this.isModified("password")) return;
//     this.password = await bcrypt.hash(this.password, 10);
// });

// userSchema.methods.comparePassword = async function (candidatePassword) {
//     return bcrypt.compare(candidatePassword, this.password);
// };

// <<<<<<< HEAD
// const Users = mongoose.models.Users || mongoose.model("Users", userSchema);

// export default Users;
// =======
// const Users = mongoose.models.Users || mongoose.model( "Users", userSchema );

// export default Users;
// >>>>>>> 3ec3f84c148b01e467e9247a901b41b8739bcd01

import mongoose from "mongoose";
import bcrypt from "bcrypt";

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

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const Users = mongoose.models.Users || mongoose.model("Users", userSchema);

export default Users;