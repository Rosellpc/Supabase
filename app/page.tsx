"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { getTimeAgo } from "./utils/time";
import { type Post } from "./mocks/posts";

import { supabase } from "./utils/client";

const fallbackImageUrl =
  "https://xynshcnkxdliapebmyaz.supabase.co/storage/v1/object/public/images/posts/unnamed-14.jpg";

function getSafeImageUrl(imageUrl: string) {
  try {
    const url = new URL(imageUrl);

    if (url.hostname === "example.com") {
      return fallbackImageUrl;
    }

    return imageUrl;
  } catch {
    return fallbackImageUrl;
  }
}

function HeartIcon({ filled }: { filled: boolean }) {
  if (filled) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-7 h-7 text-red-500"
      >
        <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
      </svg>
    );
  }
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-7 h-7"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
      />
    </svg>
  );
}

function PostCard({
  post,
  onLike,
}: {
  post: Post;
  onLike: (id: number | string) => void;
}) {
  return (
    <article className="bg-card-bg border border-border rounded-xl overflow-hidden shadow-sm">
      {/* Header con usuario y avatar */}
      <div className="flex items-center gap-3 p-4">
        <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-primary">
          <Image
            src={
              post.user?.avatar ||
              fallbackImageUrl
            }
            alt={post.user?.username || "default_user"}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-foreground">
            {post.user?.username || "default_user"}
          </span>
          <span className="text-xs text-foreground/50">
            {getTimeAgo(new Date(post.created_at))}
          </span>
        </div>
      </div>

      {/* Imagen del post */}
      <div className="relative w-full aspect-square">
        <Image
          src={getSafeImageUrl(post.image_url)}
          alt={`Post de ${post.user?.username || "default_user"}`}
          fill
          className="object-cover"
        />
      </div>

      {/* Acciones y caption */}
      <div className="p-4">
        {/* Botón de like con contador */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onLike(post.id)}
            className="hover:scale-110 transition-transform active:scale-95"
            aria-label={post.isLiked ? "Quitar like" : "Dar like"}
          >
            <HeartIcon filled={post.isLiked || false} />
          </button>
          <span className="font-semibold text-foreground">
            {post.likes.toLocaleString()} likes
          </span>
        </div>

        {/* Caption */}
        <p className="mt-2 text-foreground">
          <span className="font-semibold">
            {post.user?.username || "default_user"}
          </span>{" "}
          <span className="text-foreground/80">{post.caption}</span>
        </p>
      </div>
    </article>
  );
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);

  const handleLike = async (postId: number | string) => {
    const currentPost = posts.find((post) => post.id === postId);

    if (!currentPost) {
      return;
    }

    const nextIsLiked = !currentPost.isLiked;
    const nextLikes = Math.max(
      0,
      nextIsLiked ? currentPost.likes + 1 : currentPost.likes - 1
    );

    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: nextIsLiked,
              likes: nextLikes,
            }
          : post
      )
    );

    const { error } = await supabase
      .from("posts_new")
      .update({ likes: nextLikes })
      .eq("id", postId);

    if (error) {
      console.error("Error al actualizar likes:", error);
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                isLiked: currentPost.isLiked,
                likes: currentPost.likes,
              }
            : post
        )
      );
    }
  };

  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from("posts_new")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error al obtener los posts:", error);
      } else {
        setPosts(data ?? []);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card-bg border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Suplatzigram
          </h1>
        </div>
      </header>

      {/* Feed de posts */}
      <main className="max-w-lg mx-auto px-4 py-6">
        <div className="flex flex-col gap-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onLike={handleLike} />
          ))}
        </div>
      </main>
    </div>
  );
}
