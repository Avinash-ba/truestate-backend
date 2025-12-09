// backend/src/controllers/salesController.js
import { Sales } from "../salesModel.js";
import { buildMongoQuery, buildMongoOptions } from "../utils/queryBuilder.js";

export async function getSalesHandler(req, res) {
  try {
    const params = req.query || {};

    // Build Mongo query and options
    const mongoQuery = buildMongoQuery(params);
    const opts = buildMongoOptions(params);

    // Count matching documents
    const total = await Sales.countDocuments(mongoQuery);

    // Fetch page
    const items = await Sales.find(mongoQuery)
      .sort(opts.sort)
      .skip(opts.skip)
      .limit(opts.limit)
      .lean();

    res.json({
      success: true,
      data: items,
      meta: {
        page: opts.page,
        pageSize: opts.pageSize,
        total,
        totalPages: total ? Math.ceil(total / opts.pageSize) : 1
      }
    });
  } catch (err) {
    console.error("Error in getSalesHandler:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}
