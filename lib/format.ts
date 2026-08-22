export function formatPrice(amount: number, currency = "USD") {
  const code = (currency || "USD").toUpperCase();
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: code,
      maximumFractionDigits: code === "USD" || code === "EUR" ? 0 : 2,
    }).format(amount);
  } catch {
    return `${amount} ${code}`;
  }
}

export function formatListedPrice(
  amount: number | null | undefined,
  currency = "USD",
  label?: string | null,
) {
  if (label && (amount == null || amount === 0)) return label;
  if (amount == null) return label || "";
  const money = formatPrice(amount, currency);
  return label ? `${money} · ${label}` : money;
}

export function formatDuration(min: number, max = min) {
  const toHours = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = minutes / 60;
    return Number.isInteger(hours) ? `${hours} hr` : `${hours.toFixed(1)} hr`;
  };
  if (min === max) return toHours(min);
  return `${toHours(min)} – ${toHours(max)}`;
}

export function formatDate(isoDate: string) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "America/New_York",
  }).format(new Date(year, month - 1, day));
}

export function formatTime(time: string) {
  const [h, m] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(h, m, 0, 0);
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function todayISO() {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "America/New_York",
  });
}

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}
