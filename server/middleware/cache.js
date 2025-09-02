const { getRedisClient } = require('../config/redis');

/**
 * Cache middleware for GET requests
 * @param {number} ttl - Time to live in seconds (default: 300)
 * @param {string} keyPrefix - Prefix for cache key
 */
const cache = (ttl = 300, keyPrefix = 'cache') => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const redisClient = getRedisClient();
    
    // If Redis is not available, skip caching
    if (!redisClient) {
      return next();
    }

    try {
      // Generate cache key from URL and query parameters
      const cacheKey = generateCacheKey(req, keyPrefix);
      
      // Try to get cached data
      const cachedData = await redisClient.get(cacheKey);
      
      if (cachedData) {
        console.log(`Cache HIT for key: ${cacheKey}`);
        
        // Parse and return cached data
        const parsedData = JSON.parse(cachedData);
        
        // Add cache headers
        res.set({
          'X-Cache-Status': 'HIT',
          'X-Cache-Key': cacheKey,
          'Cache-Control': `public, max-age=${ttl}`
        });
        
        return res.json(parsedData);
      }

      console.log(`Cache MISS for key: ${cacheKey}`);
      
      // Store original res.json method
      const originalJson = res.json;
      
      // Override res.json to cache the response
      res.json = function(data) {
        // Cache the response data
        cacheResponse(redisClient, cacheKey, data, ttl);
        
        // Add cache headers
        res.set({
          'X-Cache-Status': 'MISS',
          'X-Cache-Key': cacheKey,
          'Cache-Control': `public, max-age=${ttl}`
        });
        
        // Call original json method
        return originalJson.call(this, data);
      };
      
      next();
      
    } catch (error) {
      console.error('Cache middleware error:', error);
      // Continue without caching if there's an error
      next();
    }
  };
};

/**
 * Generate cache key from request
 */
const generateCacheKey = (req, prefix) => {
  const url = req.originalUrl || req.url;
  const userId = req.user ? req.user.id : 'anonymous';
  const userRole = req.user ? req.user.role : 'guest';
  
  // Include user context for personalized caching
  return `${prefix}:${userRole}:${userId}:${url}`;
};

/**
 * Cache response data
 */
const cacheResponse = async (redisClient, key, data, ttl) => {
  try {
    await redisClient.setEx(key, ttl, JSON.stringify(data));
    console.log(`Cached data for key: ${key} (TTL: ${ttl}s)`);
  } catch (error) {
    console.error('Error caching response:', error);
  }
};

/**
 * Clear cache by pattern
 */
const clearCache = async (pattern = '*') => {
  const redisClient = getRedisClient();
  
  if (!redisClient) {
    console.log('Redis not available, cannot clear cache');
    return;
  }

  try {
    const keys = await redisClient.keys(pattern);
    
    if (keys.length > 0) {
      await redisClient.del(keys);
      console.log(`Cleared ${keys.length} cache keys matching pattern: ${pattern}`);
    }
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
};

/**
 * Clear cache for specific routes
 */
const clearRouteCache = async (routes = []) => {
  const redisClient = getRedisClient();
  
  if (!redisClient) {
    return;
  }

  try {
    for (const route of routes) {
      const pattern = `cache:*:*:${route}*`;
      await clearCache(pattern);
    }
  } catch (error) {
    console.error('Error clearing route cache:', error);
  }
};

/**
 * Middleware to clear cache after data modification
 */
const clearCacheAfterUpdate = (routes = []) => {
  return async (req, res, next) => {
    // Store original methods
    const originalJson = res.json;
    const originalSend = res.send;
    
    // Override response methods to clear cache after successful responses
    const clearCacheIfSuccess = function(data) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        clearRouteCache(routes);
      }
      return data;
    };
    
    res.json = function(data) {
      const result = clearCacheIfSuccess(data);
      return originalJson.call(this, result);
    };
    
    res.send = function(data) {
      clearCacheIfSuccess(data);
      return originalSend.call(this, data);
    };
    
    next();
  };
};

/**
 * Cache trending blogs specifically
 */
const cacheTrending = cache(
  parseInt(process.env.TRENDING_CACHE_TTL) || 600,
  'trending'
);

/**
 * Cache individual blog posts
 */
const cacheBlog = cache(
  parseInt(process.env.CACHE_TTL) || 300,
  'blog'
);

/**
 * Cache blog list
 */
const cacheBlogList = cache(
  parseInt(process.env.CACHE_TTL) || 300,
  'blogs'
);

module.exports = {
  cache,
  clearCache,
  clearRouteCache,
  clearCacheAfterUpdate,
  cacheTrending,
  cacheBlog,
  cacheBlogList
};
