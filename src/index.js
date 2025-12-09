// src/index.js — paste this as the whole file (VS Code editor)
import dotenv from "dotenv";
// Load .env as the very first thing — MUST be before any other imports that read process.env
dotenv.config();

import express from "express";
import mongoose from "mongoose";

// small diagnostic (safe, masked) — remove after debugging
console.log("MONGO_URI (masked):", process.env.MONGO_URI ? process.env.MONGO_URI.replace(/:\/\/.*@/,'://<creds>@') : "<not set>");

const app = express();

app.get("/", (req, res) => res.send("Hello from truestate backend"));

const PORT = process.env.PORT || 5000;

// sanitize MONGO_URI in case someone accidentally left unsupported options
const rawUri = process.env.MONGO_URI;
if (!rawUri) {
  console.error("MONGO_URI not set");
  process.exit(1);
}

let cleanUri = rawUri;
try {
  const urlObj = new URL(rawUri);
  urlObj.searchParams.forEach((v, k) => {
    if (k.toLowerCase() === "usenewurlparser" || k.toLowerCase() === "useunifiedtopology") {
      urlObj.searchParams.delete(k);
    }
  });
  cleanUri = urlObj.toString();
} catch (e) {
  // ignore parsing error and use rawUri
}

console.log("Connecting to MongoDB...");
mongoose.connect(cleanUri)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });
