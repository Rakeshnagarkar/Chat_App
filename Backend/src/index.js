import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.route.js';
import messageRoutes from "./routes/message.route.js";
import { connectDB } from "./lib/db.js";
import { app, server } from "./lib/socket.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ limit: '200mb', extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173', // for local dev; update if needed in prod
  credentials: true
}));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../../Frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../../Frontend/dist/index.html"));
  });
} else {
  // Show this only during development
  app.get("/", (req, res) => {
    res.send("Backend is running! 🚀");
  });
}

// Start server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});
