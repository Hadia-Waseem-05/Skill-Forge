import express from "express";
import {
    enrollInCourse,
    getMyEnrollments,
    getEnrollmentsForCourse,
} from "../controllers/enrollmentController.js";
import { verifyUser, verifyInstructor } from "../controllers/authControllers.js";

const router = express.Router();

router.post("/", verifyUser, enrollInCourse);
router.get("/my", verifyUser, getMyEnrollments);
router.get("/course/:course_id", verifyUser, verifyInstructor, getEnrollmentsForCourse);

export default router;
