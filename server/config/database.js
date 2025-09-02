const mongoose = require('mongoose');

const connectDatabase = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Create indexes for performance optimization
    await createIndexes();
    
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const createIndexes = async () => {
  try {
    // Import models to ensure they're registered
    require('../models/Blog');
    require('../models/User');
    
    // Blog indexes for performance
    await mongoose.model('Blog').collection.createIndex({ views: -1 });
    await mongoose.model('Blog').collection.createIndex({ comments: -1 });
    await mongoose.model('Blog').collection.createIndex({ createdAt: -1 });
    await mongoose.model('Blog').collection.createIndex({ author: 1 });
    await mongoose.model('Blog').collection.createIndex({ 
      title: 'text', 
      content: 'text' 
    }, { 
      weights: { title: 10, content: 5 },
      name: 'blog_text_index'
    });
    
    // User indexes
    await mongoose.model('User').collection.createIndex({ email: 1 }, { unique: true });
    await mongoose.model('User').collection.createIndex({ username: 1 }, { unique: true });
    
    console.log('Database indexes created successfully');
  } catch (error) {
    console.error('Error creating indexes:', error);
  }
};

module.exports = connectDatabase;
