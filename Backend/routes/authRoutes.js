import express from "express";
import { register, login, delUser, getUser, updateUser, verifyUser } from "../controllers/authControllers.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.get("/verify", verifyUser, (req, res) => {
    res.status(200).json({ status: true, message: "Token is valid", user: req.user });
});                                                                                    // ← yahan move kar diya

router.put("/:id", verifyUser, updateUser);
router.get("/:id", verifyUser, getUser);
router.delete("/:id", verifyUser, delUser);

export default router;