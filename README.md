# MERN Blog Application with Redis Caching

A high-performance full-stack blog application built with the MERN stack (MongoDB, Express.js, React, Node.js) featuring Redis caching and optimized database queries.

## 🚀 Features

### Performance Optimizations
- **Redis Caching**: GET API responses cached with configurable TTL
- **MongoDB Indexing**: Optimized database indexes for faster queries
- **Lean Queries**: MongoDB `.lean()` for improved performance
- **Query Projections**: Only fetch required fields
- **Aggregation Pipeline**: Efficient trending blog calculations
- **Pagination**: Server-side pagination for large datasets

### Security & Best Practices
- **JWT Authentication**: Secure user authentication
- **Input Validation**: Express-validator for request validation
- **Rate Limiting**: Protection against API abuse
- **Security Headers**: Helmet.js for security headers
- **CORS Protection**: Configurable cross-origin requests
- **Password Hashing**: Bcrypt for secure password storage

### Blog Features
- **Create/Read/Update/Delete** blogs
- **Trending Blogs**: Based on views, likes, and comments
- **Search Functionality**: Full-text search across blogs
- **Categories & Tags**: Organize content
- **Comments System**: User interactions
- **Like/Unlike**: Social features
- **Draft/Published Status**: Content management

### Frontend Features
- **React with TypeScript**: Type-safe development
- **TailwindCSS**: Modern, responsive UI
- **React Router**: Client-side routing
- **TanStack Query**: Efficient data fetching and caching
- **Context API**: Global state management
- **Responsive Design**: Mobile-first approach

## 📁 Project Structure

```
mern-task/
├── server/                 # Backend Express.js application
│   ├── config/            # Database and Redis configuration
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Custom middleware
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── utils/            # Utility functions
│   ├── .env              # Environment variables
│   ├── .env.example      # Environment template
│   └── server.js         # Main server file
├── client/               # Frontend React application
│   ├── public/          # Static files
│   ├── src/
│   │   ├── components/  # Reusable React components
│   │   ├── contexts/    # React contexts
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   └── utils/       # Utility functions
│   ├── tailwind.config.js
│   └── package.json
├── .gitignore
├── README.md
└── package.json
```

## 🛠 Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **Redis** - In-memory caching
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Express-validator** - Input validation
- **Helmet** - Security headers
- **Morgan** - HTTP logging
- **Compression** - Response compression

### Frontend
- **React 19** - UI library
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **React Router** - Routing
- **TanStack Query** - Data fetching
- **Axios** - HTTP client

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v16 or higher)
- **MongoDB** (v4.4 or higher)
- **Redis** (v6 or higher)
- **npm** or **yarn**

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd mern-task
```

### 2. Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Environment Configuration

Create environment files:

```bash
# Copy server environment template
cd server
cp .env.example .env
```

Update the `.env` file with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/mern-blog

# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d

# Cache Configuration
CACHE_TTL=300
TRENDING_CACHE_TTL=600

# CORS Configuration
CLIENT_URL=http://localhost:3000
```

### 4. Start Services

Start MongoDB and Redis services:

```bash
# Start MongoDB (Ubuntu/Debian)
sudo systemctl start mongod

# Start Redis (Ubuntu/Debian)
sudo systemctl start redis-server

# Alternative: Using Docker
docker run -d -p 27017:27017 --name mongodb mongo
docker run -d -p 6379:6379 --name redis redis
```

### 5. Run the Application

#### Development Mode

```bash
# Terminal 1: Start the backend server
cd server
npm run dev

# Terminal 2: Start the frontend
cd client
npm start
```

#### Production Mode

```bash
# Build the frontend
cd client
npm run build

# Start the server
cd ../server
npm start
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/password` - Change password
- `POST /api/auth/logout` - User logout

### Blogs
- `GET /api/blogs` - Get all blogs (paginated)
- `GET /api/blogs/trending` - Get trending blogs
- `GET /api/blogs/:id` - Get single blog
- `POST /api/blogs` - Create new blog
- `PUT /api/blogs/:id` - Update blog
- `DELETE /api/blogs/:id` - Delete blog
- `POST /api/blogs/:id/like` - Like/unlike blog
- `POST /api/blogs/:id/comments` - Add comment

