import { loginAdmin } from "@/lib/actions";
import { isAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await isAdmin()) redirect("/admin");
  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-espresso px-5 text-ivory">
      <form action={loginAdmin} className="w-full max-w-sm">
        <p className="kicker">Atelier Desk</p>
        <h1 className="mt-4 font-display text-4xl">Sign in</h1>
        <p className="mt-3 text-sm text-ivory/60">
          Private calendar, clients, and the day’s book.
        </p>
        <label className="mt-10 block text-[11px] tracking-[0.22em] uppercase text-gold">
          Password
          <input
            name="password"
            type="password"
            required
            className="mt-3 w-full border-0 border-b border-gold/40 bg-transparent py-3 text-ivory outline-none"
          />
        </label>
        {error ? (
          <p className="mt-4 text-sm text-gold">That password is not correct.</p>
        ) : null}
        <button
          type="submit"
          className="mt-10 w-full bg-gold py-3 text-[11px] tracking-[0.28em] uppercase text-ink"
        >
          Enter
        </button>
        <p className="mt-6 text-xs text-ivory/40">
          Demo password: angel2026
        </p>
      </form>
    </div>
  );
}
