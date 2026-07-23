"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import RequireAuth from "../components/RequireAuth";
import { supabase } from "../utils/client";
import { defaultAvatar } from "../utils/assets";
import { fetchStoriesBundle, type StoryRow } from "../utils/social";

export default function StoriesPage() {
  const [stories, setStories] = useState<StoryRow[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return;
      }

      const rows = await fetchStoriesBundle(supabase);
      if (active) {
        setStories(rows);
        setLoading(false);
      }
    };

    load().catch((error) => {
      console.error("Error al cargar stories:", error);
      if (active) {
        setLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] ?? null;
    setFile(nextFile);
    setPreview(nextFile ? URL.createObjectURL(nextFile) : null);
  };

  const uploadStory = async () => {
    if (!file) {
      return;
    }

    setUploading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setUploading(false);
      return;
    }

    const fileExt = file.name.split(".").pop() || "jpg";
    const fileName = `stories/${user.id}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("images")
      .upload(fileName, file, { cacheControl: "3600", upsert: false });

    if (uploadError) {
      console.error(uploadError);
      setUploading(false);
      return;
    }

    const { data: publicUrl } = supabase.storage.from("images").getPublicUrl(fileName);

    const mediaType = file.type.startsWith("video/") ? "video" : "image";

    const { error } = await supabase.from("stories").insert({
      user_id: user.id,
      media_url: publicUrl.publicUrl,
      media_type: mediaType,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });

    if (error) {
      console.error(error);
    } else {
      const rows = await fetchStoriesBundle(supabase);
      setStories(rows);
      setFile(null);
      setPreview(null);
    }

    setUploading(false);
  };

  return (
    <RequireAuth>
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-40 border-b border-border bg-card-bg/95 backdrop-blur">
          <div className="mx-auto flex max-w-2xl items-center justify-center px-4 py-3">
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Stories
            </h1>
          </div>
        </header>

        <main className="mx-auto max-w-2xl px-4 py-6 pb-28">
          <section className="mb-6 rounded-xl border border-border bg-card-bg p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-border px-4 py-3">
                <div className="relative h-12 w-12 overflow-hidden rounded-full">
                  <Image src={defaultAvatar} alt="story" fill className="object-cover" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">Agregar story</div>
                  <div className="text-xs text-foreground/60">Imagen o video, dura 24h</div>
                </div>
                <input type="file" accept="image/*,video/*" onChange={handleChange} className="hidden" />
              </label>

              <button
                onClick={uploadStory}
                disabled={!file || uploading}
                className="rounded-lg bg-gradient-to-r from-primary to-accent px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {uploading ? "Subiendo..." : "Publicar story"}
              </button>
            </div>

            {preview ? (
              <div className="relative mt-4 aspect-[9/16] overflow-hidden rounded-xl border border-border">
                <Image src={preview} alt="preview" fill className="object-cover" />
              </div>
            ) : null}
          </section>

          {loading ? (
            <p className="text-sm text-foreground/60">Cargando stories...</p>
          ) : stories.length ? (
            <div className="grid grid-cols-3 gap-2">
              {stories.map((story) => {
                const profile = Array.isArray(story.profiles) ? story.profiles[0] : story.profiles;
                return (
                  <div key={story.id} className="overflow-hidden rounded-xl border border-border bg-card-bg">
                    <div className="relative aspect-[9/16]">
                      <Image src={story.media_url} alt={profile?.username || "story"} fill className="object-cover" />
                    </div>
                    <div className="p-3">
                      <div className="text-sm font-semibold text-foreground">{profile?.username || "default_user"}</div>
                      <div className="text-xs text-foreground/50">{new Date(story.created_at).toLocaleString()}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-card-bg p-8 text-center text-sm text-foreground/60">
              Todavia no hay stories activas.
            </div>
          )}
        </main>
      </div>
    </RequireAuth>
  );
}
