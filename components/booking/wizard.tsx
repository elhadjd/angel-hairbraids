"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { Service, StyleLook, Stylist } from "@/lib/types";
import { cn, formatDuration, formatPrice, formatDate, formatTime } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { warmBlur } from "@/lib/blur";

const steps = [
  "Service",
  "Style",
  "Stylist",
  "Date",
  "Time",
  "Details",
  "Confirm",
];

export function BookingWizard() {
  const router = useRouter();
  const params = useSearchParams();
  const [step, setStep] = useState(0);
  const [services, setServices] = useState<Service[]>([]);
  const [styles, setStyles] = useState<StyleLook[]>([]);
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [styleId, setStyleId] = useState<string | null>(null);
  const [stylistId, setStylistId] = useState<string | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/catalog")
      .then((r) => r.json())
      .then((data) => {
        setServices(data.services);
        setStyles(data.styles);
        setStylists(data.stylists);
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
  const stylist = stylists.find((s) => s.id === stylistId) ?? null;
  const durationMin = style?.durationMin ?? service?.durationMin ?? 180;
  const price = style?.priceFrom ?? service?.priceFrom ?? 0;

  const styleChoices = styles.filter((s) => !serviceId || s.serviceId === serviceId);
  const stylistChoices = stylists.filter(
    (s) => !serviceId || s.specialties.includes(serviceId),
  );

  useEffect(() => {
    if (!stylistId || !date) return;
    let active = true;
    fetch(
      `/api/appointments/availability?stylistId=${stylistId}&date=${date}&duration=${durationMin}`,
    )
      .then((r) => r.json())
      .then((d) => {
        if (active) setSlots(d.slots ?? []);
      });
    return () => {
      active = false;
    };
  }, [stylistId, date, durationMin]);

  const visibleSlots = stylistId && date ? slots : [];

  function next() {
    setError("");
    if (step === 0 && !serviceId) return setError("Please choose a service.");
    if (step === 2 && !stylistId) return setError("Please choose a stylist.");
    if (step === 3 && !date) return setError("Please choose a date.");
    if (step === 4 && !time) return setError("Please choose a time.");
    if (step === 5) {
      if (!form.customerName || !form.customerPhone || !form.customerEmail) {
        return setError("Name, phone, and email are required.");
      }
    }
    setStep((s) => Math.min(s + 1, 6));
  }

  async function confirm() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        serviceId,
        styleId,
        stylistId,
        date,
        time,
        ...form,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Could not complete booking.");
      return;
    }
    router.push(`/book/success?ref=${data.appointment.reference}`);
  }

  return (
    <div className="grid gap-10 lg:grid-cols-12">
      <aside className="lg:col-span-4">
        <p className="kicker">Step {String(step + 1).padStart(2, "0")}</p>
        <h1 className="mt-3 font-display text-4xl sm:text-5xl">
          {steps[step]}
        </h1>
        <ol className="mt-8 space-y-3">
          {steps.map((label, i) => (
            <li key={label} className="flex items-center gap-3 text-sm">
              <span
                className={cn(
                  "grid h-6 w-6 place-items-center text-[10px]",
                  i === step
                    ? "bg-gold text-ink"
                    : i < step
                      ? "border border-gold text-gold"
                      : "border border-gold/30 text-muted",
                )}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className={i === step ? "text-ink" : "text-muted"}>{label}</span>
            </li>
          ))}
        </ol>
        <div className="mt-8 h-px w-full bg-gold/30">
          <div
            className="h-px bg-gold transition-all duration-500"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>
        {service ? (
          <div className="mt-8 hidden text-sm text-muted lg:block">
            <p className="text-ink">{service.name}</p>
            {style ? <p>{style.name}</p> : null}
            {stylist ? <p>{stylist.name}</p> : null}
            {date && time ? (
              <p>
                {formatDate(date)} · {formatTime(time)}
              </p>
            ) : null}
            <p className="mt-2 text-gold">from {formatPrice(price)}</p>
          </div>
        ) : null}
      </aside>

      <div className="lg:col-span-8">
        {step === 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {services.map((s) => (
              <ChoiceCard
                key={s.id}
                image={s.image}
                title={s.name}
                meta={`from ${formatPrice(s.priceFrom)} · ${formatDuration(s.durationMin, s.durationMax)}`}
                selected={serviceId === s.id}
                onClick={() => {
                  setServiceId(s.id);
                  if (style && style.serviceId !== s.id) setStyleId(null);
                  setStylistId(null);
                }}
              />
            ))}
          </div>
        ) : null}

        {step === 1 ? (
          <div>
            <p className="mb-6 text-sm text-muted">
              Optional — skip if you prefer to decide in the chair.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {styleChoices.map((s) => (
                <ChoiceCard
                  key={s.id}
                  image={s.image}
                  title={s.name}
                  meta={`from ${formatPrice(s.priceFrom)}`}
                  selected={styleId === s.id}
                  onClick={() => setStyleId(s.id)}
                />
              ))}
            </div>
            <button
              type="button"
              className="mt-6 text-[11px] tracking-[0.22em] uppercase text-muted underline"
              onClick={() => {
                setStyleId(null);
                setStep(2);
              }}
            >
              Skip this step
            </button>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {stylistChoices.map((s) => (
              <ChoiceCard
                key={s.id}
                image={s.image}
                title={s.name}
                meta={s.role}
                selected={stylistId === s.id}
                onClick={() => {
                  setStylistId(s.id);
                  setTime(null);
                }}
              />
            ))}
          </div>
        ) : null}

        {step === 3 && stylist ? (
          <Calendar
            month={month}
            setMonth={setMonth}
            selected={date}
            stylist={stylist}
            onSelect={(iso) => {
              setDate(iso);
              setTime(null);
            }}
          />
        ) : null}

        {step === 4 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {visibleSlots.length === 0 ? (
              <p className="col-span-full text-sm text-muted">
                No openings on this day. Please choose another date.
              </p>
            ) : (
              visibleSlots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setTime(slot)}
                  className={cn(
                    "border px-4 py-3 text-sm transition-colors",
                    time === slot
                      ? "border-gold bg-gold text-ink"
                      : "border-gold/30 hover:border-gold",
                  )}
                >
                  {formatTime(slot)}
                </button>
              ))
            )}
          </div>
        ) : null}

        {step === 5 ? (
          <form className="grid gap-5" onSubmit={(e) => e.preventDefault()}>
            <Field
              label="Full Name"
              value={form.customerName}
              onChange={(v) => setForm({ ...form, customerName: v })}
            />
            <Field
              label="Phone Number"
              value={form.customerPhone}
              onChange={(v) => setForm({ ...form, customerPhone: v })}
            />
            <Field
              label="Email"
              type="email"
              value={form.customerEmail}
              onChange={(v) => setForm({ ...form, customerEmail: v })}
            />
            <Field
              label="Special Notes"
              textarea
              value={form.notes}
              onChange={(v) => setForm({ ...form, notes: v })}
            />
          </form>
        ) : null}

        {step === 6 ? (
          <div className="border border-gold/30 bg-paper/50 p-6 sm:p-8">
            <p className="kicker">Review</p>
            <h2 className="mt-3 font-display text-3xl">Confirm your visit</h2>
            <dl className="mt-8 space-y-3 text-sm">
              <Row k="Service" v={service?.name} />
              <Row k="Style" v={style?.name ?? "To be decided"} />
              <Row k="Stylist" v={stylist?.name} />
              <Row k="Date" v={date ? formatDate(date) : ""} />
              <Row k="Time" v={time ? formatTime(time) : ""} />
              <Row k="Duration" v={formatDuration(durationMin)} />
              <Row k="From" v={formatPrice(price)} />
              <Row k="Name" v={form.customerName} />
              <Row k="Contact" v={`${form.customerPhone} · ${form.customerEmail}`} />
            </dl>
            <p className="mt-6 text-xs leading-relaxed text-muted">
              A deposit of {formatPrice(Math.min(50, Math.round(price * 0.15)))} will
              be requested to hold the chair. Online deposit payment can be enabled
              with Stripe when you are ready — the structure is already in place.
            </p>
          </div>
        ) : null}

        {error ? <p className="mt-6 text-sm text-clay">{error}</p> : null}

        <div className="mt-10 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className="text-[11px] tracking-[0.22em] uppercase text-muted"
            disabled={step === 0}
          >
            Back
          </button>
          {step < 6 ? (
            <Button onClick={next}>Continue</Button>
          ) : (
            <Button onClick={confirm} disabled={loading}>
              {loading ? "Reserving…" : "Confirm Appointment"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v?: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-gold/20 py-2">
      <dt className="text-muted">{k}</dt>
      <dd className="text-right">{v}</dd>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  textarea?: boolean;
}) {
  const cls =
    "mt-2 w-full border-0 border-b border-gold/40 bg-transparent py-3 outline-none focus:border-gold";
  return (
    <label className="block text-[11px] tracking-[0.22em] uppercase text-muted">
      {label}
      {textarea ? (
        <textarea
          rows={4}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cls}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cls}
        />
      )}
    </label>
  );
}

