"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setLoggedIn(!!localStorage.getItem("token"));
  }, []);

  return (
    <nav className="sticky top-0 z-10 border-b border-border bg-cream">
      <div className="flex items-center justify-between px-4 sm:px-12 py-5">
        <Link href="/" className="font-serif text-xl tracking-tight text-ink">
          pact<span className="text-green">.ar</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-8">
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

        {/* Mobile hamburger */}
        <button
          className="sm:hidden flex flex-col gap-1.5 p-1"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menú"
        >
          <span className={`block w-5 h-px bg-ink transition-transform ${menuOpen ? "translate-y-2 rotate-45" : ""}`} />
          <span className={`block w-5 h-px bg-ink transition-opacity ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block w-5 h-px bg-ink transition-transform ${menuOpen ? "-translate-y-2 -rotate-45" : ""}`} />
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="sm:hidden border-t border-border bg-cream px-4 py-4 flex flex-col gap-4">
          <Link href="#como-funciona" onClick={() => setMenuOpen(false)} className="text-sm text-muted hover:text-ink transition-colors">
            Cómo funciona
          </Link>
          <Link href="#contratos" onClick={() => setMenuOpen(false)} className="text-sm text-muted hover:text-ink transition-colors">
            Contratos
          </Link>
          <Link href="#precios" onClick={() => setMenuOpen(false)} className="text-sm text-muted hover:text-ink transition-colors">
            Precios
          </Link>
          {loggedIn ? (
            <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="text-xs font-medium uppercase tracking-widest px-5 py-3 border border-ink text-ink text-center hover:bg-ink hover:text-cream transition-colors">
              Dashboard
            </Link>
          ) : (
            <Link href="/login" onClick={() => setMenuOpen(false)} className="text-xs font-medium uppercase tracking-widest px-5 py-3 border border-ink text-ink text-center hover:bg-ink hover:text-cream transition-colors">
              Ingresar
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
