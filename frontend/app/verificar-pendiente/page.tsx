import Link from "next/link";

export default function VerificarPendientePage() {
  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center gap-4">
      <Link href="/" className="font-serif text-xl tracking-tight text-ink mb-4">
        pact<span className="text-green">.ar</span>
      </Link>

      <div className="flex items-center gap-2">
        <span className="block w-6 h-px bg-green" />
        <span className="text-xs font-medium uppercase tracking-widest text-green">Casi listo</span>
      </div>

      <p className="font-serif text-3xl text-ink">Revisá tu email</p>
      <p className="text-sm text-muted text-center max-w-sm">
        Te enviamos un link de verificación. Hacé click en el link para activar tu cuenta y empezar a crear contratos.
      </p>

      <Link href="/login" className="text-sm text-green underline underline-offset-4 mt-4">
        Ya verifiqué, ir al login
      </Link>
    </div>
  );
}
