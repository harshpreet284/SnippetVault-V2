import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

// Load environment variables first — before any other imports that need them
dotenv.config();

import connectDB from './config/db.js';
import healthRouter from './routes/health.js';
import authRouter from './routes/auth.js';

const app = express();
const PORT = process.env.PORT || 5000;

// ─── CORS ─────────────────────────────────────────────────────────────────────
// credentials: true is required so the browser sends the httpOnly token cookie
// on cross-origin requests (Vite dev server → Express backend).
// The origin must be a specific URL when credentials are enabled.
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json());

// ─── Cookie Parsing ───────────────────────────────────────────────────────────
// Must be mounted before any route handler that reads req.cookies.
app.use(cookieParser());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
// Future route mounts go here as phases are completed:
// app.use('/api/solutions', solutionsRouter);  // Phase 4-6

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
// Must have four parameters so Express recognises it as an error handler.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// ─── Startup ──────────────────────────────────────────────────────────────────
// Connect to MongoDB first. connectDB() calls process.exit(1) on failure,
// so app.listen() is only reached after a confirmed DB connection.
const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(
      `[Server] SnippetVault running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`
    );
  });
};

start();
