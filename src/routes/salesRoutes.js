// backend/src/routes/salesRoutes.js
import { Router } from "express";
import { getSalesHandler } from "../controllers/salesController.js";

const router = Router();

router.get("/", getSalesHandler);

// keep diagnostics if you want
router.get("/count", async (req, res) => {
  try {
    const c = await (await import("../salesModel.js")).Sales.countDocuments({});
    res.json({ success: true, count: c });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error" });
  }
});

router.get("/raw", async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || "10", 10), 100);
    const docs = await (await import("../salesModel.js")).Sales.find({}).limit(limit).lean();
    res.json({ success: true, data: docs });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error" });
  }
});

export default router;
