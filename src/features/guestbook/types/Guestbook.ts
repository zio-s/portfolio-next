/**
 * Guestbook Types
 *
 * 방문록 관련 타입 정의
 */

export interface Guestbook {
  id: string;

  // Author information
  authorName: string;
  authorEmail?: string;
  authorAvatarUrl?: string;

  // Message content
  content: string;

  // Admin reply
  adminReply?: string;
  adminRepliedAt?: string;
  adminUserId?: string;

  // Status
  isApproved: boolean;
  isPinned: boolean;

  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface GuestbookFormData {
  authorName: string;
  authorEmail?: string;
  content: string;
}

export interface GuestbookAdminReplyData {
  id: string;
  adminReply: string;
}

export interface GuestbookUpdateData {
  id: string;
  isApproved?: boolean;
  isPinned?: boolean;
  adminReply?: string;
}

export interface GuestbookListResponse {
  items: Guestbook[];
  total: number;
  limit: number;
  nextCursor?: string; // Next page cursor (created_at of last item)
  hasMore: boolean; // Whether there are more items
}

export interface GetGuestbookParams {
  limit?: number;
  cursor?: string; // Cursor for pagination (created_at timestamp)
  offset?: number; // Offset for traditional pagination (admin use)
  approvedOnly?: boolean;
}

// Database types (snake_case for Supabase)
export interface GuestbookDB {
  id: string;
  author_name: string;
  author_email: string | null;
  author_avatar?: string | null;
  author_avatar_url?: string | null;
  content: string;
  admin_reply?: string | null;
  admin_replied_at?: string | null;
  admin_user_id?: string | null;
  is_approved: boolean | null;
  is_pinned: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  visitor_count?: number | null;
}

// Transformation helpers
export const transformGuestbookFromDB = (db: GuestbookDB): Guestbook => ({
  id: db.id,
  authorName: db.author_name,
  authorEmail: db.author_email || undefined,
  authorAvatarUrl: db.author_avatar_url || undefined,
  content: db.content,
  adminReply: db.admin_reply || undefined,
  adminRepliedAt: db.admin_replied_at || undefined,
  adminUserId: db.admin_user_id || undefined,
  isApproved: db.is_approved ?? false,
  isPinned: db.is_pinned ?? false,
  createdAt: db.created_at || new Date().toISOString(),
  updatedAt: db.updated_at || new Date().toISOString(),
});

export const transformGuestbookToDB = (guestbook: Partial<Guestbook>): Partial<GuestbookDB> => ({
  ...(guestbook.id !== undefined && { id: guestbook.id }),
  ...(guestbook.authorName !== undefined && { author_name: guestbook.authorName }),
  ...(guestbook.authorEmail !== undefined && { author_email: guestbook.authorEmail }),
  ...(guestbook.authorAvatarUrl !== undefined && { author_avatar_url: guestbook.authorAvatarUrl }),
  ...(guestbook.content !== undefined && { content: guestbook.content }),
  ...(guestbook.adminReply !== undefined && { admin_reply: guestbook.adminReply }),
  ...(guestbook.adminRepliedAt !== undefined && { admin_replied_at: guestbook.adminRepliedAt }),
  ...(guestbook.adminUserId !== undefined && { admin_user_id: guestbook.adminUserId }),
  ...(guestbook.isApproved !== undefined && { is_approved: guestbook.isApproved }),
  ...(guestbook.isPinned !== undefined && { is_pinned: guestbook.isPinned }),
  ...(guestbook.createdAt !== undefined && { created_at: guestbook.createdAt }),
  ...(guestbook.updatedAt !== undefined && { updated_at: guestbook.updatedAt }),
});
