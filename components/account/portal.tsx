"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Appointment, Customer, Service, StyleLook, Stylist } from "@/lib/types";
import { formatDate, formatPrice, formatTime } from "@/lib/format";
import { Button } from "@/components/ui/button";

type Payload = {
  customer: Customer;
  appointments: Appointment[];
  favorites: StyleLook[];
  storeMeta: {
    services: Service[];
    stylists: Stylist[];
    styles: StyleLook[];
  };
};

export function AccountPortal() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [data, setData] = useState<Payload | null>(null);
  const [error, setError] = useState("");
  const [reschedule, setReschedule] = useState<Appointment | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  async function lookup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch(
      `/api/account?email=${encodeURIComponent(email)}&phone=${encodeURIComponent(phone)}`,
    );
    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "We could not find those visits.");
      setData(null);
      return;
    }
    setData(json);
  }

  async function cancel(id: string) {
    await fetch(`/api/appointments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "cancelled", email }),
    });
    setData((d) =>
      d
        ? {
            ...d,
            appointments: d.appointments.map((a) =>
              a.id === id ? { ...a, status: "cancelled" } : a,
            ),
          }
        : d,
    );
  }

  async function saveReschedule() {
    if (!reschedule || !date || !time) return;
    const res = await fetch(`/api/appointments/${reschedule.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, time, email }),
    });
    const json = await res.json();
    if (res.ok) {
      setData((d) =>
        d
          ? {
              ...d,
              appointments: d.appointments.map((a) =>
                a.id === reschedule.id ? json.appointment : a,
              ),
            }
          : d,
      );
      setReschedule(null);
    }
  }

  async function toggleFavorite(styleId: string, action: "add" | "remove") {
    await fetch("/api/account", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, phone, styleId, action }),
    });
    if (!data) return;
    if (action === "remove") {
      setData({
        ...data,
        favorites: data.favorites.filter((f) => f.id !== styleId),
      });
    }
  }

  const upcoming = data?.appointments.filter(
    (a) => a.status !== "cancelled" && a.status !== "completed",
  );
  const history = data?.appointments.filter(
    (a) => a.status === "completed" || a.status === "cancelled",
  );

  return (
    <div>
      {!data ? (
        <form onSubmit={lookup} className="mx-auto max-w-md">
          <p className="text-sm leading-relaxed text-muted">
            Enter the email and phone from your booking to see upcoming visits,
            history, and saved styles.
          </p>
          <label className="mt-8 block text-[11px] tracking-[0.22em] uppercase text-muted">
            Email
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full border-0 border-b border-gold/40 bg-transparent py-3 outline-none"
            />
          </label>
          <label className="mt-6 block text-[11px] tracking-[0.22em] uppercase text-muted">
            Phone
            <input
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-2 w-full border-0 border-b border-gold/40 bg-transparent py-3 outline-none"
            />
          </label>
          {error ? <p className="mt-4 text-sm text-clay">{error}</p> : null}
          <div className="mt-8">
            <Button type="submit">Open My Visits</Button>
          </div>
          <p className="mt-6 text-xs text-muted">
            Try the sample client: maya.johnson@email.com · (404) 555-0192
          </p>
        </form>
      ) : (
        <div className="space-y-16">
          <div>
            <p className="kicker">Welcome back</p>
            <h2 className="mt-2 font-display text-4xl">{data.customer.name}</h2>
          </div>

          <section>
            <h3 className="font-display text-3xl">Upcoming</h3>
            <div className="mt-6 space-y-4">
              {upcoming?.length ? (
                upcoming.map((a) => (
                  <AppointmentCard
                    key={a.id}
                    a={a}
                    data={data}
                    onCancel={() => cancel(a.id)}
                    onReschedule={() => {
                      setReschedule(a);
                      setDate(a.date);
                      setTime(a.time);
                    }}
                  />
                ))
              ) : (
                <p className="text-sm text-muted">No upcoming visits.</p>
              )}
            </div>
          </section>

          {reschedule ? (
            <div className="border border-gold/40 p-6">
              <p className="kicker">Reschedule {reschedule.reference}</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="border border-gold/30 bg-transparent px-3 py-2"
                />
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="border border-gold/30 bg-transparent px-3 py-2"
                />
              </div>
              <div className="mt-4 flex gap-3">
                <Button onClick={saveReschedule}>Save</Button>
                <button type="button" onClick={() => setReschedule(null)}>
                  Cancel
                </button>
              </div>
            </div>
          ) : null}

          <section>
            <h3 className="font-display text-3xl">History</h3>
            <div className="mt-6 space-y-4">
              {history?.map((a) => (
                <AppointmentCard key={a.id} a={a} data={data} />
              ))}
            </div>
          </section>

          <section>
            <h3 className="font-display text-3xl">Favorite styles</h3>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.favorites.map((f) => (
                <article key={f.id} className="bg-paper">
                  <div className="relative aspect-[3/4]">
                    <Image src={f.image} alt={f.name} fill className="object-cover" />
                  </div>
                  <div className="p-4">
                    <p className="font-display text-2xl">{f.name}</p>
                    <div className="mt-3 flex gap-3">
                      <Link
                        href={`/book?style=${f.slug}`}
                        className="text-[11px] tracking-[0.18em] uppercase underline"
                      >
                        Book
                      </Link>
                      <button
                        type="button"
                        className="text-[11px] tracking-[0.18em] uppercase text-muted"
                        onClick={() => toggleFavorite(f.id, "remove")}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </article>
              ))}
              {data.favorites.length === 0 ? (
                <p className="text-sm text-muted">No favorites yet.</p>
              ) : null}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function AppointmentCard({
  a,
  data,
  onCancel,
  onReschedule,
}: {
  a: Appointment;
  data: Payload;
  onCancel?: () => void;
  onReschedule?: () => void;
}) {
  const service = data.storeMeta.services.find((s) => s.id === a.serviceId);
  const stylist = data.storeMeta.stylists.find((s) => s.id === a.stylistId);
  const style = data.storeMeta.styles.find((s) => s.id === a.styleId);
  const live = a.status !== "cancelled" && a.status !== "completed";

  return (
    <article className="flex flex-col gap-4 border border-gold/25 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-[11px] tracking-[0.22em] uppercase text-gold">
          {a.reference} · {a.status.replace("_", " ")}
        </p>
        <p className="mt-1 font-display text-2xl">{service?.name}</p>
        <p className="text-sm text-muted">
          {style?.name ? `${style.name} · ` : ""}
          {stylist?.name} · {formatDate(a.date)} · {formatTime(a.time)} ·{" "}
          {formatPrice(a.price)}
        </p>
      </div>
      {live ? (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onReschedule}
            className="text-[11px] tracking-[0.18em] uppercase underline"
          >
            Reschedule
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="text-[11px] tracking-[0.18em] uppercase text-muted"
          >
            Cancel
          </button>
        </div>
      ) : null}
    </article>
  );
}
