"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function EditorPersonalizadoPage() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [cuerpo, setCuerpo] = useState("");
  const [parteA, setParteA] = useState("");
  const [parteB, setParteB] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }
    if (!nombre.trim()) { setError("Poné un nombre al contrato"); return; }
    if (!cuerpo.trim()) { setError("El contrato no puede estar vacío"); return; }

    const cuerpoFinal = parteA || parteB
      ? `${cuerpo}\n\n_______________________________\t\t_______________________________\n${parteA}\t\t\t\t${parteB}\nParte A\t\t\t\t\t\tParte B`
      : cuerpo;

    setSaving(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/contracts/custom`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ nombre, cuerpo: cuerpoFinal }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(`/contratos/${data.contract.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="px-12 py-5 border-b border-border flex justify-between items-center bg-cream">
        <Link href="/" className="font-serif text-xl tracking-tight text-ink">
          pact<span className="text-green">.ar</span>
        </Link>
        <Link href="/templates" className="text-sm text-muted hover:text-ink transition-colors">
          ← Volver a templates
        </Link>
      </div>

      <div className="max-w-4xl mx-auto px-12 py-16">
        <div className="flex items-center gap-2 mb-4">
          <span className="block w-6 h-px bg-green" />
          <span className="text-xs font-medium uppercase tracking-widest text-green">Personalizado</span>
        </div>
        <h1 className="font-serif text-3xl text-ink mb-2">Contrato personalizado</h1>
        <p className="text-sm text-muted font-light mb-10">
          Escribí o pegá el contenido de tu contrato. Podés usar cualquier formato.
        </p>

        {/* Nombre del contrato */}
        <div className="mb-6">
          <label className="block text-xs uppercase tracking-widest text-hint mb-2">
            Nombre del contrato
          </label>
          <input
            type="text"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            className="w-full bg-surface border border-border px-4 py-3 text-sm text-ink focus:outline-none focus:border-ink transition-colors"
            placeholder="Ej: Acuerdo con Estudio Bauer"
          />
        </div>

        {/* Editor de texto */}
        <div className="mb-8">
          <label className="block text-xs uppercase tracking-widest text-hint mb-2">
            Contenido del contrato
          </label>
          <textarea
            value={cuerpo}
            onChange={e => setCuerpo(e.target.value)}
            rows={20}
            className="w-full bg-surface border border-border px-6 py-5 text-sm text-ink font-mono leading-relaxed focus:outline-none focus:border-ink transition-colors resize-none"
            placeholder="Escribí o pegá el texto de tu contrato acá..."
          />
        </div>

        {/* Firmantes */}
        <div className="border-t border-border pt-8 mb-8">
          <p className="text-xs uppercase tracking-widest text-hint mb-6">Firmantes</p>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <label className="block text-xs uppercase tracking-widest text-hint mb-2">
                Nombre — Parte A
              </label>
              <input
                type="text"
                value={parteA}
                onChange={e => setParteA(e.target.value)}
                className="w-full bg-surface border border-border px-4 py-3 text-sm text-ink focus:outline-none focus:border-ink transition-colors"
                placeholder="Ej: María González"
              />
              <div className="border-b border-ink mt-6" />
              <p className="text-xs text-hint mt-1">Firma</p>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-hint mb-2">
                Nombre — Parte B
              </label>
              <input
                type="text"
                value={parteB}
                onChange={e => setParteB(e.target.value)}
                className="w-full bg-surface border border-border px-4 py-3 text-sm text-ink focus:outline-none focus:border-ink transition-colors"
                placeholder="Ej: Juan Pérez"
              />
              <div className="border-b border-ink mt-6" />
              <p className="text-xs text-hint mt-1">Firma</p>
            </div>
          </div>
        </div>

        {error && <p className="text-xs text-red-600 mb-4">{error}</p>}

        <button
          onClick={handleSave}
          disabled={saving}
          className="text-xs font-medium uppercase tracking-widest px-8 py-3 bg-ink text-cream hover:bg-green transition-colors disabled:opacity-50"
        >
          {saving ? "Guardando..." : "Guardar contrato"}
        </button>
      </div>
    </div>
  );
}
