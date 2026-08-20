import { NextRequest } from "next/server";
import { createId, updateStore } from "@/lib/store";
import { isSiteApiConfigured, submitSiteContact } from "@/lib/sisgesc";
import { site } from "@/lib/site";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const phone = String(body.phone ?? "").trim().slice(0, 20);
  const subject = String(body.subject ?? "").trim();
  const message = String(body.message ?? "").trim();
  const service = String(body.service ?? "").trim();
  const serviceType = String(body.serviceType ?? "inquiry").trim();
  const pageUrl = String(body.pageUrl ?? `${site.url}/contact`);

  const errors: Record<string, string[]> = {};
  if (!name) errors.name = ["The name field is required."];
  if (!email) errors.email = ["The email field is required."];
  else if (!EMAIL_RE.test(email)) {
    errors.email = ["The email field must be a valid email."];
  }
  if (!phone) errors.phone = ["The phone field is required."];

  if (Object.keys(errors).length) {
    return Response.json(
      { message: Object.values(errors)[0][0], errors },
      { status: 422 },
    );
  }

  let provider: "sisgesc" | "local" = "local";
  let remoteContact: unknown = null;

  if (isSiteApiConfigured()) {
    try {
      const result = await submitSiteContact({
        name,
        email,
        phone,
        subject: subject || undefined,
        message: message || undefined,
        service: service || undefined,
        serviceType,
        pageUrl,
      });

      if (result.status === 422) {
        return Response.json(result.data, { status: 422 });
      }

      if (result.status === 201 || result.ok) {
        provider = "sisgesc";
        remoteContact = result.data.contact ?? result.data;
      } else {
        console.error("SISGESC contact error", result.status, result.data);
      }
    } catch (error) {
      console.error("SISGESC contact request failed", error);
    }
  }

  await updateStore((current) => ({
    ...current,
    inquiries: [
      ...(current.inquiries ?? []),
      {
        id: createId("inq"),
        name,
        email,
        phone,
        subject,
        message,
        service,
        createdAt: new Date().toISOString(),
        provider,
      },
    ],
  }));

  return Response.json(
    {
      success: true,
      message: "Contacto Enviado com sucesso",
      contact:
        remoteContact ?? {
          name,
          email,
          phone,
          subject,
          message,
        },
    },
    { status: 201 },
  );
}
