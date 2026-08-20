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

export function isSalonOpen(date: string) {
  return weekdayFromISO(date) !== site.closedWeekday;
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

export function addMinutesToTime(time: string, minutes: number) {
  return fromMinutes(toMinutes(time) + minutes);
}
