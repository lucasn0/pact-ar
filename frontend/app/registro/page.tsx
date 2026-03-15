"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiPost } from "@/lib/api";

export default function RegistroPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    setLoading(true);

    try {
      await apiPost("/auth/register", { email, password });
      router.push("/verificar-pendiente");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al registrarse");
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
              Es gratis
            </span>
          </div>

          <h1 className="font-serif text-3xl text-ink mb-8">Creá tu cuenta</h1>

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
                className="w-full bg-white border border-border px-4 py-3 text-sm text-ink placeholder:text-hint focus:outline-none focus:border-ink transition-colors"
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
                className="w-full bg-white border border-border px-4 py-3 text-sm text-ink placeholder:text-hint focus:outline-none focus:border-ink transition-colors"
                placeholder="Mínimo 8 caracteres"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-hint mb-2">
                Repetir contraseña
              </label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                className="w-full bg-white border border-border px-4 py-3 text-sm text-ink placeholder:text-hint focus:outline-none focus:border-ink transition-colors"
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
              {loading ? "Creando cuenta..." : "Crear cuenta gratis"}
            </button>
          </form>

          <p className="text-sm text-muted mt-6 text-center">
            ¿Ya tenés cuenta?{" "}
            <Link href="/login" className="text-ink underline underline-offset-4 hover:text-green transition-colors">
              Ingresá
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
