"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import RequireAuth from "../components/RequireAuth";
import { supabase } from "../utils/client";
import { defaultPostImage } from "../utils/assets";
import { fetchPostsByIds, fetchSavedPostIds } from "../utils/social";
import type { Post } from "../mocks/posts";

export default function SavedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
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

      const savedIds = await fetchSavedPostIds(supabase, user.id);
      const savedPosts = await fetchPostsByIds(supabase, Array.from(savedIds), user.id);

      if (active) {
        setPosts(savedPosts);
        setLoading(false);
      }
    };

    load().catch((error) => {
      console.error("Error al cargar guardados:", error);
      if (active) {
        setLoading(false);
      }
    });

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
              Saved
            </h1>
          </div>
        </header>

        <main className="mx-auto max-w-2xl px-4 py-6 pb-28">
          {loading ? (
            <p className="text-sm text-foreground/60">Cargando guardados...</p>
          ) : posts.length ? (
            <div className="grid grid-cols-3 gap-1">
              {posts.map((post) => (
                <Link key={post.id} href={`/posts/${post.id}`} className="relative aspect-square overflow-hidden">
                  <Image src={post.image_url || defaultPostImage} alt={post.caption} fill className="object-cover" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-card-bg p-8 text-center text-sm text-foreground/60">
              Aun no guardaste nada.
            </div>
          )}
        </main>
      </div>
    </RequireAuth>
  );
}
