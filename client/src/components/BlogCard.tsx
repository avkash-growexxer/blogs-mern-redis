import React from 'react';
import { Link } from 'react-router-dom';
import { Blog } from '../services/api';

interface BlogCardProps {
  blog: Blog;
  showAuthor?: boolean;
  showStats?: boolean;
}

const BlogCard: React.FC<BlogCardProps> = ({ 
  blog, 
  showAuthor = true, 
  showStats = true 
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatReadTime = (readTime: number) => {
    return `${readTime} min read`;
  };

  return (
    <article className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200">
      {/* Featured Image */}
      {blog.featuredImage && (
        <div className="aspect-w-16 aspect-h-9">
          <img
            src={blog.featuredImage}
            alt={blog.title}
            className="w-full h-48 object-cover rounded-t-lg"
          />
        </div>
      )}

      <div className="p-6">
        {/* Category and Read Time */}
        <div className="flex items-center justify-between mb-3">
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {blog.category}
          </span>
          {showStats && (
            <span className="text-gray-500 text-sm">
              {formatReadTime(blog.readTime)}
            </span>
          )}
        </div>

        {/* Title */}
        <Link to={`/blog/${blog._id}`}>
          <h2 className="text-xl font-bold text-gray-900 mb-3 hover:text-blue-600 transition-colors line-clamp-2">
            {blog.title}
          </h2>
        </Link>

        {/* Excerpt */}
        <p className="text-gray-600 mb-4 line-clamp-3">
          {blog.excerpt || blog.content.substring(0, 150) + '...'}
        </p>

        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {blog.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
              >
                #{tag}
              </span>
            ))}
            {blog.tags.length > 3 && (
              <span className="text-gray-500 text-xs">
                +{blog.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Author and Stats */}
        <div className="flex items-center justify-between">
          {showAuthor && (
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {blog.author.avatar ? (
                  <img
                    src={blog.author.avatar}
                    alt={blog.author.username}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-700">
                      {blog.author.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {blog.author.fullName || blog.author.username}
                </p>
                <p className="text-xs text-gray-500">
                  {formatDate(blog.publishedAt || blog.createdAt)}
                </p>
              </div>
            </div>
          )}

          {showStats && (
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {blog.views}
              </div>
              
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {blog.likesCount}
              </div>
              
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                {blog.commentsCount}
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

export default BlogCard;
