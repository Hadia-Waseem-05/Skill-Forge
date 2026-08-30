import express from "express";
import { generateCertificate } from "../controllers/certificateController.js";
import { verifyUser } from "../controllers/authControllers.js";

const router = express.Router();

router.post("/generate", verifyUser, generateCertificate);

export default router;