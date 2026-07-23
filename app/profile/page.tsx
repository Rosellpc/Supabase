"use client";

import { useEffect, useState } from "react";
import { supabase } from "../utils/client";
import RequireAuth from "../components/RequireAuth";
import ProfileScreen from "../components/ProfileScreen";

export default function MyProfilePage() {
  const [profileId, setProfileId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const { data } = await supabase.auth.getUser();
      if (active) {
        setProfileId(data.user?.id ?? null);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  return (
    <RequireAuth>
      {profileId ? (
        <div className="min-h-screen bg-background px-4 py-6 pb-28">
          <div className="mx-auto max-w-2xl">
            <ProfileScreen profileId={profileId} />
          </div>
        </div>
      ) : null}
    </RequireAuth>
  );
}
