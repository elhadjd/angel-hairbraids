import { NextRequest } from "next/server";
import { readStore } from "@/lib/store";

export async function GET(request: NextRequest) {
  const store = await readStore();
  const { searchParams } = request.nextUrl;
  const service = searchParams.get("service");

  return Response.json({
    services: store.services,
    styles: service
      ? store.styles.filter(
          (s) => s.serviceId === service || s.slug === service,
        )
      : store.styles,
    stylists: store.stylists,
  });
}
