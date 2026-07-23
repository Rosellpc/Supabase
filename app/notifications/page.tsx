"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import RequireAuth from "../components/RequireAuth";
import { supabase } from "../utils/client";
import { defaultAvatar } from "../utils/assets";
import { fetchNotifications, type NotificationRow } from "../utils/social";

function notificationLabel(notification: NotificationRow) {
  switch (notification.type) {
    case "like":
      return "le dio like a tu post";
    case "comment":
      return "comentó tu post";
    case "follow":
      return "empezó a seguirte";
    default:
      return "interactuó contigo";
  }
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewerId, setViewerId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return;
      }

      setViewerId(user.id);
      const rows = await fetchNotifications(supabase, user.id);

      if (active) {
        setNotifications(rows);
        setLoading(false);
      }
    };

    load().catch((error) => {
      console.error("Error al cargar notificaciones:", error);
      if (active) {
        setLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  const markAsRead = async (id: string) => {
    const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    if (error) {
      console.error(error);
      return;
    }

    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id ? { ...notification, is_read: true } : notification
      )
    );
  };

  return (
    <RequireAuth>
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-40 border-b border-border bg-card-bg/95 backdrop-blur">
          <div className="mx-auto flex max-w-2xl items-center justify-center px-4 py-3">
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Activity
            </h1>
          </div>
        </header>

        <main className="mx-auto max-w-2xl px-4 py-6 pb-28">
          {loading ? (
            <p className="text-sm text-foreground/60">Cargando actividad...</p>
          ) : notifications.length ? (
            <div className="flex flex-col gap-3">
              {notifications.map((notification) => {
                const actor = Array.isArray(notification.actor)
                  ? notification.actor[0]
                  : notification.actor;
                return (
                  <button
                    key={notification.id}
                    onClick={() => markAsRead(notification.id)}
                    className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
                      notification.is_read
                        ? "border-border bg-card-bg"
                        : "border-primary/30 bg-primary/5"
                    }`}
                  >
                    <div className="relative h-12 w-12 overflow-hidden rounded-full">
                      <Image
                        src={actor?.avatar_url || defaultAvatar}
                        alt={actor?.username || "actor"}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-foreground">
                        <span className="font-semibold">
                          {actor?.username || "default_user"}
                        </span>{" "}
                        {notificationLabel(notification)}
                      </p>
                      <p className="text-xs text-foreground/50">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                    {notification.post_id ? (
                      <Link
                        href={`/posts/${notification.post_id}`}
                        className="rounded-lg bg-background px-3 py-2 text-xs font-semibold text-primary"
                        onClick={(event) => event.stopPropagation()}
                      >
                        Ver
                      </Link>
                    ) : null}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-card-bg p-8 text-center text-sm text-foreground/60">
              Todavia no hay actividad para mostrar.
            </div>
          )}
        </main>
      </div>
    </RequireAuth>
  );
}
