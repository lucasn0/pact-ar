"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(!!localStorage.getItem("token"));
  }, []);

  return (
    <nav className="sticky top-0 z-10 flex items-center justify-between px-12 py-5 border-b border-border bg-cream">
      <Link href="/" className="font-serif text-xl tracking-tight text-ink">
        pact<span className="text-green">.ar</span>
      </Link>

      <div className="flex items-center gap-8">
        <Link href="#como-funciona" className="text-sm text-muted hover:text-ink transition-colors">
          Cómo funciona
        </Link>
        <Link href="#contratos" className="text-sm text-muted hover:text-ink transition-colors">
          Contratos
        </Link>
        <Link href="#precios" className="text-sm text-muted hover:text-ink transition-colors">
          Precios
        </Link>
        {loggedIn ? (
          <Link href="/dashboard" className="text-xs font-medium uppercase tracking-widest px-5 py-2 border border-ink text-ink hover:bg-ink hover:text-cream transition-colors">
            Dashboard
          </Link>
        ) : (
          <Link href="/login" className="text-xs font-medium uppercase tracking-widest px-5 py-2 border border-ink text-ink hover:bg-ink hover:text-cream transition-colors">
            Ingresar
          </Link>
        )}
      </div>
    </nav>
  );
}