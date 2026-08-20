import { promises as fs } from "fs";
import path from "path";
import { seedStore } from "./seed";
import type { StoreData } from "./types";

const DATA_PATH = path.join(process.cwd(), "data", "salon.json");

let chain: Promise<unknown> = Promise.resolve();

function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = chain.then(fn, fn);
  chain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function load(): Promise<StoreData> {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf8");
    const parsed = JSON.parse(raw) as StoreData;
    const seed = seedStore();
    return {
      services: parsed.services?.length ? parsed.services : seed.services,
      styles: parsed.styles?.length ? parsed.styles : seed.styles,
      stylists: parsed.stylists?.length ? parsed.stylists : seed.stylists,
      gallery: parsed.gallery?.length ? parsed.gallery : seed.gallery,
      testimonials: parsed.testimonials?.length
        ? parsed.testimonials
        : seed.testimonials,
      appointments: parsed.appointments ?? seed.appointments,
      customers: parsed.customers ?? seed.customers,
      emails: parsed.emails ?? [],
      inquiries: parsed.inquiries ?? [],
    };
  } catch {
    const seed = seedStore();
    await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
    await fs.writeFile(DATA_PATH, JSON.stringify(seed, null, 2));
    return seed;
  }
}

async function persist(store: StoreData) {
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
  await fs.writeFile(DATA_PATH, JSON.stringify(store, null, 2));
}

export function readStore() {
  return withLock(() => load());
}

export function updateStore(
  updater: (store: StoreData) => StoreData | Promise<StoreData>,
) {
  return withLock(async () => {
    const current = await load();
    const next = await updater(current);
    await persist(next);
    return next;
  });
}

export function createId(prefix: string) {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}-${rand}`;
}

export function createReference() {
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ANG-${rand}`;
}
