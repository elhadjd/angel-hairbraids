"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Appointment, AppointmentStatus, Service, Stylist } from "@/lib/types";
import { formatDate, formatPrice, formatTime } from "@/lib/format";

const statuses: AppointmentStatus[] = [
  "pending",
  "confirmed",
  "in_progress",
  "completed",
  "cancelled",
];

export function AppointmentsDesk({
  appointments,
  services,
  stylists,
}: {
  appointments: Appointment[];
  services: Service[];
  stylists: Stylist[];
}) {
  const router = useRouter();
  const [view, setView] = useState<"list" | "calendar">("list");
  const [status, setStatus] = useState<AppointmentStatus | "all">("all");
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  const filtered = useMemo(() => {
    return appointments
      .filter((a) => (status === "all" ? true : a.status === status))
      .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  }, [appointments, status]);

  async function patch(id: string, body: Record<string, string>) {
    await fetch(`/api/appointments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    router.refresh();
  }

  const daysInMonth = useMemo(() => {
    const [y, m] = month.split("-").map(Number);
    const count = new Date(y, m, 0).getDate();
    return Array.from({ length: count }, (_, i) => {
      const d = `${month}-${String(i + 1).padStart(2, "0")}`;
      return {
        date: d,
        items: appointments.filter((a) => a.date === d),
      };
    });
  }, [month, appointments]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setView("list")}
          className={view === "list" ? "text-gold" : "text-ivory/50"}
        >
          List
        </button>
        <button
          type="button"
          onClick={() => setView("calendar")}
          className={view === "calendar" ? "text-gold" : "text-ivory/50"}
        >
          Calendar
        </button>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as AppointmentStatus | "all")}
          className="ml-auto border border-gold/30 bg-transparent px-3 py-2 text-sm"
        >
          <option value="all">All statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s.replace("_", " ")}
            </option>
          ))}
        </select>
      </div>

      {view === "list" ? (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-[11px] tracking-[0.18em] uppercase text-gold">
              <tr>
                <th className="py-3">When</th>
                <th>Client</th>
                <th>Service</th>
                <th>Stylist</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id} className="border-t border-gold/15">
                  <td className="py-4">
                    {formatDate(a.date)}
                    <br />
                    <span className="text-ivory/50">{formatTime(a.time)}</span>
                  </td>
                  <td>
                    {a.customerName}
                    <br />
                    <span className="text-ivory/50">{a.reference}</span>
                  </td>
                  <td>
                    {services.find((s) => s.id === a.serviceId)?.name}
                    <br />
                    <span className="text-ivory/50">{formatPrice(a.price)}</span>
                  </td>
                  <td>{stylists.find((s) => s.id === a.stylistId)?.name}</td>
                  <td>
                    <select
                      value={a.status}
                      onChange={(e) => patch(a.id, { status: e.target.value })}
                      className="border border-gold/30 bg-espresso px-2 py-1"
                    >
                      {statuses.map((s) => (
                        <option key={s} value={s}>
                          {s.replace("_", " ")}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="space-x-3 text-[11px] uppercase tracking-[0.14em]">
                    <button
                      type="button"
                      onClick={() => {
                        const date = window.prompt("New date (YYYY-MM-DD)", a.date);
                        const time = window.prompt("New time (HH:MM)", a.time);
                        if (date && time) patch(a.id, { date, time });
                      }}
                    >
                      Reschedule
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-6">
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="border border-gold/30 bg-transparent px-3 py-2"
          />
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {daysInMonth.map((day) => (
              <div key={day.date} className="min-h-24 border border-gold/15 p-3">
                <p className="text-xs text-gold">{day.date.slice(8)}</p>
                {day.items.map((a) => (
                  <p key={a.id} className="mt-1 truncate text-xs text-ivory/70">
                    {a.time} {a.customerName}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