function ChoiceCard({
  image,
  title,
  meta,
  selected,
  onClick,
}: {
  image: string;
  title: string;
  meta: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "overflow-hidden border text-left transition-all",
        selected ? "border-gold" : "border-transparent hover:border-gold/40",
      )}
    >
      <span className="relative block aspect-[4/3]">
        <Image
          src={image}
          alt={title}
          fill
          placeholder="blur"
          blurDataURL={warmBlur}
          sizes="(max-width: 640px) 100vw, 40vw"
          className="object-cover"
        />
      </span>
      <span className="block bg-ivory p-4">
        <span className="block font-display text-2xl">{title}</span>
        <span className="mt-1 block text-xs text-muted">{meta}</span>
      </span>
    </button>
  );
}

function Calendar({
  month,
  setMonth,
  selected,
  stylist,
  onSelect,
}: {
  month: Date;
  setMonth: (d: Date) => void;
  selected: string | null;
  stylist: Stylist;
  onSelect: (iso: string) => void;
}) {
  const days = buildCalendar(month);
  const label = month.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
          className="text-sm"
        >
          ←
        </button>
        <p className="font-display text-2xl">{label}</p>
        <button
          type="button"
          onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
          className="text-sm"
        >
          →
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] tracking-[0.18em] uppercase text-muted">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="py-2">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((d, i) => {
          if (!d) return <div key={`e-${i}`} />;
          const iso = toISO(d);
          const available =
            d >= today && stylist.workingDays.includes(d.getDay());
          const on = selected === iso;
          return (
            <button
              key={iso}
              type="button"
              disabled={!available}
              onClick={() => onSelect(iso)}
              className={cn(
                "aspect-square text-sm transition-colors",
                on && "bg-gold text-ink",
                !on && available && "hover:bg-paper",
                !available && "text-muted/30",
              )}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function buildCalendar(month: Date) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const start = first.getDay();
  const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells: Array<Date | null> = [];
  for (let i = 0; i < start; i++) cells.push(null);
  for (let d = 1; d <= count; d++) {
    cells.push(new Date(month.getFullYear(), month.getMonth(), d));
  }
  return cells;
}

function toISO(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