### Utility
- `GET /api/health` - Health check
- `GET /api` - API information

## 🎯 Performance Features

### Redis Caching Strategy

The application implements intelligent caching:

1. **Blog Lists**: Cached for 5 minutes
2. **Trending Blogs**: Cached for 10 minutes
3. **Individual Blogs**: Cached for 5 minutes
4. **Auto-invalidation**: Cache cleared on data updates

### Database Optimization

1. **Indexes**:
   - Text search index on title and content
   - Compound indexes for trending queries
   - Author and category indexes

2. **Query Optimization**:
   - `.lean()` queries for read operations
   - Field projections to reduce data transfer
   - Aggregation pipelines for complex queries

### Frontend Optimization

1. **TanStack Query**: Intelligent caching and background updates
2. **Lazy Loading**: Components loaded on demand
3. **Optimistic Updates**: Immediate UI feedback

## 🧪 Testing the Application

### 1. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

### 2. Test User Journey

1. **Register** a new account
2. **Login** with credentials
3. **Create** a new blog post
4. **View** trending blogs
5. **Like** and **comment** on blogs
6. **Test caching** by monitoring Redis logs

### 3. Monitor Performance

```bash
# Monitor Redis cache hits/misses
redis-cli monitor

# Check MongoDB query performance
# In MongoDB shell:
db.setProfilingLevel(2)
db.system.profile.find().limit(5).sort({ts:-1}).pretty()
```

## 🔧 Configuration Options

### Cache Configuration

```env
CACHE_TTL=300              # General cache TTL (5 minutes)
TRENDING_CACHE_TTL=600     # Trending blogs TTL (10 minutes)
```

### Rate Limiting

```env
RATE_LIMIT_WINDOW_MS=900000    # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100    # 100 requests per window
```

### Database Configuration

```env
MONGODB_URI=mongodb://localhost:27017/mern-blog
REDIS_URL=redis://localhost:6379
```

## 🚢 Deployment

### Using Docker

```bash
# Build Docker images
docker build -t mern-blog-server ./server
docker build -t mern-blog-client ./client

# Run with Docker Compose (create docker-compose.yml)
docker-compose up -d
```

### Environment Variables for Production

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mern-blog
REDIS_URL=redis://your-redis-instance:6379
JWT_SECRET=your-super-secure-production-secret
CLIENT_URL=https://your-domain.com
```

## 📊 Monitoring & Analytics

### Redis Monitoring

```bash
# Check Redis info
redis-cli info

# Monitor cache operations
redis-cli monitor

# Check memory usage
redis-cli info memory
```

### MongoDB Monitoring

```bash
# Check database stats
mongo mern-blog --eval "db.stats()"

# Monitor slow queries
mongo mern-blog --eval "db.setProfilingLevel(1, {slowms: 100})"
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📜 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   ```bash
   # Check if MongoDB is running
   sudo systemctl status mongod
   ```

2. **Redis Connection Error**
   ```bash
   # Check if Redis is running
   redis-cli ping
   ```

3. **Port Already in Use**
   ```bash
   # Kill process on port 5000
   lsof -ti:5000 | xargs kill -9
   ```

4. **Cache Not Working**
   - Verify Redis connection
   - Check environment variables
   - Monitor Redis logs

### Performance Tips

1. **Increase Redis Memory**
   ```bash
   redis-cli config set maxmemory 256mb
   ```

2. **MongoDB Index Creation**
   ```javascript
   db.blogs.createIndex({ title: "text", content: "text" })
   ```

3. **Monitor Query Performance**
   ```javascript
   db.blogs.find().explain("executionStats")
   ```

## 📚 Additional Resources

- [MongoDB Optimization Guide](https://docs.mongodb.com/manual/optimization/)
- [Redis Best Practices](https://redis.io/topics/best-practices)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [React Performance Guide](https://react.dev/learn/render-and-commit)
