"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthShell from "../auth/components/AuthShell";
import { supabase } from "../utils/client";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    });

    setIsLoading(false);

    if (error) {
      setMessage({ type: "error", text: error.message });
      return;
    }

    setMessage({
      type: "success",
      text: "Cuenta creada. Revisa tu correo si Supabase pide confirmacion.",
    });
    router.push("/login");
  };

  return (
    <AuthShell
      title="Crea tu cuenta"
      subtitle="Empieza tu perfil y publica tus mejores momentos."
      footerText="Ya tienes cuenta?"
      footerHref="/login"
      footerLabel="Inicia sesion"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-2 text-sm font-medium text-foreground">
          Usuario
          <input
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
            minLength={3}
            autoComplete="username"
            placeholder="sofia_photo"
            className="rounded-lg border border-border bg-background px-4 py-3 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-foreground">
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="email"
            placeholder="tu@email.com"
            className="rounded-lg border border-border bg-background px-4 py-3 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-foreground">
          Contrasena
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
            placeholder="Minimo 6 caracteres"
            className="rounded-lg border border-border bg-background px-4 py-3 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </label>

        {message && (
          <div
            className={`rounded-lg border px-4 py-3 text-sm ${
              message.type === "success"
                ? "border-green-500/20 bg-green-500/10 text-green-600"
                : "border-red-500/20 bg-red-500/10 text-red-600"
            }`}
          >
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="mt-2 rounded-lg bg-gradient-to-r from-primary to-accent px-4 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </form>
    </AuthShell>
  );
}
