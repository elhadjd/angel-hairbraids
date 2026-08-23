import { promises as fs } from "fs";
import path from "path";
import { site } from "./site";
import { formatDate, formatPrice, formatTime } from "./format";
import type { Appointment, Service, Stylist } from "./types";

export function confirmationHtml(input: {
  appointment: Appointment;
  service: Service | null;
  stylist: Stylist;
  styleName?: string;
}) {
  const { appointment, service, stylist, styleName } = input;
  const serviceLabel = service
    ? `${service.name}${styleName ? ` — ${styleName}` : ""}`
    : "To be decided in the chair";
  return `<!doctype html>
<html>
  <body style="margin:0;background:#F7F3EC;font-family:Georgia,serif;color:#121212;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F3EC;padding:40px 16px;">
      <tr>
        <td align="center">
          <table width="560" cellpadding="0" cellspacing="0" style="background:#1A1024;padding:40px 36px;">
            <tr>
              <td style="color:#D36BA8;letter-spacing:0.32em;font-size:11px;text-transform:uppercase;">
                Angel African Hair Braiding
              </td>
            </tr>
            <tr>
              <td style="padding-top:18px;color:#F7F3EC;font-size:32px;line-height:1.2;">
                Your appointment is reserved.
              </td>
            </tr>
            <tr>
              <td style="padding-top:16px;color:#E6DCCF;font-size:15px;line-height:1.7;font-family:Arial,sans-serif;">
                Hello ${appointment.customerName.split(" ")[0]}, we are honored to style you.
                Please arrive 10 minutes early so we can settle you in with tea.
              </td>
            </tr>
            <tr>
              <td style="padding-top:28px;border-top:1px solid rgba(184,69,146,0.35);">
                <p style="margin:18px 0 0;color:#D36BA8;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;font-family:Arial,sans-serif;">Reference</p>
                <p style="margin:6px 0 0;color:#F7F3EC;font-size:20px;">${appointment.reference}</p>
                <p style="margin:18px 0 0;color:#D36BA8;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;font-family:Arial,sans-serif;">When</p>
                <p style="margin:6px 0 0;color:#F7F3EC;font-size:16px;font-family:Arial,sans-serif;">${formatDate(appointment.date)} · ${formatTime(appointment.time)}</p>
                <p style="margin:18px 0 0;color:#D36BA8;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;font-family:Arial,sans-serif;">Service</p>
                <p style="margin:6px 0 0;color:#F7F3EC;font-size:16px;font-family:Arial,sans-serif;">${serviceLabel}</p>
                <p style="margin:18px 0 0;color:#D36BA8;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;font-family:Arial,sans-serif;">Stylist</p>
                <p style="margin:6px 0 0;color:#F7F3EC;font-size:16px;font-family:Arial,sans-serif;">${stylist.name}</p>
                <p style="margin:18px 0 0;color:#D36BA8;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;font-family:Arial,sans-serif;">Investment</p>
                <p style="margin:6px 0 18px;color:#F7F3EC;font-size:16px;font-family:Arial,sans-serif;">From ${formatPrice(appointment.price)} · deposit ${formatPrice(appointment.deposit.amount)} (${appointment.deposit.status})</p>
              </td>
            </tr>
            <tr>
              <td style="color:#E6DCCF;font-size:13px;line-height:1.7;font-family:Arial,sans-serif;">
                ${site.address.street}<br/>
                ${site.address.city}, ${site.address.state} ${site.address.zip}<br/>
                ${site.phone}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function sendConfirmationEmail(input: {
  to: string;
  subject: string;
  html: string;
}) {
  const dir = path.join(process.cwd(), "data", "emails");
  await fs.mkdir(dir, { recursive: true });
  const filename = `${Date.now()}-${input.to.replace(/[^a-z0-9@.]/gi, "_")}.html`;
  await fs.writeFile(
    path.join(dir, filename),
    `<!-- to: ${input.to} -->\n<!-- subject: ${input.subject} -->\n${input.html}`,
  );

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    return { sent: false, stored: true, id: filename };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from:
          process.env.EMAIL_FROM ??
          `Angel African Hair Braiding <${site.email}>`,
        to: input.to,
        subject: input.subject,
        html: input.html,
      }),
    });
    return { sent: res.ok, stored: true, id: filename };
  } catch {
    return { sent: false, stored: true, id: filename };
  }
}
