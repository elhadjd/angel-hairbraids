"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { Service, StyleLook } from "@/lib/types";
import { cn, formatDuration, formatListedPrice, formatPrice, formatDate, formatTime } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Media } from "@/components/ui/media";
import { site } from "@/lib/site";

function todayISO() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
}

function addDaysISO(iso: string, days: number) {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d + days);
  const yy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

function weekdayOf(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).getDay();
}

function upcomingOpenDays(count = 8) {
  const days: string[] = [];
  const start = todayISO();
  for (let i = 0; i < 21 && days.length < count; i++) {
    const iso = addDaysISO(start, i);
    if (weekdayOf(iso) !== site.closedWeekday) days.push(iso);
  }
  return days;
}

function chipLabel(iso: string) {
  const today = todayISO();
  if (iso === today) return "Today";
  if (iso === addDaysISO(today, 1)) return "Tomorrow";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function BookingWizard() {
  const router = useRouter();
  const params = useSearchParams();
  const [services, setServices] = useState<Service[]>([]);
  const [styles, setStyles] = useState<StyleLook[]>([]);
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [styleId, setStyleId] = useState<string | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [slotResult, setSlotResult] = useState<{
    key: string;
    slots: string[];
  } | null>(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    customerPhone: "",
    customerEmail: "",
    notes: "",
  });
  const [depositAmount, setDepositAmount] = useState(0);
  const [currency, setCurrency] = useState("USD");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const quickDays = useMemo(() => upcomingOpenDays(), []);

  useEffect(() => {
    fetch("/api/catalog")
      .then((r) => r.json())
      .then((data) => {
        setServices(data.services);
        setStyles(data.styles);
        setDepositAmount(Number(data.depositAmount ?? 0));
        setCurrency(data.currency || "USD");
        const svcParam = params.get("service");
        const styleParam = params.get("style");
        if (svcParam) {
          const svc = data.services.find(
            (s: Service) => s.slug === svcParam || s.id === svcParam,
          );
          if (svc) setServiceId(svc.id);
        }
        if (styleParam) {
          const st = data.styles.find(
            (s: StyleLook) => s.slug === styleParam || s.id === styleParam,
          );
          if (st) {
            setStyleId(st.id);
            setServiceId(st.serviceId);
          }
        }
      });
  }, [params]);

  const service = services.find((s) => s.id === serviceId) ?? null;
  const style = styles.find((s) => s.id === styleId) ?? null;
  const durationMin = style?.durationMin ?? service?.durationMin ?? 180;
  const price = style?.priceFrom ?? service?.priceFrom ?? 0;
  const styleChoices = styles.filter((s) => !serviceId || s.serviceId === serviceId);

  const slotKey =
    date && serviceId ? `${date}:${serviceId}:${durationMin}` : "";

  useEffect(() => {
    if (!slotKey || !date || !serviceId) return;
    let active = true;
    const query = new URLSearchParams({
      date,
      duration: String(durationMin),
      serviceId,
    });
    fetch(`/api/appointments/availability?${query}`)
      .then((r) => r.json())
      .then((d) => {
        if (!active) return;
        const next = (d.slots ?? []) as string[];
        setSlotResult({ key: slotKey, slots: next });
        setTime((current) => (current && next.includes(current) ? current : null));
      });
    return () => {
      active = false;
    };
  }, [slotKey, date, durationMin, serviceId]);

  const slotsReady = Boolean(slotKey) && slotResult?.key === slotKey;
  const visibleSlots = slotsReady ? slotResult.slots : [];
  const slotsLoading = Boolean(slotKey) && !slotsReady;

  async function confirm(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!serviceId) return setError("Choose a service.");
    if (!date) return setError("Choose a date.");
    if (!time) return setError("Choose a time.");
    if (!form.firstName || !form.lastName || !form.customerPhone || !form.customerEmail) {
      return setError("First name, last name, phone, and email are required.");
    }

    setLoading(true);
    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        serviceId,
        styleId,
        date,
        time,
        firstName: form.firstName,
        lastName: form.lastName,
        customerName: `${form.firstName} ${form.lastName}`.trim(),
        customerPhone: form.customerPhone,
        customerEmail: form.customerEmail,
        notes: form.notes,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? data.message ?? "Could not complete booking.");
      return;
    }
    const paymentUrl = data.payment?.payment_url as string | undefined;
    const remoteId = data.appointment?.id;
    if (paymentUrl) {
      if (remoteId != null) {
        sessionStorage.setItem("pendingAppointmentId", String(remoteId));
      }
      window.location.href = paymentUrl;
      return;
    }
    const ref = data.appointment?.reference ?? "";
    const query = new URLSearchParams({ ref: String(ref) });
    if (remoteId != null) query.set("appointment_id", String(remoteId));
    router.push(`/book/success?${query.toString()}`);
  }

  return (
    <form onSubmit={confirm} className="mx-auto max-w-3xl">
      <p className="kicker">Reserve the chair</p>
      <h1 className="mt-3 font-display text-[2.35rem] leading-[1.05] sm:text-5xl">
        Book in one go.
      </h1>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
        Pick a service, a day, and a time. We seat you with the next available
        specialist — no extra steps.
      </p>

      <section className="mt-10">
        <SectionLabel n="01" title="Service" />
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {services.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setServiceId(s.id);
                if (style && style.serviceId !== s.id) setStyleId(null);
                setTime(null);
              }}
              className={cn(
                "flex min-h-16 items-center gap-3 border px-3 py-2.5 text-left transition-colors",
                serviceId === s.id
                  ? "border-gold bg-gold/10"
                  : "border-gold/25 hover:border-gold/60",
              )}
            >
              <span className="relative h-12 w-12 shrink-0 overflow-hidden bg-paper">
                <Media src={s.image} alt="" sizes="48px" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-display text-xl leading-tight">
                  {s.name}
                </span>
                <span className="mt-0.5 block text-xs text-muted">
                  from {formatListedPrice(s.priceFrom, s.currency || currency, s.priceLabel)} · {formatDuration(s.durationMin, s.durationMax)}
                </span>
              </span>
            </button>
          ))}
        </div>
      </section>

      {service && styleChoices.length > 0 ? (
        <section className="mt-8">
          <label className="block text-[11px] tracking-[0.22em] uppercase text-muted">
            Look <span className="normal-case tracking-normal text-muted/70">(optional)</span>
            <select
              value={styleId ?? ""}
              onChange={(e) => setStyleId(e.target.value || null)}
              className="field mt-2 appearance-none"
            >
              <option value="">Decide in the chair</option>
              {styleChoices.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} · from {formatListedPrice(s.priceFrom, currency)}
                </option>
              ))}
            </select>
          </label>
        </section>
      ) : null}

      <section className="mt-10">
        <SectionLabel n="02" title="Date & time" />
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {quickDays.map((iso) => (
            <button
              key={iso}
              type="button"
              onClick={() => {
                setDate(iso);
                setTime(null);
              }}
              className={cn(
                "shrink-0 border px-3 py-2 text-left text-sm transition-colors",
                date === iso
                  ? "border-gold bg-gold text-ink"
                  : "border-gold/30 hover:border-gold",
              )}
            >
              <span className="block text-[10px] tracking-[0.16em] uppercase opacity-70">
                {iso === todayISO() || iso === addDaysISO(todayISO(), 1)
                  ? chipLabel(iso)
                  : new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", {
                      weekday: "short",
                    })}
              </span>
              <span className="mt-0.5 block font-display text-lg leading-none">
                {new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </button>
          ))}
        </div>
        <label className="mt-4 block text-[11px] tracking-[0.22em] uppercase text-muted">
          Or pick another day
          <input
            type="date"
            min={todayISO()}
            value={date ?? ""}
            onChange={(e) => {
              setDate(e.target.value || null);
              setTime(null);
            }}
            className="field mt-2"
          />
        </label>

        <div className="mt-5">
          {!serviceId ? (
            <p className="text-sm text-muted">Choose a service to see open times.</p>
          ) : !date ? (
            <p className="text-sm text-muted">Choose a day to see open times.</p>
          ) : slotsLoading ? (
            <p className="text-sm text-muted">Checking the chair…</p>
          ) : visibleSlots.length === 0 ? (
            <p className="text-sm text-muted">
              No openings on this day. Try another date — Mondays the atelier is closed.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {visibleSlots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setTime(slot)}
                  className={cn(
                    "min-h-11 border px-2 py-2.5 text-sm transition-colors",
                    time === slot
                      ? "border-gold bg-gold text-ink"
                      : "border-gold/30 hover:border-gold",
                  )}
                >
                  {formatTime(slot)}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mt-10">
        <SectionLabel n="03" title="Your details" />
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <Field
            label="First name"
            value={form.firstName}
            onChange={(v) => setForm({ ...form, firstName: v })}
            autoComplete="given-name"
          />
          <Field
            label="Last name"
            value={form.lastName}
            onChange={(v) => setForm({ ...form, lastName: v })}
            autoComplete="family-name"
          />
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Field
            label="Phone"
            type="tel"
            value={form.customerPhone}
            onChange={(v) => setForm({ ...form, customerPhone: v })}
            autoComplete="tel"
          />
          <Field
            label="Email"
            type="email"
            value={form.customerEmail}
            onChange={(v) => setForm({ ...form, customerEmail: v })}
            autoComplete="email"
          />
        </div>
        <div className="mt-5">
          <Field
            label="Notes"
            optional
            textarea
            value={form.notes}
            onChange={(v) => setForm({ ...form, notes: v })}
          />
        </div>
      </section>

      <div className="mt-10 border border-gold/30 bg-paper/50 p-5 sm:p-6">
        <p className="text-sm text-muted">
          {service ? service.name : "Choose a service"}
          {style ? ` · ${style.name}` : ""}
          {date && time ? ` · ${formatDate(date)} at ${formatTime(time)}` : ""}
        </p>
        {service ? (
          <p className="mt-2 font-display text-2xl">
            from {formatListedPrice(price, service?.currency || currency, service?.priceLabel)}
            <span className="ml-2 text-base text-muted">
              · {formatDuration(durationMin)}
            </span>
          </p>
        ) : null}
        <p className="mt-3 text-xs leading-relaxed text-muted">
          {depositAmount > 0
            ? `A ${formatPrice(depositAmount)} deposit may be collected to hold the chair.`
            : "We’ll match you with an available specialist. You can call if you’d rather book by phone."}
        </p>
        {error ? <p className="mt-4 text-sm text-clay">{error}</p> : null}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button type="submit" disabled={loading} className="w-full sm:w-auto">
            {loading
              ? "Reserving…"
              : depositAmount > 0
                ? "Confirm & Pay Deposit"
                : "Confirm Appointment"}
          </Button>
          <a
            href={site.phoneHref}
            className="inline-flex min-h-12 items-center justify-center text-center text-[11px] tracking-[0.22em] uppercase text-muted underline sm:min-h-0"
          >
            Or call {site.phone}
          </a>
        </div>
      </div>
    </form>
  );
}

function SectionLabel({ n, title }: { n: string; title: string }) {
  return (
    <p className="flex items-baseline gap-3 font-display text-2xl">
      <span className="text-sm tracking-[0.2em] text-gold">{n}</span>
      {title}
    </p>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  textarea,
  optional,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  textarea?: boolean;
  optional?: boolean;
  autoComplete?: string;
}) {
  return (
    <label className="block text-[11px] tracking-[0.22em] uppercase text-muted">
      {label}
      {optional ? (
        <span className="normal-case tracking-normal text-muted/70"> (optional)</span>
      ) : null}
      {textarea ? (
        <textarea
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="field mt-2"
        />
      ) : (
        <input
          type={type}
          value={value}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          className="field mt-2"
        />
      )}
    </label>
  );
}
