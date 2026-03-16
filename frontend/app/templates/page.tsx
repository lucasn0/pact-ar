"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiGet } from "@/lib/api";

interface Template {
  id: string;
  nombre: string;
  descripcion: string;
  cantidad_variables: number;
}

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  const ORDER = [
    "servicios",
    "locacion-inmueble",
    "senal-reserva",
    "compraventa",
    "acuerdo-pago",
    "cesion-derechos",
    "confidencialidad",
    "contrato-obra",
    "acuerdo-socios",
    "mandato",
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }

    apiGet("/templates", token)
      .then((data) => {
        const sorted = [...data.templates].sort((a: Template, b: Template) => {
          const ia = ORDER.indexOf(a.id);
          const ib = ORDER.indexOf(b.id);
          return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
        });
        setTemplates(sorted);
      })
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-sm text-hint">Cargando templates...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="px-4 sm:px-12 py-5 border-b border-border flex justify-between items-center">
        <Link href="/" className="font-serif text-xl tracking-tight text-ink">
          pact<span className="text-green">.ar</span>
        </Link>
        <Link href="/dashboard" className="text-sm text-muted hover:text-ink transition-colors">
          ← Dashboard
        </Link>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-12 py-8 sm:py-16">
        <div className="flex items-center gap-2 mb-6">
          <span className="w-6 h-px bg-green" />
          <span className="text-xs font-medium uppercase tracking-widest text-green">
            Biblioteca
          </span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl text-ink mb-8 sm:mb-12">Elegí un tipo de contrato</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {templates.map((t) => (
            <Link
              key={t.id}
              href={`/editor/${t.id}`}
              className="group bg-surface border border-border p-6 hover:border-ink transition-colors"
            >
              <h3 className="font-serif text-lg text-ink mb-2 group-hover:text-green transition-colors">
                {t.nombre}
              </h3>
              <p className="text-sm text-muted font-light leading-relaxed mb-4">
                {t.descripcion}
              </p>
              <span className="text-xs uppercase tracking-widest text-hint">
                {t.cantidad_variables} campos →
              </span>
            </Link>
          ))}

          {/* Card personalizado */}
          <Link
            href="/editor/personalizado"
            className="group bg-surface border border-dashed border-border p-6 hover:border-ink transition-colors"
          >
            <h3 className="font-serif text-lg text-ink mb-2 group-hover:text-green transition-colors">
              Contrato personalizado
            </h3>
            <p className="text-sm text-muted font-light leading-relaxed mb-4">
              Escribí o pegá el texto de tu propio contrato desde cero, sin usar un template.
            </p>
            <span className="text-xs uppercase tracking-widest text-hint">
              Editor libre →
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
