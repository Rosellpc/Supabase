import { type Post } from "../mocks/posts";

type ProfileRelation =
  | {
      username: string | null;
      avatar_url: string | null;
    }
  | {
      username: string | null;
      avatar_url: string | null;
    }[]
  | null;

type LikesRelation = { count: number | null }[] | { count: number | null } | null;

export type PostRow = {
  id: string;
  user_id: string;
  image_url: string;
  caption: string | null;
  created_at: string;
  updated_at?: string | null;
  profiles?: ProfileRelation;
  post_likes?: LikesRelation;
};

function getProfile(profile: ProfileRelation) {
  if (Array.isArray(profile)) {
    return profile[0] ?? null;
  }

  return profile;
}

function getLikesCount(likes: LikesRelation) {
  if (Array.isArray(likes)) {
    return likes[0]?.count ?? 0;
  }

  return likes?.count ?? 0;
}

export function mapPostRow(row: PostRow, likedPostIds = new Set<string>()): Post {
  const profile = getProfile(row.profiles ?? null);

  return {
    id: row.id,
    user_id: row.user_id,
    image_url: row.image_url,
    caption: row.caption ?? "",
    likes: getLikesCount(row.post_likes ?? null),
    isLiked: likedPostIds.has(row.id),
    created_at: row.created_at,
    updated_at: row.updated_at ?? undefined,
    user: {
      username: profile?.username || "default_user",
      avatar: profile?.avatar_url || "/window.svg",
    },
  };
}
