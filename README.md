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

Set in `.env` or `.env.local` (restart `next dev` after changing it):

```
SITE_API_HOST=http://localhost:8080
SITE_API_KEY="your-site-api-key"
```

`SITE_API_HOST` is the ERP origin only (`http://localhost:8080`). Do **not** add `/api/site`. JSON calls go to `{SITE_API_HOST}/api/site/...`. Product images go to `{SITE_API_HOST}/produtos/image/...` (never the Next.js host). Quote the key if it contains `+`, `/`, or `=`.

The key is added only on the server (`key` header and query). It is never sent to the browser.

If SISGESC rejects or cannot be reached, booking and contact show an error. They do not show success.

| Need | Route |
|------|--------|
| Media (hero, gallery, about) | `GET /api/site/media?grouped=1` |
| Services / products | `GET /api/site/products` |
| Editorial price tables | `GET /api/site/catalog-price-lists` |
| Live product price | `POST /api/site/price-lists/quote` |
| Book a chair | `POST /api/site/appointments/submit` |
| Confirm deposit | `POST /api/site/appointments/confirm-payment` |
| Contact | `POST /api/site/contacts/submit` |

If the API is not configured, the site falls back to local seed content so development still works. When the API is configured, a successful booking is also stored locally as a backup. Open `/api/catalog` to see which SISGESC endpoints answered.

Booking does not send `department_id`. SISGESC uses the first company department that has appointment configuration.

Optional deposit:

```
SITE_API_DEPOSIT_AMOUNT=15
```

## Client portal

`/account` — look up visits with the booking email and phone.
