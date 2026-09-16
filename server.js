import dotenv from "dotenv";

dotenv.config();

import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import globalErrorHandler from "./v1/middleware/Globalerrorhandler.js";
import { connectDB } from "./config/db.js";
import router from "./route.js";

const app = express();

const port = process.env.PORT || 8000;

// =========================
// Middlewares
// =========================

app.use(cors());

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  }),
);

app.use(cookieParser());

app.use(morgan("dev"));

app.use(helmet());

// =========================
// Routes
// =========================

app.use(router);

// =========================
// Test Routes
// =========================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server running 🚀",
  });
});

app.get("/api/v1", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API v1 working ✅",
  });
});

// =========================
// Global Error Handler
// =========================

app.use(globalErrorHandler);

// =========================
// Start Server
// =========================

const startServer = async () => {
  try {
    await connectDB();

    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });
  } catch (error) {
    console.error("❌ Server start failed:", error.message);
    process.exit(1);
  }
};

startServer();
