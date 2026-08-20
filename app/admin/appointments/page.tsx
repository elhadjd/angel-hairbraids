import { requireAdminPage } from "@/lib/require-admin-page";
import { readStore } from "@/lib/store";
import { AppointmentsDesk } from "@/components/admin/appointments-desk";

export default async function AdminAppointmentsPage() {
  await requireAdminPage();
  const store = await readStore();
  return (
    <div>
      <p className="kicker">Book</p>
      <h1 className="mt-3 font-display text-4xl">Appointments</h1>
      <div className="mt-8">
        <AppointmentsDesk
          appointments={store.appointments}
          services={store.services}
          stylists={store.stylists}
        />
      </div>
    </div>
  );
}
