const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    trim: true,
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Blog title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Blog content is required'],
    trim: true
  },
  excerpt: {
    type: String,
    trim: true,
    maxlength: [500, 'Excerpt cannot exceed 500 characters']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  category: {
    type: String,
    trim: true,
    lowercase: true,
    default: 'general'
  },
  featuredImage: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  views: {
    type: Number,
    default: 0,
    min: 0
  },
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [commentSchema],
  publishedAt: {
    type: Date
  },
  readTime: {
    type: Number, // in minutes
    default: 1
  },
  seoTitle: {
    type: String,
    trim: true,
    maxlength: [60, 'SEO title cannot exceed 60 characters']
  },
  seoDescription: {
    type: String,
    trim: true,
    maxlength: [160, 'SEO description cannot exceed 160 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for URL slug
blogSchema.virtual('slug').get(function() {
  return this.title
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
});

// Virtual for like count
blogSchema.virtual('likesCount').get(function() {
  return this.likes ? this.likes.length : 0;
});

// Virtual for comment count
blogSchema.virtual('commentsCount').get(function() {
  return this.comments ? this.comments.length : 0;
});

// Virtual for trending score (views + likes + comments)
blogSchema.virtual('trendingScore').get(function() {
  const viewsWeight = 1;
  const likesWeight = 5;
  const commentsWeight = 10;
  
  return (this.views * viewsWeight) + 
         (this.likesCount * likesWeight) + 
         (this.commentsCount * commentsWeight);
});

// Indexes for performance optimization
blogSchema.index({ author: 1 });
blogSchema.index({ status: 1 });
blogSchema.index({ publishedAt: -1 });
blogSchema.index({ createdAt: -1 });
blogSchema.index({ views: -1 });
blogSchema.index({ category: 1 });
blogSchema.index({ tags: 1 });
blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ views: -1, status: 1 });

// Text index for search functionality
blogSchema.index({ 
  title: 'text', 
  content: 'text',
  excerpt: 'text',
  tags: 'text'
}, {
  weights: {
    title: 10,
    excerpt: 5,
    content: 3,
    tags: 2
  },
  name: 'blog_text_search'
});

// Pre-save middleware
blogSchema.pre('save', function(next) {
  // Auto-generate excerpt if not provided
  if (!this.excerpt && this.content) {
    this.excerpt = this.content.substring(0, 200) + '...';
  }
  
  // Calculate read time based on content length
  if (this.content) {
    const wordsPerMinute = 200;
    const wordCount = this.content.split(/\s+/).length;
    this.readTime = Math.ceil(wordCount / wordsPerMinute);
  }
  
  // Set published date when status changes to published
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  // Auto-generate SEO fields if not provided
  if (!this.seoTitle) {
    this.seoTitle = this.title.substring(0, 60);
  }
  
  if (!this.seoDescription) {
    this.seoDescription = this.excerpt ? this.excerpt.substring(0, 160) : this.content.substring(0, 160);
  }
  
  next();
});

// Static method to find trending blogs
blogSchema.statics.findTrending = function(limit = 10, timeframe = 7) {
  const daysAgo = new Date();
  daysAgo.setDate(daysAgo.getDate() - timeframe);
  
  return this.aggregate([
    {
      $match: {
        status: 'published',
        publishedAt: { $gte: daysAgo }
      }
    },
    {
      $addFields: {
        likesCount: { $size: '$likes' },
        commentsCount: { $size: '$comments' },
        trendingScore: {
          $add: [
            '$views',
            { $multiply: [{ $size: '$likes' }, 5] },
            { $multiply: [{ $size: '$comments' }, 10] }
          ]
        }
      }
    },
    {
      $sort: { trendingScore: -1 }
    },
    {
      $limit: limit
    },
    {
      $lookup: {
        from: 'users',
        localField: 'author',
        foreignField: '_id',
        as: 'author',
        pipeline: [
          {
            $project: {
              username: 1,
              firstName: 1,
              lastName: 1,
              avatar: 1
            }
          }
        ]
      }
    },
    {
      $unwind: '$author'
    }
  ]);
};

// Static method to increment views
blogSchema.statics.incrementViews = function(blogId) {
  return this.findByIdAndUpdate(
    blogId,
    { $inc: { views: 1 } },
    { new: true }
  );
};

// Instance method to add like
blogSchema.methods.addLike = function(userId) {
  const existingLike = this.likes.find(like => like.user.toString() === userId.toString());
  
  if (!existingLike) {
    this.likes.push({ user: userId });
    return this.save();
  }
  
  return Promise.resolve(this);
};

// Instance method to remove like
blogSchema.methods.removeLike = function(userId) {
  this.likes = this.likes.filter(like => like.user.toString() !== userId.toString());
  return this.save();
};

// Instance method to add comment
blogSchema.methods.addComment = function(userId, content) {
  this.comments.push({
    author: userId,
    content: content
  });
  return this.save();
};

module.exports = mongoose.model('Blog', blogSchema);
