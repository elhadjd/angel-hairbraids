import { requireAdminPage } from "@/lib/require-admin-page";
import { readStore } from "@/lib/store";
import { formatDate, formatPrice } from "@/lib/format";

export default async function AdminCustomersPage() {
  await requireAdminPage();
  const store = await readStore();

  return (
    <div>
      <p className="kicker">People</p>
      <h1 className="mt-3 font-display text-4xl">Clients</h1>
      <ul className="mt-8 divide-y divide-gold/15 border-y border-gold/15">
        {store.customers.map((c) => {
          const history = store.appointments.filter((a) => a.customerEmail === c.email);
          return (
            <li key={c.id} className="py-6">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h2 className="font-display text-2xl">{c.name}</h2>
                <p className="text-sm text-ivory/50">
                  {c.email} · {c.phone}
                </p>
              </div>
              <ul className="mt-4 space-y-1 text-sm text-ivory/70">
                {history.map((a) => (
                  <li key={a.id}>
                    {formatDate(a.date)} · {a.reference} · {a.status} · {formatPrice(a.price)}
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
