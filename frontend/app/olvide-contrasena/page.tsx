"use client";

import { useState } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function OlvideContrasenaPage() {
  const [email, setEmail] = useState("");
  const [estado, setEstado] = useState<"idle" | "cargando" | "enviado" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEstado("cargando");
    setErrorMsg("");

    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) { setErrorMsg(data.error); setEstado("error"); return; }
      setEstado("enviado");
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
            <span className="text-xs font-medium uppercase tracking-widest text-green">Recuperar acceso</span>
          </div>

          <h1 className="font-serif text-3xl text-ink mb-3">Olvidé mi contraseña</h1>

          {estado !== "enviado" ? (
            <>
              <p className="text-sm text-muted mb-8">
                Ingresá tu email y te mandamos un link para crear una nueva contraseña.
              </p>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-hint mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full bg-surface border border-border px-4 py-3 text-sm text-ink placeholder:text-hint focus:outline-none focus:border-ink transition-colors"
                    placeholder="tu@email.com"
                  />
                </div>
                {estado === "error" && <p className="text-xs text-red-600">{errorMsg}</p>}
                <button
                  type="submit"
                  disabled={estado === "cargando"}
                  className="w-full bg-ink text-cream text-xs font-medium uppercase tracking-widest py-3 hover:bg-green transition-colors disabled:opacity-50"
                >
                  {estado === "cargando" ? "Enviando..." : "Enviar link"}
                </button>
              </form>
            </>
          ) : (
            <p className="text-sm text-muted">
              Si el email está registrado, recibirás un link en tu casilla. Revisá también el spam.
            </p>
          )}

          <p className="text-sm text-muted mt-6 text-center">
            <Link href="/login" className="text-ink underline underline-offset-4 hover:text-green transition-colors">
              Volver al login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
