import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { blogAPI, Blog } from '../services/api';
import BlogCard from '../components/BlogCard';

const Home: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Debounced search term to avoid too many API calls
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset page when search changes
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch blogs
  const { data: blogsData, isLoading, error } = useQuery({
    queryKey: ['blogs', currentPage, debouncedSearchTerm, selectedCategory],
    queryFn: () => blogAPI.getBlogs({
      page: currentPage,
      limit: 12,
      search: debouncedSearchTerm || undefined,
      category: selectedCategory || undefined,
    }),
    placeholderData: keepPreviousData,
  });

  // Fetch trending blogs for sidebar
  const { data: trendingData } = useQuery({
    queryKey: ['trending-blogs'],
    queryFn: () => blogAPI.getTrendingBlogs({ limit: 5 }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const blogs = blogsData?.data.data?.blogs || [];
  const pagination = blogsData?.data.data?.pagination;
  const trendingBlogs = trendingData?.data.data?.blogs || [];

  const categories = [
    'All', 'Technology', 'Design', 'Business', 'Health', 
    'Travel', 'Food', 'Lifestyle', 'Education', 'Entertainment'
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category === 'All' ? '' : category.toLowerCase());
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Discover Amazing Stories
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Read, write, and share stories that matter. Join our community of writers and readers.
            </p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-md mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for blogs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pl-12 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <main className="flex-1">
            {/* Category Filter */}
            <div className="mb-8">
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryChange(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      (category === 'All' && !selectedCategory) || 
                      (category.toLowerCase() === selectedCategory)
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Loading State */}
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

            {/* Error State */}
            {error && (
              <div className="text-center py-12">
                <p className="text-red-600">Error loading blogs. Please try again.</p>
              </div>
            )}

            {/* Blogs Grid */}
            {!isLoading && !error && (
              <>
                {blogs.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {blogs.map((blog) => (
                      <BlogCard key={blog._id} blog={blog} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-600">No blogs found.</p>
                    <Link 
                      to="/create" 
                      className="inline-block mt-4 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Write the first blog
                    </Link>
                  </div>
                )}

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={!pagination.hasPrevPage}
                      className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    
                    <span className="px-4 py-2 text-gray-700">
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                    
                    <button
                      onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
                      disabled={!pagination.hasNextPage}
                      className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </main>

          {/* Sidebar */}
          <aside className="w-full lg:w-80">
            {/* Trending Blogs */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                🔥 Trending This Week
              </h3>
              
              {trendingBlogs.length > 0 ? (
                <div className="space-y-4">
                  {trendingBlogs.map((blog, index) => (
                    <div key={blog._id} className="flex items-start space-x-3">
                      <span className="text-blue-600 font-bold text-lg">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <Link 
                          to={`/blog/${blog._id}`}
                          className="block text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors line-clamp-2"
                        >
                          {blog.title}
                        </Link>
                        <p className="text-xs text-gray-500 mt-1">
                          {blog.views} views • {blog.likesCount} likes
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-sm">No trending blogs yet.</p>
              )}
            </div>

            {/* Call to Action */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">Start Writing Today</h3>
              <p className="text-blue-100 text-sm mb-4">
                Share your thoughts, experiences, and knowledge with the world.
              </p>
              <Link 
                to="/create"
                className="inline-block bg-white text-blue-600 px-4 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors"
              >
                Create Blog
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Home;
