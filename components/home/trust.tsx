const stats = [
  { value: "10+", label: "Years of mastery" },
  { value: "1,000+", label: "Happy clients" },
  { value: "4", label: "Specialist stylists" },
  { value: "10", label: "Signature services" },
];

const pillars = [
  { title: "Professional Stylists", copy: "Master braiders trained in West African technique." },
  { title: "Premium Hair Care", copy: "Tension-aware methods and botanical aftercare." },
  { title: "African Braiding Specialists", copy: "Knotless, Fulani, goddess, cornrows, twists." },
  { title: "Comfortable Experience", copy: "A quiet atelier, tea, and unhurried time." },
];

export function Trust() {
  return (
    <section id="atelier" className="overflow-hidden border-y border-gold/20 bg-ink text-ivory">
      <div className="flex overflow-hidden py-6">
        <div className="marquee">
          {[...stats, ...stats].map((s, i) => (
            <div key={`${s.label}-${i}`} className="flex items-baseline gap-4">
              <span className="font-display text-4xl text-gold">{s.value}</span>
              <span className="text-[11px] tracking-[0.22em] uppercase text-ivory/60">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="grid gap-px bg-gold/20 sm:grid-cols-2 lg:grid-cols-4">
        {pillars.map((p) => (
          <article key={p.title} className="bg-espresso px-8 py-12">
            <p className="font-display text-2xl">{p.title}</p>
            <p className="mt-3 text-sm leading-relaxed text-ivory/60">{p.copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
