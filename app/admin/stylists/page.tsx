import { requireAdminPage } from "@/lib/require-admin-page";
import { readStore } from "@/lib/store";
import { CatalogEditor } from "@/components/admin/catalog-editor";

export default async function AdminStylistsPage() {
  await requireAdminPage();
  const { stylists } = await readStore();
  return (
    <div>
      <p className="kicker">Hands</p>
      <h1 className="mt-3 font-display text-4xl">Stylists</h1>
      <div className="mt-8">
        <CatalogEditor
          entity="stylist"
          items={stylists}
          fields={[
            { key: "name", label: "Name" },
            { key: "slug", label: "Slug" },
            { key: "role", label: "Role" },
            { key: "bio", label: "Bio", type: "textarea" },
            { key: "specialties", label: "Specialty service IDs (comma)" },
            { key: "workingDays", label: "Working days (0-6, comma)" },
            { key: "startHour", label: "Start hour" },
            { key: "endHour", label: "End hour" },
            { key: "image", label: "Image path" },
          ]}
        />
      </div>
    </div>
  );
}
