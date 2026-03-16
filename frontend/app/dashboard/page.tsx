"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiGet } from "@/lib/api";
import UpgradeBanner from "@/components/UpgradeBanner";

interface Contract {
  id: number;
  template_id: string;
  nombre: string;
  estado: "borrador" | "pendiente_firma" | "firmado";
  created_at: string;
}

interface User {
  email: string;
  plan: string;
  email_verified: boolean;
}

function EstadoBadge({ estado }: { estado: string }) {
  const styles: Record<string, string> = {
    borrador: "bg-cream text-hint",
    pendiente_firma: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
    firmado: "bg-green-light text-green",
  };
  const labels: Record<string, string> = {
    borrador: "Borrador",
    pendiente_firma: "Pendiente",
    firmado: "Firmado",
  };
  return (
    <span className={`text-[10px] font-medium uppercase tracking-widest px-2 py-1 ${styles[estado] ?? ""}`}>
      {labels[estado] ?? estado}
    </span>
  );
}

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [reenvioEstado, setReenvioEstado] = useState<"idle" | "cargando" | "enviado" | "error">("idle");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }
    Promise.all([apiGet("/auth/me", token), apiGet("/contracts", token)])
      .then(([u, c]) => { setUser(u.user); setContracts(c.contracts); })
      .catch(() => { localStorage.removeItem("token"); router.push("/login"); })
      .finally(() => setLoading(false));
  }, [router]);

  async function reenviarVerificacion() {
    if (!user?.email) return;
    setReenvioEstado("cargando");
    try {
      const res = await fetch(`${API_URL}/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });
      const data = await res.json();
      if (!res.ok) { setReenvioEstado("error"); return; }
      console.log(data);
      setReenvioEstado("enviado");
    } catch {
      setReenvioEstado("error");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-sm text-hint">Cargando...</p>
      </div>
    );
  }

  const total = contracts.length;
  const firmados = contracts.filter(c => c.estado === "firmado").length;
  const pendientes = contracts.filter(c => c.estado === "pendiente_firma").length;

  return (
    <div className="min-h-screen bg-cream">

      {/* Nav */}
      <nav className="px-12 py-5 border-b border-border flex justify-between items-center bg-cream">
        <Link href="/" className="font-serif text-xl tracking-tight text-ink">
          pact<span className="text-green">.ar</span>
        </Link>
        <div className="flex items-center gap-8">
          <span className="text-xs uppercase tracking-widest text-hint">
            {user?.plan === "free" ? "Plan Free" : user?.plan}
          </span>
          <span className="text-sm text-muted">{user?.email}</span>
          <button
            onClick={() => { localStorage.removeItem("token"); router.push("/login"); }}
            className="text-xs uppercase tracking-widest text-hint hover:text-ink transition-colors"
          >
            Salir
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-12 py-16">

        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <span className="block w-6 h-px bg-green" />
          <span className="text-xs font-medium uppercase tracking-widest text-green">Dashboard</span>
        </div>
        <div className="flex justify-between items-center mb-12">
          <h1 className="font-serif text-4xl text-ink">Tus contratos</h1>
          <Link href="/templates" className="inline-block bg-ink text-cream px-6 py-3 text-[11px] font-medium tracking-[0.1em] uppercase hover:bg-green transition-colors">
            + Nuevo contrato
          </Link>
        </div>

        {/* Upgrade banner — solo para free */}
        {user?.plan === "free" && <UpgradeBanner />}

        {!user?.email_verified && (
          <div className="bg-amber-100 border border-amber-300 dark:bg-amber-950 dark:border-amber-800 px-6 py-4 mb-8 flex items-center justify-between gap-4">
            <p className="text-sm text-amber-800 dark:text-amber-300">
              {reenvioEstado === "enviado"
                ? "Email enviado. Revisá tu bandeja de entrada (y el spam)."
                : "Tu email no está verificado. Verificalo para poder crear contratos."}
            </p>
            {reenvioEstado !== "enviado" && (
              <button
                onClick={reenviarVerificacion}
                disabled={reenvioEstado === "cargando"}
                className="text-xs font-medium uppercase tracking-widest px-4 py-2 bg-amber-700 dark:bg-amber-800 text-white hover:bg-amber-900 transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                {reenvioEstado === "cargando" ? "Enviando..." : reenvioEstado === "error" ? "Reintentar" : "Reenviar email"}
              </button>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          {[
            { label: "Total", value: total },
            { label: "Firmados", value: firmados },
            { label: "Pendientes", value: pendientes },
          ].map(s => (
            <div key={s.label} className="bg-surface border border-border p-6">
              <p className="text-xs uppercase tracking-widest text-hint mb-3">{s.label}</p>
              <p className="font-serif text-4xl text-ink">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {contracts.length === 0 && (
            <div className="bg-surface border border-border text-center" style={{ padding: "64px 64px 48px 64px" }}>
            <p className="font-serif text-2xl text-ink mb-3">Todavía no tenés contratos</p>
            <p className="text-sm text-muted font-light mb-8">
              Elegí un template y creá tu primer contrato en minutos.
            </p>
            <div className="flex justify-center">
              <Link
                href="/templates"
                className="text-xs font-medium uppercase tracking-widest px-6 py-3 bg-ink text-cream hover:bg-green transition-colors"
                style={{ display: "inline-block" }}
              >
                Crear primer contrato
              </Link>
            </div>
          </div>
        )}

        {/* Table */}
        {contracts.length > 0 && (
          <div className="bg-surface border border-border overflow-hidden">
            <table className="w-full table-fixed">
              <colgroup>
                <col className="w-[40%]" />
                <col className="w-[25%]" />
                <col className="w-[15%]" />
                <col className="w-[20%]" />
              </colgroup>
              <thead>
                <tr className="border-b border-border">
                  <th className="text-center text-xs uppercase tracking-widest text-hint px-6 py-3 font-normal">Contrato</th>
                  <th className="text-center text-xs uppercase tracking-widest text-hint px-6 py-3 font-normal">Tipo</th>
                  <th className="text-center text-xs uppercase tracking-widest text-hint px-6 py-3 font-normal">Estado</th>
                  <th className="text-center text-xs uppercase tracking-widest text-hint px-6 py-3 font-normal">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {contracts.map((c, i) => (
                  <tr
                    key={c.id}
                    onClick={() => router.push(`/contratos/${c.id}`)}
                    style={{ cursor: "pointer" }}
                    className={`cursor-pointer hover:bg-cream transition-colors ${i < contracts.length - 1 ? "border-b border-border" : ""}`}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-ink text-center truncate hover:text-green hover:underline underline-offset-4 transition-colors cursor-pointer">
                      {c.nombre} <span className="text-hint font-normal ml-1">→</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-muted font-light capitalize">{c.template_id.replace(/-/g, " ")}</td>
                    <td className="px-6 py-4 text-center"><EstadoBadge estado={c.estado} /></td>
                    <td className="px-6 py-4 text-xs text-center text-hint">{formatFecha(c.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}
