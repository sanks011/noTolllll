import { ForumPost, ForumComment, ForumCreatePost, ForumCreateComment, ForumStats, ForumCategory } from '@/types/forum';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Get authentication token from localStorage or your auth system
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token') || '';
  }
  return '';
};

// Common headers for API requests
const getHeaders = () => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Generic API request handler
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: getHeaders(),
    ...options
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Clear invalid token and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/auth/signin';
      }
      throw new Error('Authentication required. Please sign in again.');
    }
    
    let error;
    try {
      error = await response.json();
    } catch {
      error = { message: 'API request failed' };
    }
    throw new Error(error.message || 'API request failed');
  }

  return response.json();
};

export const forumApi = {
  // Get all forum posts with pagination and filters
  getPosts: async (params: {
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    featured?: boolean;
  } = {}): Promise<{
    success: boolean;
    data: {
      posts: ForumPost[];
      pagination: {
        currentPage: number;
        totalPages: number;
        totalRecords: number;
        hasNext: boolean;
        hasPrev: boolean;
      };
    };
  }> => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    return apiRequest(`/forum/posts?${searchParams}`);
  },

  // Get single forum post with comments
  getPost: async (id: string): Promise<{
    success: boolean;
    data: ForumPost;
  }> => {
    return apiRequest(`/forum/posts/${id}`);
  },

  // Create new forum post
  createPost: async (post: ForumCreatePost): Promise<{
    success: boolean;
    message: string;
    data: {
      id: string;
      title: string;
      category: string;
    };
  }> => {
    return apiRequest('/forum/posts', {
      method: 'POST',
      body: JSON.stringify(post)
    });
  },

  // Update forum post
  updatePost: async (id: string, post: ForumCreatePost): Promise<{
    success: boolean;
    message: string;
  }> => {
    return apiRequest(`/forum/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(post)
    });
  },

  // Delete forum post
  deletePost: async (id: string): Promise<{
    success: boolean;
    message: string;
  }> => {
    return apiRequest(`/forum/posts/${id}`, {
      method: 'DELETE'
    });
  },

  // Add comment to forum post
  addComment: async (postId: string, comment: ForumCreateComment): Promise<{
    success: boolean;
    message: string;
    data: {
      id: string;
      content: string;
      createdAt: string;
    };
  }> => {
    return apiRequest(`/forum/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify(comment)
    });
  },

  // Update comment
  updateComment: async (id: string, content: string): Promise<{
    success: boolean;
    message: string;
  }> => {
    return apiRequest(`/forum/comments/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ content })
    });
  },

  // Delete comment
  deleteComment: async (id: string): Promise<{
    success: boolean;
    message: string;
  }> => {
    return apiRequest(`/forum/comments/${id}`, {
      method: 'DELETE'
    });
  },

  // Like/unlike forum post
  togglePostLike: async (id: string): Promise<{
    success: boolean;
    message: string;
    data: {
      isLiked: boolean;
    };
  }> => {
    return apiRequest(`/forum/posts/${id}/like`, {
      method: 'POST'
    });
  },

  // Like/unlike comment
  toggleCommentLike: async (id: string): Promise<{
    success: boolean;
    message: string;
    data: {
      isLiked: boolean;
    };
  }> => {
    return apiRequest(`/forum/comments/${id}/like`, {
      method: 'POST'
    });
  },

  // Mark comment as accepted answer
  acceptAnswer: async (id: string): Promise<{
    success: boolean;
    message: string;
  }> => {
    return apiRequest(`/forum/comments/${id}/accept`, {
      method: 'POST'
    });
  },

  // Get forum statistics
  getStats: async (): Promise<{
    success: boolean;
    data: ForumStats;
  }> => {
    return apiRequest('/forum/stats');
  },

  // Get available categories with counts
  getCategories: async (): Promise<{
    success: boolean;
    data: ForumCategory[];
  }> => {
    return apiRequest('/forum/categories');
  },

  // Get current user's posts
  getMyPosts: async (params: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<{
    success: boolean;
    data: {
      posts: ForumPost[];
      pagination: {
        currentPage: number;
        totalPages: number;
        totalRecords: number;
      };
    };
  }> => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    return apiRequest(`/forum/my-posts?${searchParams}`);
  }
};

export default forumApi;
