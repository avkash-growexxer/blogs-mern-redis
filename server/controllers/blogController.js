const Blog = require('../models/Blog');
const { clearRouteCache } = require('../middleware/cache');

/**
 * @desc    Get all blogs with pagination and filtering
 * @route   GET /api/blogs
 * @access  Public
 */
const getBlogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      tags,
      author,
      search,
      status = 'published',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = { status };

    if (category) {
      query.category = category.toLowerCase();
    }

    if (tags) {
      query.tags = { $in: tags.split(',').map(tag => tag.trim().toLowerCase()) };
    }

    if (author) {
      query.author = author;
    }

    if (search) {
      // Use flexible search that works with short terms
      const searchRegex = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.$or = [
        { title: searchRegex },
        { content: searchRegex },
        { excerpt: searchRegex },
        { tags: { $in: [searchRegex] } },
        { category: searchRegex }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with optimization
    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .populate('author', 'username firstName lastName avatar')
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(), // Use lean() for better performance
      Blog.countDocuments(query)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limitNum);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      success: true,
      data: {
        blogs,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalBlogs: total,
          hasNextPage,
          hasPrevPage,
          limit: limitNum
        }
      }
    });

  } catch (error) {
    console.error('Get blogs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching blogs'
    });
  }
};

/**
 * @desc    Get trending blogs
 * @route   GET /api/blogs/trending
 * @access  Public
 */
const getTrendingBlogs = async (req, res) => {
  try {
    const { limit = 10, timeframe = 7 } = req.query;

    const trendingBlogs = await Blog.findTrending(
      parseInt(limit),
      parseInt(timeframe)
    );

    res.json({
      success: true,
      data: { blogs: trendingBlogs }
    });

  } catch (error) {
    console.error('Get trending blogs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching trending blogs'
    });
  }
};

/**
 * @desc    Get single blog by ID
 * @route   GET /api/blogs/:id
 * @access  Public
 */
const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;

    // Increment views and get blog
    const blog = await Blog.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate('author', 'username firstName lastName avatar bio')
      .populate('comments.author', 'username firstName lastName avatar')
      .lean();

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Only show published blogs to non-owners
    if (blog.status !== 'published' && 
        (!req.user || blog.author._id.toString() !== req.user.id)) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    res.json({
      success: true,
      data: { blog }
    });

  } catch (error) {
    console.error('Get blog by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching blog'
    });
  }
};

/**
 * @desc    Create new blog
 * @route   POST /api/blogs
 * @access  Private
 */
const createBlog = async (req, res) => {
  try {
    const blogData = {
      ...req.body,
      author: req.user.id
    };

    const blog = new Blog(blogData);
    await blog.save();

    // Populate author data
    await blog.populate('author', 'username firstName lastName avatar');

    // Clear relevant caches
    await clearRouteCache(['/api/blogs', '/api/blogs/trending']);

    res.status(201).json({
      success: true,
      message: 'Blog created successfully',
      data: { blog }
    });

  } catch (error) {
    console.error('Create blog error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating blog'
    });
  }
};

/**
 * @desc    Update blog
 * @route   PUT /api/blogs/:id
 * @access  Private (Owner/Admin)
 */
const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    
    const blog = await Blog.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('author', 'username firstName lastName avatar');

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Clear relevant caches
    await clearRouteCache(['/api/blogs', '/api/blogs/trending', `/api/blogs/${id}`]);

    res.json({
      success: true,
      message: 'Blog updated successfully',
      data: { blog }
    });

  } catch (error) {
    console.error('Update blog error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating blog'
    });
  }
};

/**
 * @desc    Delete blog
 * @route   DELETE /api/blogs/:id
 * @access  Private (Owner/Admin)
 */
const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findByIdAndDelete(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Clear relevant caches
    await clearRouteCache(['/api/blogs', '/api/blogs/trending', `/api/blogs/${id}`]);

    res.json({
      success: true,
      message: 'Blog deleted successfully'
    });

  } catch (error) {
    console.error('Delete blog error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting blog'
    });
  }
};

/**
 * @desc    Like/Unlike blog
 * @route   POST /api/blogs/:id/like
 * @access  Private
 */
const toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    const existingLike = blog.likes.find(
      like => like.user.toString() === userId
    );

    let message;
    if (existingLike) {
      await blog.removeLike(userId);
      message = 'Blog unliked successfully';
    } else {
      await blog.addLike(userId);
      message = 'Blog liked successfully';
    }

    // Clear blog cache
    await clearRouteCache([`/api/blogs/${id}`, '/api/blogs/trending']);

    res.json({
      success: true,
      message,
      data: { 
        likesCount: blog.likesCount,
        isLiked: !existingLike 
      }
    });

  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error toggling like'
    });
  }
};

/**
 * @desc    Add comment to blog
 * @route   POST /api/blogs/:id/comments
 * @access  Private
 */
const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    await blog.addComment(userId, content);

    // Populate the new comment
    await blog.populate('comments.author', 'username firstName lastName avatar');

    // Clear blog cache
    await clearRouteCache([`/api/blogs/${id}`, '/api/blogs/trending']);

    const newComment = blog.comments[blog.comments.length - 1];

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: { comment: newComment }
    });

  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding comment'
    });
  }
};

/**
 * @desc    Get user's blogs
 * @route   GET /api/blogs/user/:userId
 * @access  Public
 */
const getUserBlogs = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // Only show published blogs unless it's the user's own profile
    const query = { author: userId };
    if (!req.user || req.user.id !== userId) {
      query.status = 'published';
    }

    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .populate('author', 'username firstName lastName avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Blog.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.json({
      success: true,
      data: {
        blogs,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalBlogs: total,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
          limit: limitNum
        }
      }
    });

  } catch (error) {
    console.error('Get user blogs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user blogs'
    });
  }
};

module.exports = {
  getBlogs,
  getTrendingBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  toggleLike,
  addComment,
  getUserBlogs
};
