"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function VerificarPage() {
  const params = useParams();
  const token = params.token as string;
  const [estado, setEstado] = useState<"cargando" | "ok" | "error">("cargando");

  useEffect(() => {
    fetch(`${API_URL}/auth/verify/${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) { setEstado("error"); return; }
        setEstado("ok");
      })
      .catch(() => setEstado("error"));
  }, [token]);

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center gap-4">
      <Link href="/" className="font-serif text-xl tracking-tight text-ink mb-4">
        pact<span className="text-green">.ar</span>
      </Link>

      {estado === "cargando" && (
        <p className="text-sm text-hint">Verificando tu cuenta...</p>
      )}

      {estado === "ok" && (
        <>
          <div className="flex items-center gap-2">
            <span className="block w-6 h-px bg-green" />
            <span className="text-xs font-medium uppercase tracking-widest text-green">Verificado</span>
          </div>
          <p className="font-serif text-3xl text-ink">Email verificado correctamente</p>
          <p className="text-sm text-muted">Ya podés crear contratos.</p>
          <Link
            href="/dashboard"
            className="text-xs font-medium uppercase tracking-widest px-6 py-3 bg-ink text-cream hover:bg-green transition-colors mt-4"
            style={{ display: "inline-block" }}
          >
            Ir al dashboard
          </Link>
        </>
      )}

      {estado === "error" && (
        <>
          <p className="font-serif text-2xl text-ink">Link inválido o expirado</p>
          <p className="text-sm text-muted text-center max-w-sm">
            El link ya fue usado o expiró. Podés solicitar uno nuevo desde la página de verificación.
          </p>
          <Link
            href="/verificar-pendiente"
            className="text-xs font-medium uppercase tracking-widest px-6 py-3 bg-ink text-cream hover:bg-green transition-colors mt-2"
            style={{ display: "inline-block" }}
          >
            Reenviar link
          </Link>
          <Link href="/login" className="text-sm text-green underline underline-offset-4">
            Ya tengo cuenta verificada
          </Link>
        </>
      )}
    </div>
  );
}
