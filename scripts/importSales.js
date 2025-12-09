// scripts/importSales.js
import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';
import csvParser from 'csv-parser';
import mongoose from 'mongoose';

const BATCH_SIZE = 1000;
const CSV_PATH = process.env.SALES_CSV_PATH || path.join(process.cwd(), 'sales.csv');

const SalesSchema = new mongoose.Schema({}, { strict: false });
const Sales = mongoose.model('SalesImport', SalesSchema, 'sales');

async function run() {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI not set in .env');
  await mongoose.connect(process.env.MONGO_URI, { dbName: process.env.MONGO_DB_NAME || undefined });

  const stream = fs.createReadStream(CSV_PATH).pipe(csvParser());
  let batch = [];
  let count = 0;

  for await (const row of stream) {
    batch.push(row);
    if (batch.length >= BATCH_SIZE) {
      await Sales.insertMany(batch, { ordered: false });
      count += batch.length;
      console.log('Inserted', count);
      batch = [];
    }
  }

  if (batch.length) {
    await Sales.insertMany(batch, { ordered: false });
    count += batch.length;
    console.log('Inserted', count);
  }

  await mongoose.disconnect();
  console.log('Import complete. Total rows:', count);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
