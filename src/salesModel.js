// backend/src/salesModel.js
import mongoose from "mongoose";

const salesSchema = new mongoose.Schema({}, { strict: false });
export const Sales = mongoose.model("Sales", salesSchema, "sales");
