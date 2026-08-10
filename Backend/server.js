import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
dotenv.config();
import db from "./config/db.js";
db();

const app = express();
app.use(cors());
app.use(express.json());

app.listen(5000, () => {
    console.log("Server is running");
})