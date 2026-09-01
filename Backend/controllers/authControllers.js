import crypto from "crypto";
import sendEmail from "../config/sendEmail.js";

import jwt from "jsonwebtoken";
import Users from "../models/Users.js";

const generateToken = (userId, role) => {
    return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

export const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || name.trim() === "" ||
            !email || email.trim() === "" ||
            !password || password.trim() === "") {
            return res.status(400).json({ message: "All fields are required" });
        }

        const cleanEmail = email.trim().toLowerCase();
        const existingUser = await Users.findOne({ email: cleanEmail });
        
        if (existingUser) {
            return res.status(409).json({ message: "Account already exists!" });
        }

        const user = await Users.create({
         name, email: cleanEmail, password, role: role || "student",
         avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
        });
         
        const token = generateToken(user._id, user.role);

        res.status(201).json({
            message: "Account has been created successfully!",
            status: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
            },
        });
    } catch (error) {
         console.error(error); 
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || email.trim() === "" || !password || password.trim() === "") {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const cleanEmail = email.trim().toLowerCase();
        const user = await Users.findOne({ email: cleanEmail });
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "User not found" });
        }

        const token = generateToken(user._id, user.role);

        res.status(200).json({
            message: "Login successful",
            status: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
            },
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const delUser = async (req, res) => {
    try {
        const { id } = req.params;
        if(req.user.id !== id){
            return res.status(403).json({status: false, message: "You are not aunthorized"})
        };
        const deleted = await Users.findByIdAndDelete(id);

        if (!deleted) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "User deleted successfully!", status: true });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getUser = async (req, res) => {
    try {
        const { id } = req.params;
        if(req.user.id !== id){
        return res.status(403).json({status: false, message: "You are not aunthorized"})
        };
        const data = await Users.findById(id).select("-password");

        if (!data) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ data, status: true });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, bio, avatar } = req.body;

        if (req.user.id !== id) {
            return res.status(403).json({ status: false, message: "You are not authorized" });
        }

        if (!name || name.trim() === "") {
            return res.status(400).json({ message: "Name is required" });
        }

        const updateData = { name };
        if (bio !== undefined) updateData.bio = bio.trim();
        if (avatar !== undefined) updateData.avatar = avatar;

        const updated = await Users.findByIdAndUpdate(
            id,
            updateData,
             { returnDocument: 'after', runValidators: true }
        ).select("-password");

        if (!updated) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "Updated successfully!", data: updated, status: true });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const verifyUser = async ( req, res, next ) => {
    const token = req.headers.authorization?.split(" ")[1];

    if(!token){
       return res.status(401).json({status: false, message: "No token provided."})
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();

    } catch (error) {
        res.status(401).json({status: false, message: "Invalid or expired token."})
    }
};

export const verifyInstructor = async (req, res, next) => {
    try {
        const user = await Users.findById(req.user.id);

        if (!user || user.role !== "instructor") {
            return res.status(403).json({ status: false, message: "Instructor access required" });
        }

        next();
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email || email.trim() === "") {
            return res.status(400).json({ message: "Email is required" });
        }

        const cleanEmail = email.trim().toLowerCase();
        const user = await Users.findOne({ email: cleanEmail });

        if (!user) {
            return res.status(404).json({ status: false, message: "No account found with this email" });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
        await user.save();

        const resetLink = `http://localhost:5500/reset-password.html?token=${resetToken}`;

        const emailHtml = `
            <h2>Password Reset Request</h2>
            <p>You requested a password reset for your SkillForge account.</p>
            <p>Click the link below to reset your password. This link is valid for 15 minutes.</p>
            <a href="${resetLink}">${resetLink}</a>
            <p>If you did not request this, please ignore this email.</p>
        `;

        await sendEmail(user.email, "SkillForge - Password Reset", emailHtml);

        res.status(200).json({ status: true, message: "Password reset link sent to your email" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword || newPassword.trim() === "") {
            return res.status(400).json({ message: "Token and new password are required" });
        }

        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

        const user = await Users.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ status: false, message: "Invalid or expired reset token" });
        }

        user.password = newPassword;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();

        res.status(200).json({ status: true, message: "Password has been reset successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};