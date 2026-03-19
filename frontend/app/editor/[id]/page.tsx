"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { apiGet, apiPost } from "@/lib/api";

interface Variable {
  id: string;
  label: string;
  tipo: "texto" | "textarea" | "fecha";
}

interface Template {
  id: string;
  nombre: string;
  descripcion: string;
  variables: Variable[];
  cuerpo: string;
}

export default function EditorPage() {
  const router = useRouter();
  const params = useParams();
  const templateId = params.id as string;

  const [template, setTemplate] = useState<Template | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [nombre, setNombre] = useState("");
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [mobileTab, setMobileTab] = useState<"form" | "preview">("form");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }

    apiGet(`/templates/${templateId}`, token)
      .then((data) => {
        setTemplate(data.template);
        setNombre(data.template.nombre);
        const initial: Record<string, string> = {};
        data.template.variables.forEach((v: Variable) => { initial[v.id] = ""; });
        setValues(initial);
        setPreview(data.template.cuerpo);
      })
      .catch(() => router.push("/templates"))
      .finally(() => setLoading(false));
  }, [router, templateId]);

  function handleChange(id: string, value: string) {
    const updated = { ...values, [id]: value };
    setValues(updated);

    if (template) {
      const rendered = template.cuerpo.replace(
        /\{\{(\w+)\}\}/g,
        (_match, key) => updated[key] || `{{${key}}}`
      );
      setPreview(rendered);
    }
  }

  async function handleSave() {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }

    setSaving(true);
    setError("");

    try {
      const data = await apiPost("/contracts", { template_id: templateId, nombre, variables: values }, token);
      router.push(`/contratos/${data.contract.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !template) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-sm text-hint">Cargando editor...</p>
      </div>
    );
  }

  const PreviewContent = () => (
    <>
      <p className="text-xs uppercase tracking-widest text-hint mb-6">Vista previa</p>
      {preview.split('\n').map((line, i) => {
        const isSigLine = line.includes('\t');
        if (isSigLine) {
          const cols = line.split('\t').filter(s => s.trim() !== '');
          return (
            <div key={i} className="grid grid-cols-2 gap-4 mt-1">
              {cols.map((col, j) => (
                <span key={j} className="font-mono text-sm text-ink">{col}</span>
              ))}
            </div>
          );
        }
        return (
          <p key={i} className={`font-mono text-sm text-ink ${line === '' ? 'mt-4' : 'mt-0'} leading-relaxed`}>
            {line || '\u00A0'}
          </p>
        );
      })}
    </>
  );

  const FormContent = () => (
    <>
      <div className="flex items-center gap-2 mb-4">
        <span className="w-6 h-px bg-green" />
        <span className="text-xs font-medium uppercase tracking-widest text-green">Editor</span>
      </div>
      <h1 className="font-serif text-2xl text-ink mb-1">{template.nombre}</h1>
      <p className="text-sm text-muted font-light mb-8">{template.descripcion}</p>

      <div className="mb-6">
        <label className="block text-xs uppercase tracking-widest text-hint mb-2">
          Nombre del contrato
        </label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="w-full bg-surface border border-border px-4 py-3 text-sm text-ink focus:outline-none focus:border-ink transition-colors"
          placeholder="Ej: Contrato con cliente ABC"
        />
      </div>

      <hr className="border-border mb-6" />

      <div className="space-y-5">
        {template.variables.map((v) => (
          <div key={v.id}>
            <label className="block text-xs uppercase tracking-widest text-hint mb-2">
              {v.label}
            </label>
            {v.tipo === "textarea" ? (
              <textarea
                value={values[v.id] || ""}
                onChange={(e) => handleChange(v.id, e.target.value)}
                rows={3}
                className="w-full bg-surface border border-border px-4 py-3 text-sm text-ink focus:outline-none focus:border-ink transition-colors resize-none"
              />
            ) : (
              <input
                type={v.tipo === "fecha" ? "date" : "text"}
                value={values[v.id] || ""}
                onChange={(e) => handleChange(v.id, e.target.value)}
                className="w-full bg-surface border border-border px-4 py-3 text-sm text-ink focus:outline-none focus:border-ink transition-colors"
              />
            )}
          </div>
        ))}
      </div>

      {error && <p className="text-xs text-red-600 mt-4">{error}</p>}

      <button
        onClick={handleSave}
        disabled={saving || !nombre}
        className="w-full mt-8 bg-ink text-cream text-xs font-medium uppercase tracking-widest py-3 hover:bg-green transition-colors disabled:opacity-50"
      >
        {saving ? "Guardando..." : "Guardar contrato"}
      </button>
    </>
  );

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Header */}
      <div className="px-4 sm:px-12 py-5 border-b border-border flex justify-between items-center flex-shrink-0">
        <Link href="/" className="font-serif text-xl tracking-tight text-ink">
          pact<span className="text-green">.ar</span>
        </Link>
        <Link href="/templates" className="text-sm text-muted hover:text-ink transition-colors">
          ← Volver
        </Link>
      </div>

      {/* Mobile tabs */}
      <div className="sm:hidden flex border-b border-border flex-shrink-0">
        <button
          onClick={() => setMobileTab("form")}
          className={`flex-1 py-3 text-xs uppercase tracking-widest transition-colors ${mobileTab === "form" ? "text-ink border-b-2 border-ink font-medium" : "text-hint"}`}
        >
          Formulario
        </button>
        <button
          onClick={() => setMobileTab("preview")}
          className={`flex-1 py-3 text-xs uppercase tracking-widest transition-colors ${mobileTab === "preview" ? "text-ink border-b-2 border-ink font-medium" : "text-hint"}`}
        >
          Vista previa
        </button>
      </div>

      {/* Mobile content */}
      <div className="sm:hidden flex-1 overflow-y-auto px-4 py-8 bg-cream">
        {mobileTab === "form" ? FormContent() : <div className="bg-surface p-4">{PreviewContent()}</div>}
      </div>

      {/* Desktop split view */}
      <div className="hidden sm:grid grid-cols-2 flex-1" style={{ height: "calc(100vh - 65px)" }}>
        <div className="border-r border-border overflow-y-auto px-10 py-10">
          {FormContent()}
        </div>
        <div className="overflow-y-auto px-10 py-10 bg-surface">
          {PreviewContent()}
        </div>
      </div>
    </div>
  );
}
