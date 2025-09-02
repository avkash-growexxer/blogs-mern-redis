const express = require('express');
const router = express.Router();

// Controllers
const {
  getBlogs,
  getTrendingBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  toggleLike,
  addComment,
  getUserBlogs
} = require('../controllers/blogController');

// Middleware
const { authenticate, optionalAuth, checkOwnership } = require('../middleware/auth');
const {
  validateBlogCreation,
  validateBlogUpdate,
  validateComment
} = require('../middleware/validation');
const {
  cacheBlogList,
  cacheTrending,
  cacheBlog,
  clearCacheAfterUpdate
} = require('../middleware/cache');
const Blog = require('../models/Blog');

// @route   GET /api/blogs
// @desc    Get all blogs with pagination and filtering
// @access  Public
router.get('/', cacheBlogList, getBlogs);

// @route   GET /api/blogs/trending
// @desc    Get trending blogs
// @access  Public
router.get('/trending', cacheTrending, getTrendingBlogs);

// @route   GET /api/blogs/user/:userId
// @desc    Get user's blogs
// @access  Public
router.get('/user/:userId', optionalAuth, cacheBlogList, getUserBlogs);

// @route   GET /api/blogs/:id
// @desc    Get single blog by ID
// @access  Public
router.get('/:id', optionalAuth, cacheBlog, getBlogById);

// @route   POST /api/blogs
// @desc    Create new blog
// @access  Private
router.post('/', 
  authenticate, 
  validateBlogCreation, 
  clearCacheAfterUpdate(['/api/blogs', '/api/blogs/trending']),
  createBlog
);

// @route   PUT /api/blogs/:id
// @desc    Update blog
// @access  Private (Owner/Admin)
router.put('/:id', 
  authenticate, 
  checkOwnership(Blog),
  validateBlogUpdate,
  clearCacheAfterUpdate(['/api/blogs', '/api/blogs/trending']),
  updateBlog
);

// @route   DELETE /api/blogs/:id
// @desc    Delete blog
// @access  Private (Owner/Admin)
router.delete('/:id', 
  authenticate, 
  checkOwnership(Blog),
  clearCacheAfterUpdate(['/api/blogs', '/api/blogs/trending']),
  deleteBlog
);

// @route   POST /api/blogs/:id/like
// @desc    Like/Unlike blog
// @access  Private
router.post('/:id/like', 
  authenticate,
  clearCacheAfterUpdate(['/api/blogs/trending']),
  toggleLike
);

// @route   POST /api/blogs/:id/comments
// @desc    Add comment to blog
// @access  Private
router.post('/:id/comments', 
  authenticate, 
  validateComment,
  clearCacheAfterUpdate(['/api/blogs/trending']),
  addComment
);

module.exports = router;
