import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { createId, readStore, updateStore } from "@/lib/store";
import { promises as fs } from "fs";
import path from "path";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const store = await readStore();
  return Response.json(store);
}

export async function POST(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const form = await request.formData();
  const entity = String(form.get("entity") ?? "");
  const payloadRaw = String(form.get("payload") ?? "{}");
  const payload = JSON.parse(payloadRaw) as Record<string, unknown>;
  const file = form.get("image") as File | null;
  let imagePath = typeof payload.image === "string" ? payload.image : "";

  if (file && file.size > 0) {
    const bytes = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split(".").pop() || "jpg";
    const name = `${entity}-${Date.now()}.${ext}`;
    const dir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, name), bytes);
    imagePath = `/uploads/${name}`;
  }

  const store = await updateStore((current) => {
    const now = new Date().toISOString();
    if (entity === "service") {
      const item = {
        id: String(payload.id || createId("svc")),
        slug: String(payload.slug),
        name: String(payload.name),
        tagline: String(payload.tagline ?? ""),
        description: String(payload.description ?? ""),
        longDescription: String(payload.longDescription ?? payload.description ?? ""),
        priceFrom: Number(payload.priceFrom ?? 0),
        durationMin: Number(payload.durationMin ?? 60),
        durationMax: Number(payload.durationMax ?? 120),
        image: imagePath,
        featured: Boolean(payload.featured),
        category: (payload.category as "braids") ?? "braids",
      };
      const exists = current.services.some((s) => s.id === item.id);
      current.services = exists
        ? current.services.map((s) => (s.id === item.id ? item : s))
        : [...current.services, item];
    }
    if (entity === "stylist") {
      const item = {
        id: String(payload.id || createId("sty")),
        slug: String(payload.slug),
        name: String(payload.name),
        role: String(payload.role ?? ""),
        bio: String(payload.bio ?? ""),
        image: imagePath,
        specialties: String(payload.specialties ?? "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        workingDays: String(payload.workingDays ?? "2,3,4,5,6")
          .split(",")
          .map((n) => Number(n.trim()))
          .filter((n) => !Number.isNaN(n)),
        startHour: Number(payload.startHour ?? 9),
        endHour: Number(payload.endHour ?? 19),
      };
      const exists = current.stylists.some((s) => s.id === item.id);
      current.stylists = exists
        ? current.stylists.map((s) => (s.id === item.id ? item : s))
        : [...current.stylists, item];
    }
    if (entity === "gallery") {
      const item = {
        id: String(payload.id || createId("gal")),
        title: String(payload.title),
        description: String(payload.description ?? ""),
        image: imagePath,
        category: (payload.category as "braids") ?? "braids",
        styleId: String(payload.styleId ?? ""),
        serviceId: String(payload.serviceId ?? ""),
        durationLabel: String(payload.durationLabel ?? ""),
        priceFrom: Number(payload.priceFrom ?? 0),
      };
      const exists = current.gallery.some((s) => s.id === item.id);
      current.gallery = exists
        ? current.gallery.map((s) => (s.id === item.id ? item : s))
        : [...current.gallery, item];
    }
    void now;
    return current;
  });

  return Response.json({ ok: true, store });
}

export async function DELETE(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { entity, id } = (await request.json()) as { entity: string; id: string };
  await updateStore((current) => {
    if (entity === "service") {
      current.services = current.services.filter((s) => s.id !== id);
    }
    if (entity === "stylist") {
      current.stylists = current.stylists.filter((s) => s.id !== id);
    }
    if (entity === "gallery") {
      current.gallery = current.gallery.filter((s) => s.id !== id);
    }
    return current;
  });
  return Response.json({ ok: true });
}
