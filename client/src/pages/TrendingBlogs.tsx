import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { blogAPI } from '../services/api';
import BlogCard from '../components/BlogCard';

const TrendingBlogs: React.FC = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['trending-blogs-page'],
    queryFn: () => blogAPI.getTrendingBlogs({ limit: 20, timeframe: 7 }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const trendingBlogs = data?.data.data?.blogs || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🔥 Trending Blogs
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover the most popular and engaging blogs from this week
          </p>
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-red-600">Error loading trending blogs. Please try again.</p>
          </div>
        )}

        {!isLoading && !error && (
          <>
            {trendingBlogs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trendingBlogs.map((blog, index) => (
                  <div key={blog._id} className="relative">
                    {/* Trending Rank Badge */}
                    <div className="absolute top-4 left-4 z-10 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      #{index + 1}
                    </div>
                    <BlogCard blog={blog} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No trending blogs yet
                </h3>
                <p className="text-gray-600">
                  Be the first to create engaging content that trends!
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TrendingBlogs;
