# Angel African Hair Braiding

A luxury African hair braiding salon website for Atlanta — designed for conversion, with a full booking flow, client portal, and atelier admin desk.

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

## Booking & email

Appointments are saved to `data/salon.json`. Confirmation emails are written to `data/emails/`. To send live mail, set `RESEND_API_KEY` and `EMAIL_FROM`.

Deposits are modeled on every appointment (`unpaid` / `paid` / `waived`) so Stripe (or another processor) can be attached later without changing the booking contract.

## Admin

Visit `/admin` and sign in with the password in `ADMIN_PASSWORD` (demo: `angel2026`).

## Client portal

`/account` — look up visits with the booking email and phone.

Sample client: `maya.johnson@email.com` · `(404) 555-0192`
