import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDatabase from './config/database';
import { errorHandler } from './middleware/errorHandler';

// Routes
import authRoutes from './routes/authRoutes';
import announcementRoutes from './routes/announcementRoutes';
import eventRoutes from './routes/eventRoutes';
import devotionalRoutes from './routes/devotionalRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
connectDatabase();

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Methodist Community Four App API' });
});

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/announcements', announcementRoutes);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/devotionals', devotionalRoutes);

// Error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Methodist Community Four App API`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
