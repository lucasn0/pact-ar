const steps = [
  {
    num: "01",
    title: "Elegí un template",
    desc: "Más de 10 modelos listos: servicios, confidencialidad, locación, y más. Todos redactados con validez legal argentina.",
  },
  {
    num: "02",
    title: "Completá los datos",
    desc: "Nombre, monto, fechas, condiciones. Un formulario simple que llena el contrato por vos en segundos.",
  },
  {
    num: "03",
    title: "Firmá y listo",
    desc: "Invitás a la otra parte por mail. Firma en un click desde su email. Todo queda registrado con timestamp, IP y validez legal.",
  },
];

export default function HowItWorks() {
  return (
    <section id="como-funciona" className="max-w-5xl mx-auto px-4 sm:px-12 py-16 sm:py-20">
      <p className="text-xs font-medium uppercase tracking-widest text-hint mb-10 sm:mb-12">
        Cómo funciona
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        {steps.map((step) => (
          <div key={step.num} className="border-t-2 border-ink pt-8">
            <p className="text-xs tracking-widest text-hint mb-5">{step.num}</p>
            <h3 className="font-serif text-xl text-ink mb-3">{step.title}</h3>
            <p className="text-sm text-muted leading-relaxed font-light">{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
