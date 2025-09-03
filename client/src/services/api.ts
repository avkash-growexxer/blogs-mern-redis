import axios, { AxiosResponse } from 'axios';

// API base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalBlogs: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatar?: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
  fullName?: string;
  blogCount?: number;
}

export interface Blog {
  _id: string;
  title: string;
  content: string;
  excerpt?: string;
  author: User;
  tags: string[];
  category: string;
  featuredImage?: string;
  status: 'draft' | 'published' | 'archived';
  views: number;
  likes: Array<{
    user: string;
    createdAt: string;
  }>;
  comments: Comment[];
  publishedAt?: string;
  readTime: number;
  createdAt: string;
  updatedAt: string;
  slug?: string;
  likesCount: number;
  commentsCount: number;
  trendingScore?: number;
  seoTitle?: string;
  seoDescription?: string;
}

export interface Comment {
  _id: string;
  author: User;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlogsResponse {
  blogs: Blog[];
  pagination: PaginationInfo;
}

// Auth API
export const authAPI = {
  register: (userData: {
    username: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }): Promise<AxiosResponse<ApiResponse<{ user: User; token: string }>>> =>
    api.post('/auth/register', userData),

  login: (credentials: {
    identifier: string;
    password: string;
  }): Promise<AxiosResponse<ApiResponse<{ user: User; token: string }>>> =>
    api.post('/auth/login', credentials),

  getProfile: (): Promise<AxiosResponse<ApiResponse<{ user: User }>>> =>
    api.get('/auth/profile'),

  updateProfile: (userData: {
    firstName?: string;
    lastName?: string;
    bio?: string;
    avatar?: string;
  }): Promise<AxiosResponse<ApiResponse<{ user: User }>>> =>
    api.put('/auth/profile', userData),

  changePassword: (passwordData: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<AxiosResponse<ApiResponse>> =>
    api.put('/auth/password', passwordData),

  logout: (): Promise<AxiosResponse<ApiResponse>> =>
    api.post('/auth/logout'),

  refreshToken: (): Promise<AxiosResponse<ApiResponse<{ token: string }>>> =>
    api.post('/auth/refresh'),
};

// Blog API
export const blogAPI = {
  getBlogs: (params?: {
    page?: number;
    limit?: number;
    category?: string;
    tags?: string;
    author?: string;
    search?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<AxiosResponse<ApiResponse<BlogsResponse>>> =>
    api.get('/blogs', { params }),

  getTrendingBlogs: (params?: {
    limit?: number;
    timeframe?: number;
  }): Promise<AxiosResponse<ApiResponse<{ blogs: Blog[] }>>> =>
    api.get('/blogs/trending', { params }),

  getBlogById: (id: string): Promise<AxiosResponse<ApiResponse<{ blog: Blog }>>> =>
    api.get(`/blogs/${id}`),

  createBlog: (blogData: {
    title: string;
    content: string;
    excerpt?: string;
    category?: string;
    tags?: string[];
    featuredImage?: string;
    status?: 'draft' | 'published' | 'archived';
    seoTitle?: string;
    seoDescription?: string;
  }): Promise<AxiosResponse<ApiResponse<{ blog: Blog }>>> =>
    api.post('/blogs', blogData),

  updateBlog: (id: string, blogData: {
    title?: string;
    content?: string;
    excerpt?: string;
    category?: string;
    tags?: string[];
    featuredImage?: string;
    status?: 'draft' | 'published' | 'archived';
    seoTitle?: string;
    seoDescription?: string;
  }): Promise<AxiosResponse<ApiResponse<{ blog: Blog }>>> =>
    api.put(`/blogs/${id}`, blogData),

  deleteBlog: (id: string): Promise<AxiosResponse<ApiResponse>> =>
    api.delete(`/blogs/${id}`),

  toggleLike: (id: string): Promise<AxiosResponse<ApiResponse<{
    likesCount: number;
    isLiked: boolean;
  }>>> =>
    api.post(`/blogs/${id}/like`),

  addComment: (id: string, content: string): Promise<AxiosResponse<ApiResponse<{
    comment: Comment;
  }>>> =>
    api.post(`/blogs/${id}/comments`, { content }),

  getUserBlogs: (userId: string, params?: {
    page?: number;
    limit?: number;
  }): Promise<AxiosResponse<ApiResponse<BlogsResponse>>> =>
    api.get(`/blogs/user/${userId}`, { params }),
};

// Health check
export const healthCheck = (): Promise<AxiosResponse<ApiResponse>> =>
  api.get('/health');

export default api;
