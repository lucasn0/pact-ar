import Link from "next/link";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: null,
    desc: "Para probar sin compromisos",
    features: ["3 contratos por mes", "Todos los templates", "Firma electrónica"],
    cta: "Empezar gratis",
    href: "/registro",
    featured: false,
    disabled: false,
  },
  {
    name: "Pro",
    price: "$5000",
    period: "ARS / mes",
    desc: "Para quienes trabajan seguido",
    features: [
      "Contratos ilimitados",
      "Historial completo",
      "Recordatorios automáticos",
      "Descarga en PDF",
    ],
    cta: "Elegir Pro",
    href: "/registro?plan=pro",
    featured: true,
    disabled: false,
  },
  {
    name: "Business",
    price: "$15000",
    period: "ARS / mes",
    desc: "Para equipos y estudios",
    features: ["Multi-usuario", "Firma digital certificada"],
    cta: "Próximamente",
    href: "#",
    featured: false,
    disabled: true,
  },
];

export default function Pricing() {
  return (
    <section id="precios" className="max-w-5xl mx-auto px-12 py-20">
      <p className="text-xs font-medium uppercase tracking-widest text-hint mb-12">
        Planes
      </p>

      <div className="grid grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`flex flex-col p-8 bg-white border transition-colors ${
              plan.featured ? "border-ink" : "border-border"
            }`}
          >
            <p className="text-xs uppercase tracking-widest text-hint mb-4">{plan.name}</p>

            <div className="mb-1">
              <span className="font-serif text-4xl text-ink">{plan.price}</span>
              {plan.period && (
                <span className="text-sm text-hint font-light ml-1">{plan.period}</span>
              )}
            </div>

            <p className="text-sm text-muted mb-6 pb-6 border-b border-border font-light">
              {plan.desc}
            </p>

            <ul className="flex-1 space-y-2 mb-8">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-muted">
                  <span className="text-green mt-px">—</span>
                  {f}
                </li>
              ))}
            </ul>

            <Link
              href={plan.href}
              className={`block text-center text-xs font-medium uppercase tracking-widest py-3 border transition-colors ${
                plan.disabled
                  ? "border-border text-hint cursor-not-allowed pointer-events-none"
                  : plan.featured
                  ? "bg-ink text-cream border-ink hover:bg-green hover:border-green"
                  : "border-ink text-ink hover:bg-ink hover:text-cream"
              }`}
            >
              {plan.cta}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
