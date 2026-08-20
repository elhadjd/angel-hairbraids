import { Reveal } from "@/components/ui/reveal";
import { Container, SectionHeading } from "@/components/ui/button";

const reasons = [
  {
    n: "01",
    title: "Experienced Stylists",
    copy: "Master braiders with decades of combined practice — not a rotating chair of apprentices.",
  },
  {
    n: "02",
    title: "Healthy Hair Focus",
    copy: "Tension-aware installs, scalp checks, and honest advice when a style is too heavy.",
  },
  {
    n: "03",
    title: "Premium Products",
    copy: "Botanical oils, quality extensions, and finishes chosen for shine without buildup.",
  },
  {
    n: "04",
    title: "Clean & Comfortable",
    copy: "A quiet, immaculate suite. Tea, blankets, and a pace that never rushes the part.",
  },
  {
    n: "05",
    title: "Personalized Service",
    copy: "Face shape, lifestyle, and hair history shape the map — never a one-look-fits-all.",
  },
  {
    n: "06",
    title: "Long-Lasting Results",
    copy: "Styles designed to remain beautiful for weeks, not just the walk to the car.",
  },
];

export function WhyUs() {
  return (
    <section className="bg-espresso py-24 text-ivory lg:py-32">
      <Container>
        <Reveal>
          <SectionHeading
            light
            kicker="Why Angel"
            title="The difference is in the hands."
            copy="Luxury, for us, is time, technique, and the feeling of being completely looked after."
          />
        </Reveal>
        <div className="mt-16 grid gap-x-12 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map((r, i) => (
            <Reveal key={r.n} delay={i * 70}>
              <p className="font-display text-3xl text-gold">{r.n}</p>
              <h3 className="mt-4 font-display text-2xl">{r.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ivory/65">{r.copy}</p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
