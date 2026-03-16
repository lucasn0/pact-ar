"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function NuevaContrasenaPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [estado, setEstado] = useState<"idle" | "cargando" | "ok" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setErrorMsg("Las contraseñas no coinciden"); return; }
    setEstado("cargando");
    setErrorMsg("");

    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) { setErrorMsg(data.error); setEstado("error"); return; }
      setEstado("ok");
      setTimeout(() => router.push("/login"), 2500);
    } catch {
      setErrorMsg("No se pudo conectar con el servidor");
      setEstado("error");
    }
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <div className="px-12 py-5 border-b border-border">
        <Link href="/" className="font-serif text-xl tracking-tight text-ink">
          pact<span className="text-green">.ar</span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 mb-6">
            <span className="w-6 h-px bg-green" />
            <span className="text-xs font-medium uppercase tracking-widest text-green">Nueva contraseña</span>
          </div>

          <h1 className="font-serif text-3xl text-ink mb-8">Creá tu nueva contraseña</h1>

          {estado === "ok" ? (
            <>
              <div className="bg-green-light border border-green px-5 py-4 mb-6">
                <p className="text-sm text-green">¡Contraseña actualizada! Redirigiendo al login...</p>
              </div>
            </>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs uppercase tracking-widest text-hint mb-2">Nueva contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full bg-surface border border-border px-4 py-3 text-sm text-ink placeholder:text-hint focus:outline-none focus:border-ink transition-colors"
                  placeholder="Mínimo 8 caracteres"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-hint mb-2">Repetir contraseña</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  required
                  className="w-full bg-surface border border-border px-4 py-3 text-sm text-ink placeholder:text-hint focus:outline-none focus:border-ink transition-colors"
                  placeholder="········"
                />
              </div>
              {errorMsg && <p className="text-xs text-red-600">{errorMsg}</p>}
              <button
                type="submit"
                disabled={estado === "cargando"}
                className="w-full bg-ink text-cream text-xs font-medium uppercase tracking-widest py-3 hover:bg-green transition-colors disabled:opacity-50"
              >
                {estado === "cargando" ? "Guardando..." : "Guardar contraseña"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
