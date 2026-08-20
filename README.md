# Angel African Hair Braiding

A luxury African hair braiding salon website for Columbus, Ohio — designed for conversion, with a full booking flow, client portal, and atelier admin desk.

## Stack

- Next.js 16 (App Router)
- React 19
- Tailwind CSS 4
- TypeScript
- File-based data store (`data/salon.json`)

## Develop

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Booking (SISGESC)

The booking wizard posts to `/api/appointments`. That route:

1. Holds the chair locally
2. Forwards `first_name`, `last_name`, `email`, `phone`, `date`, `time`, `service`, and `notes` to `POST {SITE_API_HOST}/api/site/appointments/submit`
3. If `SITE_API_DEPOSIT_AMOUNT` is set, also sends `amount`, `success_url`, and `cancel_url`. When SISGESC returns `payment.payment_url`, the client is redirected to Stripe. After checkout, `/book/success` calls `POST /api/site/appointments/confirm-payment`.

The request does not send `department_id`. SISGESC uses the first company department that has appointment configuration.

Optional env:

```
SITE_API_DEPOSIT_AMOUNT=15
```

If SISGESC is not configured, the appointment is still stored locally.

## Contact form (SISGESC)

The `/contact` form posts to `/api/contact` on this site. That route adds the SISGESC site API key on the server (never in the browser) and forwards to:

`POST {SITE_API_HOST}/api/site/contacts/submit`

Set in `.env`:

```
SITE_API_HOST=https://your-sisgesc-host
SITE_API_KEY=your-site-api-key
```

If those variables are missing, the message is still stored locally in `data/salon.json` so no inquiry is lost.

## Admin

Visit `/admin` and sign in with the password in `ADMIN_PASSWORD` (demo: `angel2026`).

## Client portal

`/account` — look up visits with the booking email and phone.

Sample client: `maya.johnson@email.com` · `(404) 555-0192`
