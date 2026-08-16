import express from "express";
import { register, login, delUser, getUser, updateUser, verifyUser } from "../controllers/authControllers.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.put("/:id",verifyUser, updateUser);
router.get("/:id",verifyUser, getUser);
router.delete("/:id",verifyUser, delUser);
router.get("/verify", verifyUser)

export default router;