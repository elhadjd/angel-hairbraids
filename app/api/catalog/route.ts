import { NextRequest } from "next/server";
import { getSiteCatalog } from "@/lib/catalog";
import { siteDepositAmount } from "@/lib/sisgesc";

export async function GET(request: NextRequest) {
  const catalog = await getSiteCatalog();
  const { searchParams } = request.nextUrl;
  const service = searchParams.get("service");

  return Response.json({
    source: catalog.source,
    currency: catalog.currency,
    diagnostics: catalog.diagnostics,
    services: catalog.services,
    styles: service
      ? catalog.styles.filter(
          (s) => s.serviceId === service || s.slug === service,
        )
      : catalog.styles,
    stylists: catalog.stylists,
    priceTables: catalog.priceTables,
    depositAmount: siteDepositAmount(),
  });
}
