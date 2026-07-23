"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import RequireAuth from "../components/RequireAuth";
import { supabase } from "../utils/client";
import { defaultPostImage } from "../utils/assets";
import { fetchPostsBundle } from "../utils/social";
import type { Post } from "../mocks/posts";

export default function RankPage() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return;
      }

      const allPosts = await fetchPostsBundle(supabase, { viewerId: user.id });
      const ranked = [...allPosts].sort((a, b) => b.likes - a.likes);

      if (active) {
        setPosts(ranked);
      }
    };

    load().catch((error) => console.error("Error al cargar ranking:", error));

    return () => {
      active = false;
    };
  }, []);

  return (
    <RequireAuth>
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-40 border-b border-border bg-card-bg/95 backdrop-blur">
          <div className="mx-auto flex max-w-2xl items-center justify-center px-4 py-3">
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Explore
            </h1>
          </div>
        </header>

        <main className="mx-auto max-w-2xl px-2 py-2 pb-28">
          <div className="grid grid-cols-3 gap-1">
            {posts.map((post) => (
              <Link key={post.id} href={`/posts/${post.id}`} className="relative aspect-square overflow-hidden">
                <Image
                  src={post.image_url || defaultPostImage}
                  alt={post.caption}
                  fill
                  className="object-cover transition-transform hover:scale-105"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/35 opacity-0 transition-opacity hover:opacity-100">
                  <span className="rounded-full bg-black/50 px-3 py-1 text-sm font-semibold text-white">
                    {post.likes.toLocaleString()} likes
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </RequireAuth>
  );
}
