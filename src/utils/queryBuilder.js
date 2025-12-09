// backend/src/utils/queryBuilder.js
// Build a MongoDB query, sort and pagination options from request query params.

export function buildMongoQuery(queryParams = {}) {
  const {
    search = "",
    regions,
    genders,
    productCategories,
    tags,
    paymentMethods,
    minAge,
    maxAge,
    startDate,
    endDate
  } = queryParams;

  const q = {};

  // 1) Search: Customer Name OR Phone Number (case-insensitive)
  if (search && String(search).trim()) {
    const s = String(search).trim();
    // Use regex (case-insensitive) for both fields
    q.$or = [
      { "Customer Name": { $regex: s, $options: "i" } },
      { "Phone Number": { $regex: s, $options: "i" } } // phone may be numeric or string
    ];
  }

  // 2) Multi-select fields: expect comma separated string or array
  const maybeAddIn = (fieldName, value) => {
    if (!value) return;
    const arr = Array.isArray(value) ? value : String(value).split(",").map(v => v.trim()).filter(Boolean);
    if (arr.length) q[fieldName] = { $in: arr };
  };

  maybeAddIn("Customer Region", regions);
  maybeAddIn("Gender", genders);
  maybeAddIn("Product Category", productCategories);
  maybeAddIn("Payment Method", paymentMethods);

  // Tags: tags field in documents may be comma-separated string or array in DB.
  if (tags) {
    const tagArr = Array.isArray(tags) ? tags : String(tags).split(",").map(t => t.trim()).filter(Boolean);
    if (tagArr.length) q["Tags"] = { $in: tagArr.map(t => new RegExp(`^${escapeRegex(t)}$`, "i")) };
  }

  // Age range
  if (minAge || maxAge) {
    q["Age"] = {};
    if (minAge) q["Age"].$gte = Number(minAge);
    if (maxAge) q["Age"].$lte = Number(maxAge);
    // remove if empty
    if (Object.keys(q["Age"]).length === 0) delete q["Age"];
  }

  // Date range (assume date stored as ISO string or Date)
  if (startDate || endDate) {
    q["Date"] = {};
    if (startDate) q["Date"].$gte = new Date(startDate);
    if (endDate) {
      // include entire day for endDate (set to 23:59:59)
      const d = new Date(endDate);
      d.setHours(23,59,59,999);
      q["Date"].$lte = d;
    }
    if (Object.keys(q["Date"]).length === 0) delete q["Date"];
  }

  return q;
}

export function buildMongoOptions(queryParams = {}) {
  const page = Math.max(1, parseInt(queryParams.page || "1", 10));
  const pageSize = Math.min(Math.max(1, parseInt(queryParams.pageSize || "10", 10)), 100);

  // Sorting
  // Accept sortBy values: date, quantity, customerName
  // Default: date desc (newest first)
  let sort = { "Date": -1 };
  const sortBy = queryParams.sortBy || "date";
  const sortOrder = (queryParams.sortOrder || (sortBy === "date" ? "desc" : "asc")).toLowerCase();

  const dir = sortOrder === "desc" ? -1 : 1;
  if (sortBy === "date") sort = { "Date": dir };
  else if (sortBy === "quantity" || sortBy === "Quantity") sort = { "Quantity": dir };
  else if (sortBy === "customerName" || sortBy === "Customer Name") sort = { "Customer Name": dir };

  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
    limit: pageSize,
    sort
  };
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
