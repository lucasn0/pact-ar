"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiPost } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await apiPost("/auth/login", { email, password });
      localStorage.setItem("token", data.token);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Header */}
      <div className="px-12 py-5 border-b border-border">
        <Link href="/" className="font-serif text-xl tracking-tight text-ink">
          pact<span className="text-green">.ar</span>
        </Link>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 mb-6">
            <span className="w-6 h-px bg-green" />
            <span className="text-xs font-medium uppercase tracking-widest text-green">
              Bienvenido
            </span>
          </div>

          <h1 className="font-serif text-3xl text-ink mb-8">Ingresá a tu cuenta</h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs uppercase tracking-widest text-hint mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-surface border border-border px-4 py-3 text-sm text-ink placeholder:text-hint focus:outline-none focus:border-ink transition-colors"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-hint mb-2">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-surface border border-border px-4 py-3 text-sm text-ink placeholder:text-hint focus:outline-none focus:border-ink transition-colors"
                placeholder="········"
              />
            </div>

            {error && (
              <p className="text-xs text-red-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-ink text-cream text-xs font-medium uppercase tracking-widest py-3 hover:bg-green transition-colors disabled:opacity-50"
            >
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>

          <p className="text-sm text-muted mt-6 text-center">
            ¿No tenés cuenta?{" "}
            <Link href="/registro" className="text-ink underline underline-offset-4 hover:text-green transition-colors">
              Registrate gratis
            </Link>
          </p>
          <p className="text-sm text-muted mt-3 text-center">
            <Link href="/olvide-contrasena" className="text-hint hover:text-ink underline underline-offset-4 transition-colors">
              Olvidé mi contraseña
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
