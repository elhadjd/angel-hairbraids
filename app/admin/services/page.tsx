import { requireAdminPage } from "@/lib/require-admin-page";
import { readStore } from "@/lib/store";
import { CatalogEditor } from "@/components/admin/catalog-editor";

export default async function AdminServicesPage() {
  await requireAdminPage();
  const { services } = await readStore();
  return (
    <div>
      <p className="kicker">Menu</p>
      <h1 className="mt-3 font-display text-4xl">Services</h1>
      <div className="mt-8">
        <CatalogEditor
          entity="service"
          items={services}
          fields={[
            { key: "name", label: "Name" },
            { key: "slug", label: "Slug" },
            { key: "tagline", label: "Tagline" },
            { key: "description", label: "Description", type: "textarea" },
            { key: "longDescription", label: "Long description", type: "textarea" },
            { key: "priceFrom", label: "Starting price" },
            { key: "durationMin", label: "Duration min (minutes)" },
            { key: "durationMax", label: "Duration max (minutes)" },
            { key: "category", label: "Category" },
            { key: "image", label: "Image path" },
          ]}
        />
      </div>
    </div>
  );
}
