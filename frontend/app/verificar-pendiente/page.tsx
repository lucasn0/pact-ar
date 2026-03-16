"use client";

import { useState } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function VerificarPendientePage() {
  const [estado, setEstado] = useState<"idle" | "cargando" | "enviado" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [email, setEmail] = useState("");

  async function reenviar(e: React.FormEvent) {
    e.preventDefault();
    setEstado("cargando");
    setErrorMsg("");

    try {
      const res = await fetch(`${API_URL}/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Error desconocido");
        setEstado("error");
        return;
      }

      setEstado("enviado");
    } catch {
      setErrorMsg("No se pudo conectar con el servidor");
      setEstado("error");
    }
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center gap-4">
      <Link href="/" className="font-serif text-xl tracking-tight text-ink mb-4">
        pact<span className="text-green">.ar</span>
      </Link>

      <div className="flex items-center gap-2">
        <span className="block w-6 h-px bg-green" />
        <span className="text-xs font-medium uppercase tracking-widest text-green">Casi listo</span>
      </div>

      <p className="font-serif text-3xl text-ink">Revisá tu email</p>
      <p className="text-sm text-muted text-center max-w-sm">
        Te enviamos un link de verificación. Hacé click en el link para activar tu cuenta y empezar a crear contratos.
      </p>

      {estado !== "enviado" ? (
        <form onSubmit={reenviar} className="flex flex-col items-center gap-3 mt-4 w-full max-w-sm">
          <p className="text-xs text-hint text-center">¿No llegó el email? Ingresá tu dirección y reenviamos el link.</p>
          <input
            type="email"
            required
            placeholder="tu@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full border border-border bg-surface px-4 py-2 text-sm text-ink placeholder:text-hint focus:outline-none focus:border-ink"
          />
          {estado === "error" && (
            <p className="text-xs text-red-600">{errorMsg}</p>
          )}
          <button
            type="submit"
            disabled={estado === "cargando"}
            className="w-full text-xs font-medium uppercase tracking-widest px-6 py-3 bg-ink text-cream hover:bg-green transition-colors disabled:opacity-50"
          >
            {estado === "cargando" ? "Enviando..." : "Reenviar link de verificación"}
          </button>
        </form>
      ) : (
        <p className="text-sm text-green mt-4">
          ¡Listo! Revisá tu bandeja de entrada (y el spam).
        </p>
      )}

      <Link href="/login" className="text-sm text-green underline underline-offset-4 mt-2">
        Ya verifiqué, ir al login
      </Link>
    </div>
  );
}
