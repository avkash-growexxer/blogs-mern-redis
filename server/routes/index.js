const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const blogRoutes = require('./blogs');

// Health check route
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API information route
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'MERN Blog API',
    version: '1.0.0',
    description: 'A high-performance blog API with Redis caching and MongoDB optimization',
    endpoints: {
      auth: '/api/auth',
      blogs: '/api/blogs',
      health: '/api/health'
    },
    features: [
      'Redis caching for performance',
      'MongoDB query optimization',
      'JWT authentication',
      'Input validation',
      'Rate limiting',
      'Security middleware'
    ]
  });
});

// Mount route modules
router.use('/auth', authRoutes);
router.use('/blogs', blogRoutes);

// 404 handler for API routes
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    requestedPath: req.originalUrl
  });
});

module.exports = router;
