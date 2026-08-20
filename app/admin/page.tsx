import { requireAdminPage } from "@/lib/require-admin-page";
import { readStore } from "@/lib/store";
import { todayISO, formatPrice } from "@/lib/format";
import { RevenueChart, ServiceBars } from "@/components/admin/charts";

export default async function AdminHome() {
  await requireAdminPage();
  const store = await readStore();
  const today = todayISO();
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const todayApts = store.appointments.filter(
    (a) => a.date === today && a.status !== "cancelled",
  );
  const upcoming = store.appointments.filter(
    (a) => a.date >= today && a.status !== "cancelled" && a.status !== "completed",
  );
  const monthlyRevenue = store.appointments
    .filter((a) => a.status === "completed" && a.date.startsWith(monthKey))
    .reduce((sum, a) => sum + a.price, 0);
  const allCompleted = store.appointments.filter((a) => a.status === "completed");
  const popular = Object.entries(
    allCompleted.reduce<Record<string, number>>((acc, a) => {
      acc[a.serviceId] = (acc[a.serviceId] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, count]) => ({
      name: store.services.find((s) => s.id === id)?.name ?? id,
      count,
    }));

  const revenueSeries = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const value = store.appointments
      .filter((a) => a.status === "completed" && a.date.startsWith(key))
      .reduce((sum, a) => sum + a.price, 0);
    return {
      label: d.toLocaleString("en-US", { month: "short" }),
      value,
    };
  });

  const stats = [
    { label: "Appointments today", value: String(todayApts.length) },
    { label: "Upcoming", value: String(upcoming.length) },
    { label: "Monthly revenue", value: formatPrice(monthlyRevenue) },
    { label: "Total clients", value: String(store.customers.length) },
  ];

  return (
    <div>
      <p className="kicker">Today</p>
      <h1 className="mt-3 font-display text-4xl">The desk</h1>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <article key={s.label} className="border border-gold/20 p-6">
            <p className="text-[11px] tracking-[0.2em] uppercase text-gold">{s.label}</p>
            <p className="mt-3 font-display text-4xl">{s.value}</p>
          </article>
        ))}
      </div>
      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <article className="border border-gold/20 p-6">
          <p className="text-[11px] tracking-[0.2em] uppercase text-gold">
            Completed revenue
          </p>
          <RevenueChart data={revenueSeries} />
        </article>
        <article className="border border-gold/20 p-6">
          <p className="text-[11px] tracking-[0.2em] uppercase text-gold">
            Most popular services
          </p>
          <ServiceBars items={popular} />
        </article>
      </div>
      <article className="mt-10 border border-gold/20">
        <div className="border-b border-gold/20 px-6 py-4 text-[11px] tracking-[0.2em] uppercase text-gold">
          Today’s book
        </div>
        <ul>
          {todayApts.length === 0 ? (
            <li className="px-6 py-8 text-sm text-ivory/50">No appointments today.</li>
          ) : (
            todayApts.map((a) => {
              const service = store.services.find((s) => s.id === a.serviceId);
              const stylist = store.stylists.find((s) => s.id === a.stylistId);
              return (
                <li
                  key={a.id}
                  className="flex flex-wrap items-center justify-between gap-3 border-t border-gold/10 px-6 py-4 text-sm"
                >
                  <span>
                    {a.time} · {a.customerName}
                  </span>
                  <span className="text-ivory/60">
                    {service?.name} · {stylist?.name}
                  </span>
                  <span className="text-gold">{a.status.replace("_", " ")}</span>
                </li>
              );
            })
          )}
        </ul>
      </article>
    </div>
  );
}
