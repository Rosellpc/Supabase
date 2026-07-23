export interface Post {
  id: string;
  user_id: string;
  user?: {
    id?: string;
    username: string;
    avatar: string;
    full_name?: string | null;
    bio?: string | null;
    website?: string | null;
  };
  image_url: string;
  caption: string;
  location?: string | null;
  likes: number;
  commentsCount?: number;
  isLiked?: boolean;
  isSaved?: boolean;
  created_at: string | Date;
  updated_at?: string | Date;
}
