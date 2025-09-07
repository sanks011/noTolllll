'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Search, 
  Plus, 
  Heart, 
  MessageCircle, 
  Filter,
  TrendingUp,
  Users,
  FileText,
  Award,
  Send,
  Edit,
  Trash2,
  CheckCircle
} from 'lucide-react';
import { forumApi } from '@/lib/forum-api';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ForumPost, 
  ForumComment, 
  ForumCreatePost, 
  ForumCreateComment, 
  ForumStats,
  ForumCategory,
  ForumCategoryType 
} from '@/types/forum';
import Link from 'next/link';

interface CommunityPageState {
  posts: ForumPost[];
  stats: ForumStats | null;
  categories: ForumCategory[];
  loading: boolean;
  error: string | null;
  selectedCategory: ForumCategoryType;
  searchQuery: string;
  currentPage: number;
  totalPages: number;
  showCreatePost: boolean;
  selectedPost: ForumPost | null;
}

export default function CommunityPage() {
  const { user, loading: authLoading } = useAuth();

  const [state, setState] = useState<CommunityPageState>({
    posts: [],
    stats: null,
    categories: [],
    loading: true,
    error: null,
    selectedCategory: 'All',
    searchQuery: '',
    currentPage: 1,
    totalPages: 1,
    showCreatePost: false,
    selectedPost: null
  });

  const [newPost, setNewPost] = useState<ForumCreatePost>({
    title: '',
    content: '',
    category: 'General Discussion',
    tags: []
  });

  const [newComment, setNewComment] = useState<ForumCreateComment>({
    content: ''
  });

  // Check authentication before loading data
  useEffect(() => {
    if (!authLoading && user) {
      loadForumData();
      loadStats();
      loadCategories();
    }
  }, [authLoading, user]);

  // Reload data when filters change
  useEffect(() => {
    if (!authLoading && user) {
      loadForumData();
    }
  }, [state.selectedCategory, state.searchQuery, state.currentPage]);

  const loadForumData = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await forumApi.getPosts({
        category: state.selectedCategory === 'All' ? undefined : state.selectedCategory,
        search: state.searchQuery || undefined,
        page: state.currentPage,
        limit: 10
      });

      setState(prev => ({
        ...prev,
        posts: response.data.posts,
        totalPages: response.data.pagination.totalPages,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to load forum posts',
        loading: false 
      }));
    }
  };

  const loadStats = async () => {
    try {
      const response = await forumApi.getStats();
      setState(prev => ({ ...prev, stats: response.data }));
    } catch (error) {
      console.error('Failed to load forum stats:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await forumApi.getCategories();
      setState(prev => ({ ...prev, categories: response.data }));
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      setState(prev => ({ ...prev, error: 'Title and content are required' }));
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true }));
      await forumApi.createPost(newPost);
      
      // Reset form and reload data
      setNewPost({ title: '', content: '', category: 'General Discussion', tags: [] });
      setState(prev => ({ ...prev, showCreatePost: false }));
      loadForumData();
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to create post',
        loading: false 
      }));
    }
  };

  const handleTogglePostLike = async (postId: string) => {
    try {
      await forumApi.togglePostLike(postId);
      
      // Update the post in local state
      setState(prev => ({
        ...prev,
        posts: prev.posts.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                isLiked: !post.isLiked,
                likes: post.isLiked ? post.likes - 1 : post.likes + 1
              }
            : post
        )
      }));
    } catch (error) {
      console.error('Failed to toggle post like:', error);
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!newComment.content.trim()) return;

    try {
      await forumApi.addComment(postId, newComment);
      setNewComment({ content: '' });
      
      // Reload the specific post to get updated comments
      if (state.selectedPost && state.selectedPost.id === postId) {
        const response = await forumApi.getPost(postId);
        setState(prev => ({ ...prev, selectedPost: response.data }));
      }
      
      // Update posts list
      loadForumData();
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleToggleCommentLike = async (commentId: string) => {
    try {
      await forumApi.toggleCommentLike(commentId);
      
      // Update the selected post's comments
      if (state.selectedPost) {
        const response = await forumApi.getPost(state.selectedPost.id);
        setState(prev => ({ ...prev, selectedPost: response.data }));
      }
    } catch (error) {
      console.error('Failed to toggle comment like:', error);
    }
  };

  const openPostDetails = async (postId: string) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      const response = await forumApi.getPost(postId);
      setState(prev => ({ 
        ...prev, 
        selectedPost: response.data,
        loading: false 
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to load post details',
        loading: false 
      }));
    }
  };

  const handleSearch = (query: string) => {
    setState(prev => ({ 
      ...prev, 
      searchQuery: query, 
      currentPage: 1 
    }));
  };

  const handleCategoryChange = (category: ForumCategoryType) => {
    setState(prev => ({ 
      ...prev, 
      selectedCategory: category, 
      currentPage: 1 
    }));
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show authentication required message
  if (!user) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="text-center py-12">
            <div className="mx-auto max-w-md">
              <div className="mb-6">
                <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight mb-2">Authentication Required</h2>
              <p className="text-muted-foreground mb-6">
                Please sign in to access the community forum and connect with fellow exporters.
              </p>
              <div className="space-y-2">
                <Link href="/auth/signin">
                  <Button className="w-full">Sign In</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button variant="outline" className="w-full">Create Account</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (state.loading && state.posts.length === 0) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Community Forum</h1>
            <p className="text-muted-foreground">
              Connect with fellow exporters, share insights, and get answers to your questions
            </p>
          </div>
          <Button 
            onClick={() => setState(prev => ({ ...prev, showCreatePost: true }))}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Post
          </Button>
        </div>

        {/* Error Alert */}
        {state.error && (
          <Alert variant="destructive">
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}

        {/* Community Stats */}
        {state.stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{state.stats.totalPosts}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{state.stats.totalLikes}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
                <MessageCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{state.stats.totalComments}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Members</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{state.stats.activeMembers}</div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Forum Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search discussions..."
                    value={state.searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select 
                value={state.selectedCategory} 
                onValueChange={(value) => handleCategoryChange(value as ForumCategoryType)}
              >
                <SelectTrigger className="w-full md:w-[200px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Categories</SelectItem>
                  <SelectItem value="Market Updates">Market Updates</SelectItem>
                  <SelectItem value="Success Stories">Success Stories</SelectItem>
                  <SelectItem value="Q&A">Q&A</SelectItem>
                  <SelectItem value="General Discussion">General Discussion</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Create Post Form */}
            {state.showCreatePost && (
              <Card>
                <CardHeader>
                  <CardTitle>Create New Post</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Post title..."
                    value={newPost.title}
                    onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                  />
                  <Select 
                    value={newPost.category} 
                    onValueChange={(value) => setNewPost(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Market Updates">Market Updates</SelectItem>
                      <SelectItem value="Success Stories">Success Stories</SelectItem>
                      <SelectItem value="Q&A">Q&A</SelectItem>
                      <SelectItem value="General Discussion">General Discussion</SelectItem>
                    </SelectContent>
                  </Select>
                  <Textarea
                    placeholder="Write your post content..."
                    value={newPost.content}
                    onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                    className="min-h-[120px]"
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleCreatePost} disabled={state.loading}>
                      {state.loading ? 'Creating...' : 'Create Post'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setState(prev => ({ ...prev, showCreatePost: false }))}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Forum Posts */}
            <div className="space-y-4">
              {state.posts.map((post) => (
                <Card key={post.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={post.author.avatar} />
                            <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="text-sm">
                            <span className="font-medium">{post.author.name}</span>
                            <span className="text-muted-foreground ml-1">
                              from {post.author.company}
                            </span>
                            <span className="text-muted-foreground ml-1">• {post.timeAgo}</span>
                          </div>
                          <Badge variant="secondary">{post.category}</Badge>
                          {post.isPinned && <Badge variant="default">Pinned</Badge>}
                          {post.isAnswered && <Badge variant="default" className="bg-green-100 text-green-800">Answered</Badge>}
                        </div>
                        
                        <h3 
                          className="text-xl font-semibold mb-2 cursor-pointer hover:text-blue-600"
                          onClick={() => openPostDetails(post.id)}
                        >
                          {post.title}
                        </h3>
                        
                        <p className="text-muted-foreground mb-4">{post.content}</p>
                        
                        {post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-4">
                            {post.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-6">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleTogglePostLike(post.id)}
                            className={post.isLiked ? 'text-red-600' : ''}
                          >
                            <Heart className={`mr-1 h-4 w-4 ${post.isLiked ? 'fill-current' : ''}`} />
                            {post.likes}
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openPostDetails(post.id)}
                          >
                            <MessageCircle className="mr-1 h-4 w-4" />
                            {post.commentsCount}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {state.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  disabled={state.currentPage <= 1}
                  onClick={() => setState(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {state.currentPage} of {state.totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={state.currentPage >= state.totalPages}
                  onClick={() => setState(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                >
                  Next
                </Button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {state.categories.map((category) => (
                  <div
                    key={category.name}
                    className="flex justify-between items-center p-2 rounded hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleCategoryChange(category.name as ForumCategoryType)}
                  >
                    <span className="text-sm font-medium">{category.name}</span>
                    <Badge variant="secondary">{category.count}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Stats Summary */}
            {state.stats && (
              <Card>
                <CardHeader>
                  <CardTitle>Community Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Posts</span>
                    <Badge variant="outline">{state.stats.totalPosts}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Likes</span>
                    <Badge variant="outline">{state.stats.totalLikes}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Active Members</span>
                    <Badge variant="outline">{state.stats.activeMembers}</Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Post Details Modal/Overlay */}
        {state.selectedPost && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">{state.selectedPost.title}</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setState(prev => ({ ...prev, selectedPost: null }))}
                  >
                    ×
                  </Button>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={state.selectedPost.author.avatar} />
                    <AvatarFallback>{state.selectedPost.author.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{state.selectedPost.author.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {state.selectedPost.author.company} • {state.selectedPost.timeAgo}
                    </div>
                  </div>
                  <Badge variant="secondary" className="ml-auto">
                    {state.selectedPost.category}
                  </Badge>
                </div>

                <div className="prose max-w-none mb-6">
                  <p>{state.selectedPost.content}</p>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTogglePostLike(state.selectedPost!.id)}
                    className={state.selectedPost.isLiked ? 'text-red-600' : ''}
                  >
                    <Heart className={`mr-1 h-4 w-4 ${state.selectedPost.isLiked ? 'fill-current' : ''}`} />
                    {state.selectedPost.likes}
                  </Button>
                </div>

                <Separator className="my-6" />

                {/* Comments Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    Comments ({state.selectedPost.commentsCount})
                  </h3>

                  {/* Add Comment Form */}
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Add a comment..."
                      value={newComment.content}
                      onChange={(e) => setNewComment({ content: e.target.value })}
                      className="flex-1"
                    />
                    <Button
                      onClick={() => handleAddComment(state.selectedPost!.id)}
                      disabled={!newComment.content.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Comments List */}
                  {state.selectedPost.comments && state.selectedPost.comments.map((comment) => (
                    <div key={comment.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={comment.author.avatar} />
                            <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-sm">{comment.author.name}</span>
                          <span className="text-xs text-muted-foreground">{comment.timeAgo}</span>
                          {comment.isAcceptedAnswer && (
                            <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Accepted Answer
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-sm mb-2">{comment.content}</p>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleCommentLike(comment.id)}
                        className={comment.isLiked ? 'text-red-600' : ''}
                      >
                        <Heart className={`mr-1 h-3 w-3 ${comment.isLiked ? 'fill-current' : ''}`} />
                        {comment.likes}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
