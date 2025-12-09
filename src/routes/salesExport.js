// src/routes/salesExport.js
import express from 'express';
import { Sales } from '../salesModel.js';

const router = express.Router();

router.get('/export', async (req, res) => {
  try {
    const filter = {}; // you can add filters from req.query if needed

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="sales_export.csv"');

    const cursor = Sales.find(filter).cursor();

    let headerWritten = false;
    for await (const doc of cursor) {
      const obj = doc.toObject ? doc.toObject() : doc;
      if (!headerWritten) {
        res.write(Object.keys(obj).join(',') + '\n');
        headerWritten = true;
      }
      const row = Object.values(obj).map(v => {
        if (v === null || v === undefined) return '';
        return `"${String(v).replace(/"/g, '""')}"`;
      }).join(',');
      res.write(row + '\n');
    }
    res.end();
  } catch (err) {
    console.error('Export error:', err);
    res.status(500).send('Export failed');
  }
});

export default router;
