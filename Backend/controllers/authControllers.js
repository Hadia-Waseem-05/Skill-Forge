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

        const cleanEmail = email.trim().toLowerCase();
        const existingUser = await Users.findOne({ email: cleanEmail });
        
        if (existingUser) {
            return res.status(409).json({ message: "Account already exists!" });
        }

        const user = await Users.create({
         name, email: cleanEmail, password, role: role || "student",
         avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
        });
         
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

        const cleanEmail = email.trim().toLowerCase();
        const user = await Users.findOne({ email: cleanEmail });
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "User not found" });
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