import { site } from "./site";
import type { Appointment, Stylist } from "./types";

function toMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function fromMinutes(total: number) {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function weekdayFromISO(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d).getDay();
}

function parseHourLabel(label: string) {
  const match = label.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/i);
  if (!match) return null;
  let hour = Number(match[1]);
  const minutes = Number(match[2] ?? 0);
  const mer = match[3]?.toUpperCase();
  if (mer === "PM" && hour < 12) hour += 12;
  if (mer === "AM" && hour === 12) hour = 0;
  return hour * 60 + minutes;
}

export function hoursForDate(date: string) {
  const weekday = weekdayFromISO(date);
  const entry = site.hours[(weekday + 6) % 7];
  if (!entry?.open || !entry?.close) return null;
  const start = parseHourLabel(entry.open);
  const end = parseHourLabel(entry.close);
  if (start == null || end == null || end <= start) return null;
  return { start, end };
}

export function isSalonOpen(date: string) {
  return hoursForDate(date) != null && weekdayFromISO(date) !== site.closedWeekday;
}

export function getHoursSlots(input: {
  date: string;
  durationMin: number;
  appointments: Appointment[];
}) {
  const hours = hoursForDate(input.date);
  if (!hours || !isSalonOpen(input.date)) return [];
  const busy = input.appointments
    .filter((a) => a.date === input.date && a.status !== "cancelled")
    .map((a) => {
      const s = toMinutes(a.time);
      return { start: s, end: s + a.durationMin };
    });
  const slots: string[] = [];
  for (let t = hours.start; t + input.durationMin <= hours.end; t += 30) {
    const slotEnd = t + input.durationMin;
    const overlaps = busy.some((b) => t < b.end && slotEnd > b.start);
    if (!overlaps) slots.push(fromMinutes(t));
  }
  return slots;
}

export function stylistsForService(stylists: Stylist[], serviceId?: string | null) {
  if (!serviceId) return stylists;
  const specialists = stylists.filter((s) => s.specialties.includes(serviceId));
  return specialists.length > 0 ? specialists : stylists;
}

export function getAvailableSlots(input: {
  stylist: Stylist;
  date: string;
  durationMin: number;
  appointments: Appointment[];
}) {
  const { stylist, date, durationMin, appointments } = input;
  const weekday = weekdayFromISO(date);
  if (!stylist.workingDays.includes(weekday) || !isSalonOpen(date)) return [];

  const start = stylist.startHour * 60;
  const end = stylist.endHour * 60;
  const busy = appointments
    .filter(
      (a) =>
        a.stylistId === stylist.id &&
        a.date === date &&
        a.status !== "cancelled",
    )
    .map((a) => {
      const s = toMinutes(a.time);
      return { start: s, end: s + a.durationMin };
    });

  const slots: string[] = [];
  for (let t = start; t + durationMin <= end; t += 30) {
    const slotEnd = t + durationMin;
    const overlaps = busy.some((b) => t < b.end && slotEnd > b.start);
    if (!overlaps) slots.push(fromMinutes(t));
  }
  return slots;
}

export function getSalonSlots(input: {
  stylists: Stylist[];
  date: string;
  durationMin: number;
  appointments: Appointment[];
  serviceId?: string | null;
}) {
  const pool = stylistsForService(input.stylists, input.serviceId);
  const unique = new Set<string>();
  for (const stylist of pool) {
    for (const slot of getAvailableSlots({
      stylist,
      date: input.date,
      durationMin: input.durationMin,
      appointments: input.appointments,
    })) {
      unique.add(slot);
    }
  }
  return [...unique].sort();
}

export function assignStylist(input: {
  stylists: Stylist[];
  date: string;
  time: string;
  durationMin: number;
  appointments: Appointment[];
  serviceId?: string | null;
}): Stylist | null {
  const pool = stylistsForService(input.stylists, input.serviceId);
  return (
    pool.find((stylist) =>
      getAvailableSlots({
        stylist,
        date: input.date,
        durationMin: input.durationMin,
        appointments: input.appointments,
      }).includes(input.time),
    ) ?? null
  );
}

export function addMinutesToTime(time: string, minutes: number) {
  return fromMinutes(toMinutes(time) + minutes);
}
