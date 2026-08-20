import Link from "next/link";
import { isAdmin } from "@/lib/auth";
import { logoutAdmin } from "@/lib/actions";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/appointments", label: "Appointments" },
  { href: "/admin/services", label: "Services" },
  { href: "/admin/stylists", label: "Stylists" },
  { href: "/admin/gallery", label: "Gallery" },
  { href: "/admin/customers", label: "Clients" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ok = await isAdmin();
  // login page is nested; check pathname via children only — login has its own layout skip
  return (
    <AdminGate ok={ok}>{children}</AdminGate>
  );
}

function AdminGate({
  ok,
  children,
}: {
  ok: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-espresso text-ivory">
      {ok ? (
        <div className="flex min-h-screen">
          <aside className="hidden w-64 shrink-0 border-r border-gold/20 p-8 lg:block">
            <Link href="/admin" className="font-display text-2xl">
              Angel
            </Link>
            <p className="mt-1 text-[10px] tracking-[0.28em] uppercase text-gold">
              Atelier Desk
            </p>
            <nav className="mt-10 flex flex-col gap-3 text-sm">
              {links.map((l) => (
                <Link key={l.href} href={l.href} className="text-ivory/70 hover:text-gold">
                  {l.label}
                </Link>
              ))}
            </nav>
            <form action={logoutAdmin} className="mt-12">
              <button type="submit" className="text-[11px] tracking-[0.2em] uppercase text-muted">
                Sign out
              </button>
            </form>
            <Link href="/" className="mt-4 block text-[11px] tracking-[0.2em] uppercase text-gold">
              View site
            </Link>
          </aside>
          <div className="flex-1">
            <header className="flex items-center justify-between border-b border-gold/20 px-5 py-4 lg:hidden">
              <p className="font-display text-xl">Angel Desk</p>
              <form action={logoutAdmin}>
                <button type="submit" className="text-xs">
                  Sign out
                </button>
              </form>
            </header>
            <nav className="flex gap-4 overflow-x-auto border-b border-gold/20 px-5 py-3 text-xs tracking-[0.16em] uppercase lg:hidden">
              {links.map((l) => (
                <Link key={l.href} href={l.href}>
                  {l.label}
                </Link>
              ))}
            </nav>
            <div className="p-5 lg:p-10">{children}</div>
          </div>
        </div>
      ) : (
        children
      )}
    </div>
  );
}

