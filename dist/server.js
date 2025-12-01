"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth.user.routes");
dotenv.config();
const app = express();
// Middleware
app.use(express.json());
app.use(cors({
    origin: [process.env.DOMAIN],
    credentials: true,
}));
app.use("/api/auth", authRoutes);
app.get("/", (req, res) => {
    res.send("Backend running with CommonJS + Express + Prisma");
});
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
