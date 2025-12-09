// backend/src/index.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan"; // optional: lightweight request logging
import { connectDB } from "./db.js";
import salesRoutes from "./routes/salesRoutes.js"; // adjust path if different

dotenv.config();

const app = express();

// --- Middleware ---
app.use(cors());
app.use(express.json({ limit: "5mb" })); // adjust limit if needed
app.use(express.urlencoded({ extended: true }));
// Use morgan only in development
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// --- Basic routes ---
app.get("/", (req, res) => {
  res.send("Backend running");
});

// small debug endpoint to verify counts quickly (optional)
app.get("/test-count", async (req, res) => {
  try {
    // forward to your route logic or call model directly if available
    // If salesRoutes exposes /count, use that in production. This is a quick sanity endpoint.
    res.json({ success: true, message: "test-count OK" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Register API routes AFTER middleware
app.use("/api/sales", salesRoutes);

// --- 404 handler ---
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Not Found" });
});

// --- Global error handler ---
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res
    .status(err.status || 500)
    .json({ success: false, message: err.message || "Internal Server Error" });
});

// --- Start server after DB connected ---
async function startServer() {
  try {
    console.log("Starting server — attempting DB connection...");
    await connectDB(); // must throw on failure
    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
      console.log(`✅ MongoDB connected`);
      console.log(`🚀 Server listening on http://localhost:${PORT}`);
    });

    // graceful shutdown
    const shutdown = (signal) => {
      console.log(`Received ${signal}. Closing server...`);
      server.close(() => {
        console.log("Server closed.");
        // If you want to close DB connection too (if mongoose exported it), do it here.
        process.exit(0);
      });

      // force exit after timeout
      setTimeout(() => {
        console.error("Forcing shutdown...");
        process.exit(1);
      }, 10_000).unref();
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (err) {
    console.error("Failed to start server:", err);
    // exit with failure (optional)
    process.exit(1);
  }
}

// Catch synchronous exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

// Catch unhandled promise rejections
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
  // optional: process.exit(1)
});

startServer();
