# Angel African Hair Braiding

Luxury African hair braiding salon website for Columbus, Ohio. Public pages, a one-screen booking form, and a contact form. Catalogue images, prices, and services come from the SISGESC Site API.

## Stack

- Next.js 16 (App Router)
- React 19
- Tailwind CSS 4
- TypeScript

## Develop

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## SISGESC

Set in `.env`:

```
SITE_API_HOST=https://your-sisgesc-host
SITE_API_KEY=your-site-api-key
```

The key is added only on the server (`key` header). It is never sent to the browser.

| Need | Route |
|------|--------|
| Media (hero, gallery, about) | `GET /api/site/media?grouped=1` |
| Services / products | `GET /api/site/products` |
| Editorial price tables | `GET /api/site/catalog-price-lists` |
| Live product price | `POST /api/site/price-lists/quote` |
| Book a chair | `POST /api/site/appointments/submit` |
| Confirm deposit | `POST /api/site/appointments/confirm-payment` |
| Contact | `POST /api/site/contacts/submit` |

If the API is not configured, the site falls back to local seed content so development still works. Appointments and contacts are still stored locally as a backup.

Booking does not send `department_id`. SISGESC uses the first company department that has appointment configuration.

Optional deposit:

```
SITE_API_DEPOSIT_AMOUNT=15
```

## Client portal

`/account` — look up visits with the booking email and phone.
