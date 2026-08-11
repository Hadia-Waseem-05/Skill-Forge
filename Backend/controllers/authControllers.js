import jwt from "jsonwebtoken";
import Users from "../models/Users.js";

const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

export const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || name.trim() === "" ||
            !email || email.trim() === "" ||
            !password || password.trim() === "") {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingUser = await Users.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "Account already exists!" });
        }

        const user = await Users.create({ name, email, password, role: role || "student" });
        const token = generateToken(user._id);

        res.status(201).json({
            message: "Account has been created successfully!",
            status: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
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

        const user = await Users.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid password" });
        }

        const token = generateToken(user._id);

        res.status(200).json({
            message: "Login successful",
            status: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const delUser = async (req, res) => {
    try {
        const { id } = req.params;
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
        const { name, role } = req.body;

        if (!name || name.trim() === "") {
            return res.status(400).json({ message: "Name is required" });
        }

        const updated = await Users.findByIdAndUpdate(
            id,
            { name, role },
            { new: true, runValidators: true }
        ).select("-password");

        if (!updated) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "Updated successfully!", data: updated, status: true });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};