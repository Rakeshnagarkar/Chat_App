import express from 'express';

import authRoutes from './routes/auth.route.js';
import messageRoutes from "./routes/message.route.js"

import cookieParser from 'cookie-parser';

import dotenv from 'dotenv';
dotenv.config();

import {connectDB} from "./lib/db.js"

import {app, server} from "./lib/socket.js"

import cors from 'cors';

import path from 'path';

const PORT = process.env.PORT || 5000;

const __dirname = path.resolve();

app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ limit: '200mb', extended: true }));
app.use(cookieParser());

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes)

if(process.env.NODE_ENV == "production"){

    app.use(express.static(path.join(__dirname, "/frontend/build")));
    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "/frontend/build/index.html"));
    });

}

app.get("/", (req, res) => {
    res.send("Backend is running! 🚀");
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});