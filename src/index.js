// src/index.js
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { connectDB } from './db.js';
import salesRoutes from './routes/salesRoutes.js';
import salesExport from './routes/salesExport.js';

console.log('Starting server — attempting DB connection...');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.send('Backend running'));

const startServer = async () => {
  try {
    await connectDB();

    // register API routes after DB connected
    app.use('/api/sales', salesRoutes);      // GET list: /api/sales
    app.use('/api/sales', salesExport);      // export: /api/sales/export

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server listening on http://localhost:${PORT}`));
  } catch (err) {
    console.error('Failed to start server:', err);
  }
};

startServer();
