"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface ContratoFirma {
  firmante_nombre: string;
  contrato_nombre: string;
  cuerpo: string;
}

export default function FirmarPage() {
  const params = useParams();
  const token = params.token as string;

  const [data, setData] = useState<ContratoFirma | null>(null);
  const [estado, setEstado] = useState<"cargando" | "listo" | "firmado" | "error">("cargando");
  const [errorMsg, setErrorMsg] = useState("");
  const [signing, setSigning] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/signatures/firmar/${token}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.error) { setErrorMsg(json.error); setEstado("error"); return; }
        setData(json);
        setEstado("listo");
      })
      .catch(() => { setErrorMsg("No se pudo cargar el contrato."); setEstado("error"); });
  }, [token]);

  async function handleFirmar() {
    setSigning(true);
    setErrorMsg("");
    try {
      const res = await fetch(`${API_URL}/signatures/firmar/${token}`, { method: "POST" });
      const json = await res.json();
      if (!res.ok || json.error) {
        setErrorMsg(json.error || "Error al registrar la firma. Intentá de nuevo.");
        setSigning(false);
        return;
      }
      setEstado("firmado");
    } catch {
      setErrorMsg("Error de conexión. Intentá de nuevo.");
      setSigning(false);
    }
  }

  if (estado === "cargando") {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-sm text-hint">Cargando contrato...</p>
      </div>
    );
  }

  if (estado === "error") {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="font-serif text-2xl text-ink">Link inválido</p>
        <p className="text-sm text-muted">{errorMsg}</p>
        <Link href="/" className="text-sm text-green underline underline-offset-4">
          Ir a pact.ar
        </Link>
      </div>
    );
  }

  if (estado === "firmado") {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-6 text-center">
        <div className="flex items-center gap-2 mb-6">
          <span className="w-6 h-px bg-green" />
          <span className="text-xs font-medium uppercase tracking-widest text-green">Firmado</span>
        </div>
        <p className="font-serif text-3xl sm:text-4xl text-ink mb-4">Contrato firmado correctamente</p>
        <p className="text-sm text-muted mb-8">Te enviamos una confirmación por email.</p>
        <Link href="/" className="text-sm text-green underline underline-offset-4">
          Ir a pact.ar
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="px-4 sm:px-12 py-5 border-b border-border">
        <Link href="/" className="font-serif text-xl tracking-tight text-ink">
          pact<span className="text-green">.ar</span>
        </Link>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-12 py-8 sm:py-16">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-6 h-px bg-green" />
          <span className="text-xs font-medium uppercase tracking-widest text-green">
            Invitación a firmar
          </span>
        </div>

        <h1 className="font-serif text-2xl sm:text-3xl text-ink mb-2">{data?.contrato_nombre}</h1>
        <p className="text-sm text-muted mb-8 sm:mb-10">
          Hola <strong>{data?.firmante_nombre}</strong>, revisá el contrato y firmá al pie.
        </p>

        {/* Contrato */}
        <div className="bg-surface border border-border p-4 sm:p-10 mb-8 sm:mb-10 overflow-x-auto">
          {data?.cuerpo.split('\n').map((line, i) => {
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

        {/* Aviso legal */}
        <div className="border border-border p-4 sm:p-5 mb-6 sm:mb-8 bg-green-light">
          <p className="text-xs text-green leading-relaxed">
            Al hacer click en "Firmar contrato" confirmás tu identidad mediante este email y aceptás el contenido del contrato. La firma quedará registrada con fecha, hora e IP. Válido bajo Ley 25.506 y CCyC art. 288.
          </p>
        </div>

        {errorMsg && (
          <p className="text-xs text-red-600 mb-4">{errorMsg}</p>
        )}

        <button
          onClick={handleFirmar}
          disabled={signing}
          className="w-full bg-ink text-cream text-xs font-medium uppercase tracking-widest py-4 hover:bg-green transition-colors disabled:opacity-50"
        >
          {signing ? "Registrando firma..." : "Firmar contrato"}
        </button>

        <p className="text-xs text-hint text-center mt-4">
          ¿No esperabas este email? Ignoralo, no se registrará ninguna firma.
        </p>
      </div>
    </div>
  );
}
