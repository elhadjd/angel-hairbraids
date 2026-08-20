"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Service } from "@/lib/types";

const subjects = [
  "Appointment inquiry",
  "Service question",
  "Kids braids",
  "Bridal / special occasion",
  "Other",
];

export function ContactForm({ services }: { services: Service[] }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "Appointment inquiry",
    service: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError("");
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        ...form,
        service: form.service || undefined,
        serviceType: "inquiry",
        pageUrl: window.location.href,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 201 || res.ok) {
      setStatus("ok");
      setForm({
        name: "",
        email: "",
        phone: "",
        subject: "Appointment inquiry",
        service: "",
        message: "",
      });
      return;
    }
    setStatus("error");
    setError(data.message || "We could not send your message. Please try again.");
  }

  if (status === "ok") {
    return (
      <div className="border border-gold/30 bg-paper/60 p-8">
        <p className="kicker">Received</p>
        <h3 className="mt-3 font-display text-3xl">Thank you. We will be in touch.</h3>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          Your note is with the atelier. If you would rather lock a chair now,
          you can also book online.
        </p>
        <div className="mt-8">
          <Button href="/book">Book Your Appointment</Button>
        </div>
      </div>
    );
  }

  const field =
    "mt-2 w-full border-0 border-b border-gold/40 bg-transparent py-3 outline-none focus:border-gold";

  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      <label className="block text-[11px] tracking-[0.22em] uppercase text-muted">
        Full Name
        <input
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className={field}
        />
      </label>
      <label className="block text-[11px] tracking-[0.22em] uppercase text-muted">
        Email
        <input
          required
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className={field}
        />
      </label>
      <label className="block text-[11px] tracking-[0.22em] uppercase text-muted">
        Phone
        <input
          required
          maxLength={20}
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className={field}
        />
      </label>
      <label className="block text-[11px] tracking-[0.22em] uppercase text-muted">
        Subject
        <select
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
          className={`${field} appearance-none`}
        >
          {subjects.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-[11px] tracking-[0.22em] uppercase text-muted">
        Service of interest
        <select
          value={form.service}
          onChange={(e) => setForm({ ...form, service: e.target.value })}
          className={`${field} appearance-none`}
        >
          <option value="">Select a service</option>
          {services.map((s) => (
            <option key={s.id} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-[11px] tracking-[0.22em] uppercase text-muted">
        Message
        <textarea
          rows={5}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className={field}
        />
      </label>
      {error ? <p className="text-sm text-clay">{error}</p> : null}
      <div className="pt-2">
        <Button type="submit" disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : "Send Message"}
        </Button>
      </div>
    </form>
  );
}
