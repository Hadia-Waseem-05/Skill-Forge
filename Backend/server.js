import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
dotenv.config();
import db from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
db();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);

app.listen(5000, () => {
    console.log("Server is running");
})