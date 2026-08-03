import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { apiLimiter } from './middleware/rateLimiter';
import authRoutes from './routes/authRoutes';
import sessionRoutes from './routes/sessionRoutes';
import activityRoutes from './routes/activityRoutes';
import screenshotRoutes from './routes/screenshotRoutes';
import settingsRoutes from './routes/settingsRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import logger from './utils/logger';

const app = express();

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false, // Allows streaming screenshots to external dashboard domain
}));
app.use(cors());

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.originalUrl} - IP: ${req.ip}`);
  next();
});

// JSON and Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply rate limiter to general api
app.use('/api/', apiLimiter);

// Serve static screenshots folder (backup, though controller is preferred for auth checking)
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// Routes Mount
app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/screenshots', screenshotRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Base Route
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Visual AI Agent Backend API running successfully' });
});

// 404 Route handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Resource not found' });
});

// Global Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(`Unhandled exception error: ${err.message}`);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error',
  });
});

export default app;
