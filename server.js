import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, isDatabaseConnected } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import memberRoutes from './routes/memberRoutes.js';
import financeRoutes from './routes/financeRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import wingRoutes from './routes/wingRoutes.js';
import programRoutes from './routes/programRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import issueRoutes from './routes/issueRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import educationRoutes from './routes/educationRoutes.js';

// Load environment variables
dotenv.config();

// Validate critical environment variables
import { validateEnv } from './config/env.js';
validateEnv();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Database connection (handles MongoDB or resilient store)
connectDB();

// Middleware
const rawClientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
const clientOrigin = rawClientUrl.replace(/\/+$/, '');

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      const cleanOrigin = origin.replace(/\/+$/, '');
      if (
        cleanOrigin === clientOrigin ||
        cleanOrigin.endsWith('.vercel.app') ||
        cleanOrigin.includes('localhost') ||
        cleanOrigin.includes('127.0.0.1')
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);
app.options('*', cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'We Can Change (WCC) API Service',
    version: '1.0.0',
    status: 'active',
    database: isDatabaseConnected() ? 'MongoDB (Connected)' : 'Resilient In-Memory Store (Active)',
    endpoints: {
      auth: '/api/auth',
      members: '/api/members',
      finance: '/api/finance',
      audit: '/api/audit',
      wings: '/api/wings',
      programs: '/api/programs',
      events: '/api/events',
      issues: '/api/issues',
      stats: '/api/stats',
      health: '/api/health'
    }
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'wcc_api is running smoothly',
    database: isDatabaseConnected() ? 'MongoDB' : 'MemoryCache',
    timestamp: new Date().toISOString()
  });
});

// API Routes (supports both /api/* and root /* for resilience)
const routes = [
  ['/auth', authRoutes],
  ['/members', memberRoutes],
  ['/finance', financeRoutes],
  ['/audit', auditRoutes],
  ['/wings', wingRoutes],
  ['/programs', programRoutes],
  ['/events', eventRoutes],
  ['/issues', issueRoutes],
  ['/stats', statsRoutes],
  ['/notifications', notificationRoutes],
  ['/education', educationRoutes]
];

routes.forEach(([path, router]) => {
  app.use(`/api${path}`, router);
  app.use(path, router);
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.originalUrl} not found` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[API Error]', err.stack || err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// Start listening
const server = app.listen(PORT, () => {
  console.log(`[wcc_api] Server running on http://localhost:${PORT}`);
  console.log(`[wcc_api] Health check: http://localhost:${PORT}/api/health`);
});

export default app;
