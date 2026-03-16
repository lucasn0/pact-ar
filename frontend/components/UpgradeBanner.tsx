"use client";

import { useState } from "react";
import { apiGet } from "@/lib/api";

export default function UpgradeBanner() {
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    const token = localStorage.getItem("token");
    if (!token) return;
    setLoading(true);
    try {
      const data = await apiGet("/payments/checkout", token);
      window.location.href = data.checkout_url;
    } catch {
      setLoading(false);
    }
  }

  return (
    <div className="border border-border bg-surface px-6 py-5 mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <div>
        <p className="text-sm font-medium text-ink mb-1">Estás en el plan Free</p>
        <p className="text-xs text-muted font-light">Limitado a 3 contratos por mes. Actualizá para contratos ilimitados.</p>
      </div>
      <button
        onClick={handleUpgrade}
        disabled={loading}
        className="text-xs font-medium uppercase tracking-widest px-6 py-3 bg-green text-cream hover:bg-ink transition-colors disabled:opacity-50 whitespace-nowrap self-start sm:self-auto"
      >
        {loading ? "Redirigiendo..." : "Actualizar a Pro — $5.000/mes"}
      </button>
    </div>
  );
}
