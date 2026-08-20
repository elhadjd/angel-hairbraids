import { NextRequest } from "next/server";
import { readStore, updateStore } from "@/lib/store";

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email")?.toLowerCase().trim();
  const phone = request.nextUrl.searchParams.get("phone")?.replace(/\D/g, "");
  if (!email || !phone) {
    return Response.json({ error: "Email and phone required" }, { status: 400 });
  }

  const store = await readStore();
  const customer = store.customers.find((c) => {
    const p = c.phone.replace(/\D/g, "");
    return c.email === email && (p.endsWith(phone) || phone.endsWith(p));
  });

  if (!customer) {
    return Response.json({ error: "No visits found" }, { status: 404 });
  }

  const appointments = store.appointments
    .filter((a) => a.customerEmail === customer.email)
    .sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`));

  const favorites = store.styles.filter((s) =>
    customer.favoriteStyleIds.includes(s.id),
  );

  return Response.json({ customer, appointments, favorites, storeMeta: {
    services: store.services,
    stylists: store.stylists,
    styles: store.styles,
  }});
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    email: string;
    phone: string;
    styleId: string;
    action: "add" | "remove";
  };
  const email = body.email?.toLowerCase().trim();
  await updateStore((current) => {
    const customer = current.customers.find((c) => c.email === email);
    if (!customer) return current;
    if (body.action === "remove") {
      customer.favoriteStyleIds = customer.favoriteStyleIds.filter(
        (id) => id !== body.styleId,
      );
    } else if (!customer.favoriteStyleIds.includes(body.styleId)) {
      customer.favoriteStyleIds.push(body.styleId);
    }
    return current;
  });
  return Response.json({ ok: true });
}
