// src/server.js
// Converted to CommonJS module system.

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const app = express();

// Middleware
app.use(express.json()); // Allows parsing of JSON request bodies
app.use(cors());         // Enables Cross-Origin Resource Sharing

// Basic route
app.get("/", (req, res) => {
    res.send("Backend running with CommonJS + Express + Prisma");
});

// Define the port to listen on
const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});