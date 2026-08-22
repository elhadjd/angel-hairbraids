import { formatListedPrice } from "@/lib/format";
import { Container, SectionHeading } from "@/components/ui/button";
import type { CatalogPriceGroup } from "@/lib/types";
import { cn } from "@/lib/format";

export function PriceTables({
  tables,
  currency = "USD",
}: {
  tables: CatalogPriceGroup[];
  currency?: string;
}) {
  if (!tables.length) return null;

  return (
    <section className="bg-paper py-20 lg:py-28">
      <Container>
        <SectionHeading
          kicker="Investment"
          title="Price lists"
          copy="Live from the atelier catalogue. Length, size, and hair type can change the final quote."
        />
        <div className="mt-12 space-y-14">
          {tables.map((table) => (
            <div key={table.id}>
              <h3 className="font-display text-3xl">{table.title}</h3>
              {table.description ? (
                <p className="mt-2 max-w-xl text-sm text-muted">{table.description}</p>
              ) : null}
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {table.items.map((item) => (
                  <article
                    key={item.id}
                    className={cn(
                      "border p-6",
                      item.highlighted ? "border-gold bg-ivory" : "border-gold/25 bg-ivory/70",
                    )}
                  >
                    {item.badge ? <p className="kicker">{item.badge}</p> : null}
                    <h4 className="mt-2 font-display text-2xl">{item.title}</h4>
                    {item.description ? (
                      <p className="mt-2 text-sm leading-relaxed text-muted">
                        {item.description}
                      </p>
                    ) : null}
                    <p className="mt-5 font-display text-3xl text-ink">
                      {formatListedPrice(item.price, currency, item.priceLabel)}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
