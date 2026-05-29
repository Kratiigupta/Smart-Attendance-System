import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';
import apiRouter from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

// Setup environment and database
connectDB();

const app = express();
const httpServer = createServer(app);

// CORS dynamic origin helper
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean | string) => void) => {
    if (!origin) {
      callback(null, true);
      return;
    }
    const isAllowed = 
      origin === env.FRONTEND_URL ||
      origin.endsWith('.vercel.app') ||
      /^http:\/\/localhost:\d+$/.test(origin);
    
    if (isAllowed) {
      callback(null, origin);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH']
};

// Socket.io initialization
const io = new Server(httpServer, {
  cors: corsOptions
});

// Middleware stack
app.use(helmet({
  crossOriginResourcePolicy: false // Allow images/assets loading from backend if needed
}));
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Mount all API endpoints
app.use('/api', apiRouter);

// Base route checks
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', time: new Date() });
});

// Error handling middleware
app.use(errorHandler);

// Listen to socket connections (for Phase 2 dynamic updates)
io.on('connection', (socket) => {
  console.log(`🔌 Socket connection established: ${socket.id}`);
  
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`👤 Socket ${socket.id} joined room: ${roomId}`);
  });

  socket.on('send-notification', (data) => {
    console.log(`📢 Broadcasting simulated notification:`, data);
    io.emit('new-notification', data);
  });

  // --- Real-time Attendance & Security Events ---
  socket.on('session:start', (data) => {
    console.log(`🚀 Broadcast session:start:`, data);
    io.emit('session:start', data);
  });

  socket.on('attendance:update', (data) => {
    console.log(`📊 Broadcast attendance:update:`, data);
    if (data.sessionId) {
      io.to(`session_${data.sessionId}`).emit('attendance:update', data);
    } else {
      io.emit('attendance:update', data);
    }
  });

  socket.on('security:alert', (data) => {
    console.log(`⚠️ Broadcast security:alert:`, data);
    if (data.sessionId) {
      io.to(`session_${data.sessionId}`).emit('security:alert', data);
    } else {
      io.emit('security:alert', data);
    }
  });

  socket.on('notification:new', (data) => {
    console.log(`📢 Broadcast notification:new:`, data);
    io.emit('notification:new', data);
  });

  socket.on('student:checkedin', (data) => {
    console.log(`👤 Broadcast student:checkedin:`, data);
    if (data.sessionId) {
      io.to(`session_${data.sessionId}`).emit('student:checkedin', data);
    } else {
      io.emit('student:checkedin', data);
    }
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Socket disconnected: ${socket.id}`);
  });
});

// Export socket io object for use in controllers/services later
export { io };

// Process crash safety handlers
process.on('uncaughtException', (error) => {
  console.error('💥 CRITICAL: Uncaught Exception occurred:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 CRITICAL: Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start Server
const PORT = env.PORT;
httpServer.listen(PORT, () => {
  console.log(`🚀 SmartEdu Campus API Server running on port ${PORT} in ${env.NODE_ENV} mode`);
});

