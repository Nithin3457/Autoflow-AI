import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import authMiddleware from './middlewares/auth.js';
import errorHandler from './middlewares/errorHandler.js';
import requestRoutes from './routes/requestRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import userRoutes from './routes/userRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for Vite frontend (http://localhost:5173 or other ports)
app.use(cors({
  origin: true,
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id', 'x-user-role']
}));

// Body parser
app.use(express.json());

// Request logging in development
app.use((req, res, next) => {
  const userRole = req.headers['x-user-role'] || 'ANON';
  console.log(`[${new Date().toISOString().slice(11, 19)}] ${req.method} ${req.url} - Role: ${userRole}`);
  next();
});

// Mock Auth & Identity extraction
app.use(authMiddleware);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'AutoFlow AI Backend Orchestrator',
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    supabaseConfigured: !!process.env.SUPABASE_URL,
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/requests', requestRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', userRoutes);

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint Not Found' });
});

// Central Error Masking Handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log('='.repeat(70));
  console.log(`🚀 AutoFlow AI Backend Server running on http://localhost:${PORT}`);
  console.log(`📡 Ready to orchestrate workflows with Google Gemini SDK & Supabase`);
  console.log('='.repeat(70));
});

export default app;
