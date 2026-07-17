const path = require('path');
const dotenv = require('dotenv');

// Load environment variables (absolute path relative to this file)
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const apiRoutes = require('./routes');

const app = express();
const PORT = process.env.PORT || 5000;

const setupAndStartServer = () => {
  // Configure CORS to permit credentials (cookies)
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:8080',
    process.env.CLIENT_URL,
    process.env.RENDER_EXTERNAL_URL
  ].filter(Boolean);

  const corsOptions = {
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (
        origin.startsWith('http://localhost:') || 
        origin.startsWith('http://127.0.0.1:') ||
        allowedOrigins.includes(origin) ||
        origin.includes('.onrender.com') ||
        origin.includes('.vercel.app')
      ) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    optionsSuccessStatus: 200
  };

  // Parsing Middlewares
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      success: true,
      message: 'Midis CMS API Server'
    });
  });

  // Mount API router under /api with CORS enabled specifically for API endpoints
  app.use('/api', cors(corsOptions), apiRoutes);

  // Serve static files from the frontend build
  app.use(express.static(path.join(__dirname, '../CMS_Frontend/dist')));

  // Serve uploaded files statically
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

  // Wildcard route to serve index.html for client-side routing (Single Page Application fallback)
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../CMS_Frontend/dist/index.html'));
  });

  // Global error handler
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
      success: false,
      error: err.message || 'Internal Server Error'
    });
  });

  // Connect to MongoDB Atlas (asynchronous, doesn't block server startup)
  connectDB();

  // Listen for requests
  const server = app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
  });
};

setupAndStartServer();
