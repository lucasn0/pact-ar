"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { apiGet, apiPost, apiDelete } from "@/lib/api";

interface Contract {
  id: number;
  nombre: string;
  template_id: string;
  estado: string;
  cuerpo: string;
  created_at: string;
}

export default function ContratoDetallePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);

  // Invite form
  const [showInvite, setShowInvite] = useState(false);
  const [firmante_nombre, setFirmanteNombre] = useState("");
  const [firmante_email, setFirmanteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [inviteError, setInviteError] = useState("");

  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }

    apiGet(`/contracts/${id}`, token)
      .then((data) => setContract(data.contract))
      .catch(() => router.push("/dashboard"))
      .finally(() => setLoading(false));
  }, [id, router]);

  async function handleEliminar() {
    if (!confirm("¿Seguro que querés eliminar este contrato? Esta acción no se puede deshacer.")) return;
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }
    setActionLoading(true);
    try {
      await apiDelete(`/contracts/${id}`, token);
      router.push("/dashboard");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error al eliminar");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRevocar() {
    if (!confirm("¿Seguro que querés revocar la invitación? El firmante no podrá usar el link que recibió.")) return;
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }
    setActionLoading(true);
    try {
      await apiPost(`/contracts/${id}/revocar`, {});
      const data = await apiGet(`/contracts/${id}`, token);
      setContract(data.contract);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error al revocar");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleInvite(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }

    setInviting(true);
    setInviteError("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/signatures/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          contract_id: Number(id),
          firmante_nombre,
          firmante_email,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setInviteSuccess(true);
      setShowInvite(false);
      const updated = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/contracts/${id}`, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      const updatedData = await updated.json();
      setContract(updatedData.contract);
    } catch (err: unknown) {
      setInviteError(err instanceof Error ? err.message : "Error al enviar la invitación");
    } finally {
      setInviting(false);
    }
  }

  if (loading || !contract) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-sm text-hint">Cargando contrato...</p>
      </div>
    );
  }

  const estadoLabel: Record<string, string> = {
    borrador: "Borrador",
    pendiente_firma: "Pendiente de firma",
    firmado: "Firmado",
  };

  const estadoStyle: Record<string, string> = {
    borrador: "bg-cream text-hint",
    pendiente_firma: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
    firmado: "bg-green-light text-green",
  };

  return (
    <div className="min-h-screen bg-cream">

      {/* Nav */}
      <nav className="px-4 sm:px-12 py-5 border-b border-border flex justify-between items-center bg-cream">
        <Link href="/" className="font-serif text-xl tracking-tight text-ink">
          pact<span className="text-green">.ar</span>
        </Link>
        <Link href="/dashboard" className="text-sm text-muted hover:text-ink transition-colors">
          ← Dashboard
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-12 py-8 sm:py-16">

        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <span className="block w-6 h-px bg-green" />
          <span className="text-xs font-medium uppercase tracking-widest text-green">
            {contract.template_id.replace(/-/g, " ")}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-2">
          <h1 className="font-serif text-2xl sm:text-3xl text-ink">{contract.nombre}</h1>
          <span className={`text-[10px] font-medium uppercase tracking-widest px-2 py-1 self-start ${estadoStyle[contract.estado] ?? ""}`}>
            {estadoLabel[contract.estado] ?? contract.estado}
          </span>
        </div>

        <p className="text-xs text-hint mb-8 sm:mb-10">
          Creado el {new Date(contract.created_at).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })}
        </p>

        {/* Invite success */}
        {inviteSuccess && (
          <div className="bg-green-light border border-green px-5 py-4 mb-8">
            <p className="text-sm text-green">Invitación enviada correctamente. El firmante recibirá un email con el link para firmar.</p>
          </div>
        )}

        {/* Acciones según estado */}
        {contract.estado === "borrador" && !showInvite && (
          <div className="flex flex-wrap gap-3 mb-8 sm:mb-10">
            <button
              onClick={() => setShowInvite(true)}
              className="text-xs font-medium uppercase tracking-widest px-6 py-3 bg-ink text-cream hover:bg-green transition-colors"
            >
              Invitar a firmar
            </button>
            <button
              onClick={handleEliminar}
              disabled={actionLoading}
              className="text-xs font-medium uppercase tracking-widest px-6 py-3 border border-border text-muted hover:border-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
            >
              Eliminar contrato
            </button>
          </div>
        )}

        {contract.estado === "pendiente_firma" && (
          <div className="mb-8 sm:mb-10">
            <button
              onClick={handleRevocar}
              disabled={actionLoading}
              className="text-xs font-medium uppercase tracking-widest px-6 py-3 border border-border text-muted hover:border-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
            >
              {actionLoading ? "Revocando..." : "Revocar invitación"}
            </button>
          </div>
        )}

        {showInvite && (
          <form onSubmit={handleInvite} className="border border-border bg-surface p-4 sm:p-6 mb-8 sm:mb-10">
            <p className="text-xs uppercase tracking-widest text-hint mb-5">Datos del firmante</p>
            <div className="space-y-4 mb-5">
              <div>
                <label className="block text-xs uppercase tracking-widest text-hint mb-2">Nombre completo</label>
                <input
                  type="text"
                  value={firmante_nombre}
                  onChange={e => setFirmanteNombre(e.target.value)}
                  required
                  className="w-full bg-cream border border-border px-4 py-3 text-sm text-ink focus:outline-none focus:border-ink transition-colors"
                  placeholder="Juan Pérez"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-hint mb-2">Email</label>
                <input
                  type="email"
                  value={firmante_email}
                  onChange={e => setFirmanteEmail(e.target.value)}
                  required
                  className="w-full bg-cream border border-border px-4 py-3 text-sm text-ink focus:outline-none focus:border-ink transition-colors"
                  placeholder="juan@email.com"
                />
              </div>
            </div>
            {inviteError && <p className="text-xs text-red-600 mb-4">{inviteError}</p>}
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={inviting}
                className="text-xs font-medium uppercase tracking-widest px-6 py-3 bg-ink text-cream hover:bg-green transition-colors disabled:opacity-50"
              >
                {inviting ? "Enviando..." : "Enviar invitación"}
              </button>
              <button
                type="button"
                onClick={() => setShowInvite(false)}
                className="text-xs uppercase tracking-widest px-6 py-3 border border-border text-muted hover:text-ink transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* Contrato */}
        <div className="bg-surface border border-border p-4 sm:p-10 overflow-x-auto">
          {contract.cuerpo.split('\n').map((line, i) => {
            const isSigLine = line.includes('\t');
            if (isSigLine) {
              const cols = line.split('\t').filter(s => s.trim() !== '');
              return (
                <div key={i} className="grid grid-cols-2 gap-4 mt-1">
                  {cols.map((col, j) => (
                    <span key={j} className="font-mono text-xs sm:text-sm text-ink">{col}</span>
                  ))}
                </div>
              );
            }
            return (
              <p key={i} className={`font-mono text-xs sm:text-sm text-ink ${line === '' ? 'mt-4' : 'mt-0'} leading-relaxed`}>
                {line || '\u00A0'}
              </p>
            );
          })}
        </div>

      </div>
    </div>
  );
}
