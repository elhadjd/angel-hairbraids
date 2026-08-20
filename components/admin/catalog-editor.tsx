"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { GalleryItem, Service, Stylist } from "@/lib/types";

function flatten(item: Service | Stylist | GalleryItem) {
  const rec = { ...(item as unknown as Record<string, unknown>) };
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(rec)) {
    if (Array.isArray(v)) out[k] = v.join(",");
    else if (v == null) out[k] = "";
    else out[k] = String(v);
  }
  return out;
}

export function CatalogEditor({
  entity,
  items,
  fields,
}: {
  entity: "service" | "stylist" | "gallery";
  items: Array<Service | Stylist | GalleryItem>;
  fields: { key: string; label: string; type?: string }[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<Record<string, string> | null>(null);

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editing) return;
    const form = new FormData(e.currentTarget);
    const image = form.get("image") as File | null;
    const body = new FormData();
    body.set("entity", entity);
    body.set("payload", JSON.stringify(editing));
    if (image && image.size) body.set("image", image);
    await fetch("/api/admin/catalog", { method: "POST", body });
    setEditing(null);
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Remove this record?")) return;
    await fetch("/api/admin/catalog", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entity, id }),
    });
    router.refresh();
  }

  return (
    <div>
      <button
        type="button"
        className="text-[11px] tracking-[0.2em] uppercase text-gold"
        onClick={() => setEditing({})}
      >
        Add new
      </button>
      <ul className="mt-6 divide-y divide-gold/15 border-y border-gold/15">
        {items.map((item) => {
          const rec = flatten(item);
          return (
            <li key={rec.id} className="flex items-center justify-between gap-4 py-4">
              <div>
                <p className="font-display text-xl">{rec.name || rec.title}</p>
                <p className="text-xs text-ivory/50">{rec.id}</p>
              </div>
              <div className="flex gap-4 text-[11px] uppercase tracking-[0.16em]">
                <button type="button" onClick={() => setEditing(rec)}>
                  Edit
                </button>
                <button type="button" onClick={() => remove(rec.id)}>
                  Delete
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {editing ? (
        <form onSubmit={save} className="mt-8 grid gap-4 border border-gold/20 p-6">
          {fields.map((f) => (
            <label key={f.key} className="text-[11px] tracking-[0.18em] uppercase text-gold">
              {f.label}
              {f.type === "textarea" ? (
                <textarea
                  className="mt-2 w-full border border-gold/20 bg-transparent p-2 text-sm text-ivory"
                  rows={4}
                  value={editing[f.key] ?? ""}
                  onChange={(e) =>
                    setEditing({ ...editing, [f.key]: e.target.value })
                  }
                />
              ) : (
                <input
                  className="mt-2 w-full border-0 border-b border-gold/30 bg-transparent py-2 text-sm text-ivory"
                  value={editing[f.key] ?? ""}
                  onChange={(e) =>
                    setEditing({ ...editing, [f.key]: e.target.value })
                  }
                />
              )}
            </label>
          ))}
          <label className="text-[11px] tracking-[0.18em] uppercase text-gold">
            Image
            <input type="file" name="image" accept="image/*" className="mt-2 block text-sm" />
          </label>
          <div className="flex gap-4">
            <button
              type="submit"
              className="bg-gold px-5 py-2 text-[11px] uppercase tracking-[0.2em] text-ink"
            >
              Save
            </button>
            <button type="button" onClick={() => setEditing(null)}>
              Close
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
