// backend/src/utils/dataLoader.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import csvParser from "csv-parser"; // npm i csv-parser

// create __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Load sales data CSV from backend/data/sales_data.csv
 * Returns a promise that resolves with an array of rows.
 */
export function loadSalesData() {
  // adjust this path if your CSV is located elsewhere
  const csvPath = path.resolve(__dirname, "../../data/sales_data.csv");

  console.log("DEBUG: __dirname =", __dirname);
  console.log("DEBUG: csvPath =", csvPath);

  if (!fs.existsSync(csvPath)) {
    throw new Error(`CSV file not found at: ${csvPath}`);
  }

  return new Promise((resolve, reject) => {
    const rows = [];
    fs.createReadStream(csvPath)
      .pipe(csvParser())
      .on("data", (data) => rows.push(data))
      .on("end", () => resolve(rows))
      .on("error", (err) => reject(err));
  });
}
