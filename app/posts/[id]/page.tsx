"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import RequireAuth from "../../components/RequireAuth";
import { supabase } from "../../utils/client";
import { defaultAvatar, defaultPostImage } from "../../utils/assets";
import {
  fetchCommentsForPost,
  fetchPostById,
  fetchSavedPostIds,
  fetchLikedPostIds,
  toComment,
  toPost,
  type CommentRow,
  type PostRow,
} from "../../utils/social";
import { getTimeAgo } from "../../utils/time";
import type { Post } from "../../mocks/posts";

function HeartIcon({ filled }: { filled: boolean }) {
  return filled ? (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-red-500">
      <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  );
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  return filled ? (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
      <path d="M6 3.75A2.25 2.25 0 008.25 1.5h7.5A2.25 2.25 0 0118 3.75V21a.75.75 0 01-1.203.597L12 17.98l-4.797 3.617A.75.75 0 016 21V3.75z" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 3.75A2.25 2.25 0 018.25 1.5h7.5A2.25 2.25 0 0118 3.75V21a.75.75 0 01-1.203.597L12 17.98l-4.797 3.617A.75.75 0 016 21V3.75z" />
    </svg>
  );
}

export default function PostDetailPage() {
  const params = useParams<{ id: string }>();
  const postId = params.id;
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Array<ReturnType<typeof toComment>>>([]);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return;
      }

      const [row, commentRows, likedIds, savedIds] = await Promise.all([
        fetchPostById(supabase, postId),
        fetchCommentsForPost(supabase, postId),
        fetchLikedPostIds(supabase, user.id),
        fetchSavedPostIds(supabase, user.id),
      ]);

      if (!active || !row) {
        setLoading(false);
        return;
      }

      setPost(
        {
          ...toPost(row as PostRow, {
            likePostIds: likedIds,
            savedPostIds: savedIds,
          }),
          likes: (await supabase.from("post_likes").select("post_id").eq("post_id", postId)).data?.length ?? 0,
        }
      );
      setComments(commentRows.map((row) => toComment(row)));
      setLoading(false);
    };

    load().catch((error) => {
      console.error("Error al cargar el post:", error);
      if (active) {
        setLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, [postId]);

  const toggleLike = async () => {
    if (!post) {
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return;
    }

    const nextIsLiked = !post.isLiked;
    setPost({
      ...post,
      isLiked: nextIsLiked,
      likes: Math.max(0, post.likes + (post.isLiked ? -1 : 1)),
    });

    const { error } = nextIsLiked
      ? await supabase.from("post_likes").insert({ post_id: post.id, user_id: user.id })
      : await supabase.from("post_likes").delete().eq("post_id", post.id).eq("user_id", user.id);

    if (error) {
      console.error(error);
      setPost((current) => (current ? { ...current, isLiked: !nextIsLiked, likes: current.likes } : current));
      return;
    }

    if (nextIsLiked && post.user_id !== user.id) {
      await supabase.from("notifications").insert({
        recipient_id: post.user_id,
        actor_id: user.id,
        type: "like",
        post_id: post.id,
      });
    }
  };

  const toggleSave = async () => {
    if (!post) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    setPost({ ...post, isSaved: !post.isSaved });

    const { error } = post.isSaved
      ? await supabase.from("saved_posts").delete().eq("post_id", post.id).eq("user_id", user.id)
      : await supabase.from("saved_posts").insert({ post_id: post.id, user_id: user.id });

    if (error) {
      console.error(error);
      setPost((current) => (current ? { ...current, isSaved: !current.isSaved } : current));
    }
  };

  const addComment = async () => {
    const content = comment.trim();
    if (!post || !content) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase.from("comments").insert({
      post_id: post.id,
      user_id: user.id,
      content,
    });

    if (error) {
      console.error(error);
      return;
    }

    if (post.user_id !== user.id) {
      await supabase.from("notifications").insert({
        recipient_id: post.user_id,
        actor_id: user.id,
        type: "comment",
        post_id: post.id,
      });
    }

    const nextComments = await fetchCommentsForPost(supabase, post.id);
    setComments(nextComments.map((row) => toComment(row)));
    setComment("");
  };

  if (loading) {
    return (
      <RequireAuth>
        <div className="flex min-h-[60vh] items-center justify-center text-sm text-foreground/60">
          Cargando post...
        </div>
      </RequireAuth>
    );
  }

  if (!post) {
    return (
      <RequireAuth>
        <div className="rounded-xl border border-dashed border-border bg-card-bg p-8 text-center text-sm text-foreground/60">
          No encontramos este post.
        </div>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
      <div className="min-h-screen bg-background">
        <main className="mx-auto grid max-w-5xl gap-6 px-4 py-6 pb-28 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="overflow-hidden rounded-xl border border-border bg-card-bg shadow-sm">
            <div className="flex items-center gap-3 border-b border-border p-4">
              <div className="relative h-10 w-10 overflow-hidden rounded-full">
                <Image src={post.user?.avatar || defaultAvatar} alt={post.user?.username || "profile"} fill className="object-cover" />
              </div>
              <div>
                <Link href={`/profile/${post.user_id}`} className="font-semibold text-foreground">
                  {post.user?.username || "default_user"}
                </Link>
                <div className="text-xs text-foreground/50">{getTimeAgo(new Date(post.created_at))}</div>
              </div>
            </div>

            <div className="relative aspect-square w-full">
              <Image src={post.image_url || defaultPostImage} alt={post.caption} fill className="object-cover" />
            </div>

            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button onClick={toggleLike} aria-label="like">
                    <HeartIcon filled={post.isLiked || false} />
                  </button>
                  <button onClick={toggleSave} aria-label="save">
                    <BookmarkIcon filled={post.isSaved || false} />
                  </button>
                </div>
                <div className="text-sm text-foreground/60">{post.likes.toLocaleString()} likes</div>
              </div>

              <p className="mt-3 text-sm text-foreground">
                <span className="font-semibold">{post.user?.username || "default_user"}</span>{" "}
                <span className="text-foreground/80">{post.caption}</span>
              </p>
            </div>
          </section>

          <aside className="overflow-hidden rounded-xl border border-border bg-card-bg shadow-sm">
            <div className="border-b border-border p-4">
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-foreground/60">Comments</h2>
            </div>

            <div className="max-h-[52vh] overflow-y-auto p-4">
              {comments.length ? (
                <div className="flex flex-col gap-4">
                  {comments.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative h-10 w-10 overflow-hidden rounded-full">
                        <Image src={item.user?.avatar || defaultAvatar} alt={item.user?.username || "user"} fill className="object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-foreground">{item.user?.username || "default_user"}</span>
                          <span className="text-xs text-foreground/40">{getTimeAgo(new Date(item.created_at))}</span>
                        </div>
                        <p className="text-sm text-foreground/80">{item.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-foreground/60">Aun no hay comentarios.</p>
              )}
            </div>

            <div className="border-t border-border p-4">
              <textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                rows={3}
                placeholder="Escribe un comentario..."
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
              />
              <button
                onClick={addComment}
                className="mt-3 rounded-lg bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-semibold text-white"
              >
                Publicar comentario
              </button>
            </div>
          </aside>
        </main>
      </div>
    </RequireAuth>
  );
}
