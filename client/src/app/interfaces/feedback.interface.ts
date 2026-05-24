export type FeedbackStatus = 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface CommentDto {
  authorId: number;
  authorName: string;
  message: string;
  createdAt: string;
}

export interface PublicCommentDto {
  authorName: string;
  message: string;
  createdAt: string;
}

export interface AppFeedbackDto {
  authorName: string;
  author: any;
  id: number;
  title: string;
  description: string;
  status: FeedbackStatus;
  upvoteCount: number;
  upvotedByCurrentUser: boolean;
  ownFeedback: boolean;
  age: string;
  createdDate: string;
  createdBy: string;
  creatorId: number;
  comments: CommentDto[];
}

export interface PublicFeedbackDto {
  id: number;
  title: string;
  description: string;
  status: FeedbackStatus;
  upvoteCount: number;
  age: string;
  createdDate: string;
  createdBy: string;
  comments: PublicCommentDto[];
}

export interface AppFeedbackRequest {
  title: string;
  description: string;
}
