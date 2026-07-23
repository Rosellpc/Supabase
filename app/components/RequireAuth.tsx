"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../utils/client";

export default function RequireAuth({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    const ensureSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!active) {
        return;
      }

      if (!data.session) {
        router.replace("/login");
        return;
      }

      setReady(true);
    };

    ensureSession();

    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) {
        return;
      }

      if (!session && event !== "SIGNED_OUT") {
        router.replace("/login");
      }
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, [router]);

  if (!ready) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-foreground/60">
        Cargando tu sesion...
      </div>
    );
  }

  return <>{children}</>;
}
