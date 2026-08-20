import { requireAdminPage } from "@/lib/require-admin-page";
import { readStore } from "@/lib/store";
import { CatalogEditor } from "@/components/admin/catalog-editor";

export default async function AdminGalleryPage() {
  await requireAdminPage();
  const { gallery } = await readStore();
  return (
    <div>
      <p className="kicker">Archive</p>
      <h1 className="mt-3 font-display text-4xl">Gallery</h1>
      <div className="mt-8">
        <CatalogEditor
          entity="gallery"
          items={gallery}
          fields={[
            { key: "title", label: "Title" },
            { key: "description", label: "Description", type: "textarea" },
            { key: "category", label: "Category" },
            { key: "serviceId", label: "Service ID" },
            { key: "styleId", label: "Style ID" },
            { key: "durationLabel", label: "Duration label" },
            { key: "priceFrom", label: "Starting price" },
            { key: "image", label: "Image path" },
          ]}
        />
      </div>
    </div>
  );
}
