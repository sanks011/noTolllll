export interface ForumAuthor {
  name: string;
  company: string;
  role: string;
  sector?: string;
  avatar?: string;
}

export interface ForumComment {
  id: string;
  content: string;
  likes: number;
  isMentorReply: boolean;
  isAcceptedAnswer: boolean;
  createdAt: string;
  timeAgo: string;
  isLiked: boolean;
  isOwner: boolean;
  author: ForumAuthor;
  replies?: ForumComment[];
}

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  likes: number;
  commentsCount: number;
  isAnswered: boolean;
  isPinned: boolean;
  isFeatured: boolean;
  createdAt: string;
  timeAgo: string;
  isLiked: boolean;
  isOwner?: boolean;
  author: ForumAuthor;
  comments?: ForumComment[];
}

export interface ForumCreatePost {
  title: string;
  content: string;
  category: string;
  tags?: string[];
}

export interface ForumCreateComment {
  content: string;
  parentCommentId?: string;
}

export interface ForumStats {
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
  activeMembers: number;
  categoryDistribution: Record<string, number>;
}

export interface ForumCategory {
  name: string;
  count: number;
}

export interface ForumPagination {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export type ForumSortBy = 'createdAt' | 'likes' | 'commentsCount' | 'title';
export type ForumSortOrder = 'asc' | 'desc';
export type ForumCategoryType = 'Market Updates' | 'Success Stories' | 'Q&A' | 'General Discussion' | 'All';
