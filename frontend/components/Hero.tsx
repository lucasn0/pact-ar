import Link from "next/link";

export default function Hero() {
  return (
    <section className="max-w-5xl mx-auto px-12 py-28 grid grid-cols-2 gap-16 items-center">
      {/* Left */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <span className="w-6 h-px bg-green" />
          <span className="text-xs font-medium uppercase tracking-widest text-green">
            Contratos digitales
          </span>
        </div>

        <h1 className="font-serif text-5xl font-normal leading-tight tracking-tight text-ink mb-6">
          Contratos{" "}
          <em className="italic text-green">profesionales</em>{" "}
          en minutos
        </h1>

        <p className="text-base text-muted leading-relaxed font-light mb-10 max-w-sm">
          Para freelancers y comerciantes independientes. Creá, enviá y firmá
          contratos con validez legal — sin papel, sin abogados, sin demoras.
        </p>

        <div className="flex items-center gap-6">
          <Link
            href="/registro"
            className="text-sm font-medium uppercase tracking-widest px-8 py-3 bg-ink text-cream hover:bg-green transition-colors"
          >
            Empezar gratis
          </Link>
          <Link
            href="#como-funciona"
            className="text-sm text-muted underline underline-offset-4 hover:text-ink transition-colors"
          >
            Ver cómo funciona
          </Link>
        </div>
      </div>

      {/* Right — contract card mockup */}
      <div className="relative">
        {/* Shadow card */}
        <div className="absolute -top-1.5 -left-1.5 right-1.5 bottom-1.5 border border-border bg-[#EEE] -z-10" />

        <div className="bg-white border border-border p-8">
          <div className="flex justify-between items-start mb-6">
            <span className="text-[0.65rem] uppercase tracking-widest text-hint">
              Locación de servicios
            </span>
            <span className="text-[0.65rem] uppercase tracking-widest text-green bg-green-light px-2 py-0.5">
              Firmado
            </span>
          </div>

          <h3 className="font-serif text-lg text-ink mb-1">Contrato de diseño web</h3>
          <p className="text-xs text-hint mb-6">Emitido el 14 de marzo de 2026</p>

          <hr className="border-border mb-5" />

          {[
            ["Prestador", "María González"],
            ["Cliente", "Estudio Bauer S.R.L."],
            ["Monto", "$450.000 ARS"],
            ["Duración", "30 días hábiles"],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between mb-3">
              <span className="text-xs text-hint">{label}</span>
              <span className="text-xs text-ink font-medium">{value}</span>
            </div>
          ))}

          <div className="flex gap-6 mt-6 pt-5 border-t border-border">
            {[
              ["M. González", "Prestador"],
              ["R. Bauer", "Cliente"],
            ].map(([name, role]) => (
              <div key={role} className="flex-1">
                <p className="font-serif text-base text-green border-b border-border pb-1 mb-1">
                  {name}
                </p>
                <p className="text-[0.65rem] uppercase tracking-widest text-hint">{role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
