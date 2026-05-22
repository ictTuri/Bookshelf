export interface DtoReplySnippet {
  id: number;
  senderId: number;
  senderName: string;
  contentSnippet: string;
}

export interface DtoMessageRequest {
  content: string;
  replyToId?: number | null;
}

export interface DtoMessageUpdateRequest {
  content?: string;
  reactions?: Record<string, string>;
  edited?: boolean;
}

export interface DtoMessageResponse {
  id: number;
  conversationId: number;
  senderId: number;
  senderName: string;
  content: string;
  read: boolean;
  createdAt: Date;
  replyTo?: DtoReplySnippet | null;
  mediaType?: string | null;
  mediaName?: string | null;
  mediaSize?: number | null;
  hasMedia?: boolean;
  mediaData?: string | null;
  edited?: boolean;
  reactions?: Record<string, string>;
}

export interface DtoConversationResponse {
  conversationId: number;
  friendId: number;
  friendName: string;
  friendEmail: string;
  friendProfilePic: string | null;
  lastMessagePreview: string | null;
  lastMessageAt: Date;
  unreadCount: number;
}
