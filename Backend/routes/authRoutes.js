import express from "express";
import { register, login, delUser, getUser, updateUser } from "../controllers/authControllers.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.put("/:id", updateUser);
router.get("/:id", getUser);
router.delete("/:id", delUser);

export default router;