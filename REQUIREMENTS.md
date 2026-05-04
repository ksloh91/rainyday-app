# Money Manager — product requirements

Mobile-first spending tracker: **Next.js** (static export), **Capacitor** (Android), **Firebase** (Auth, Firestore, Storage). Primary testing on **Android** (Android Studio / device).

## Tech stack

- **UI:** Next.js (App Router), React, TypeScript, Tailwind CSS
- **Native shell:** Capacitor (`webDir` → `out/` after `next build`)
- **Backend:** Firebase Authentication, Cloud Firestore, Firebase Storage
- **Device:** Camera & files via `@capacitor/camera`, `@capacitor/filesystem` (receipts)

## Currency

- **Single currency** for v1 (e.g. one app-wide or per-user setting such as MYR). No multi-currency or FX.

## Core features

### Income & expenses

- Log transactions with amount, date/time, type (income | expense), notes/description.
- **Categories** (and optional budgets) as needed for reporting.

### Recurring income & expenses

- Recurrence rules: e.g. daily, weekly, monthly (by day of month), yearly.
- Fields: amount, type, category, account (if modeled), **payment method**, optional end date, active flag.
- Strategy: **lazy** (compute occurrences in UI for a date range) and/or **materialized** instances; document the chosen approach in implementation.

### Payment method (required)

Every transaction (and recurring rule default, where applicable) must record **method of payment**, including at least:

| ID (stored)   | Label (example)        |
|---------------|------------------------|
| `tng`         | Touch ’n Go / TNG      |
| `qr_pay`      | QR Pay (e.g. DuitNow)  |
| `credit_card` | Credit card            |
| `cash`        | Cash                   |

Allow future extension (e.g. debit card, bank transfer) via config or additional enum values.

### Receipts

- Capture via camera or pick from gallery; optional compress/resize before upload.
- Store files in **Firebase Storage**; metadata (URL, path, type, created time) linked on the transaction (or receipts subcollection).
- Enforce access with Storage rules aligned to `request.auth.uid`.

### Quick repeat / merchant presets (hybrid)

Reduce retyping for frequent merchants (e.g. same breakfast place).

1. **Recent merchants** — Derive from recent transactions: query ordered by date, dedupe by normalized merchant name, show top N for one-tap prefill.
2. **Favorites** — User-starred merchant presets (`merchantPresets` or equivalent): merchant name, category, payment method, optional default amount, `isFavorite`, `lastUsedAt`.

**On tap:** prefill merchant, category, payment method, optional amount; **default date = today** (not the historical transaction date) unless explicitly chosen.

**Also:** “Repeat” from a past transaction row; long-press or control to add/remove favorite.

### Accounts (optional but compatible)

- If “accounts” exist (cash, bank, card): **account** = where money sits; **payment method** = how the payment was made (TNG vs QR vs card vs cash). Both may be stored when useful.

## Suggested later features (out of scope unless pulled in)

- Budgets per category, insights/charts, export CSV/PDF, local notifications, biometric lock, OCR on receipts, bank CSV import, shared household / multi-user.

## Non-functional

- **Offline:** Firestore persistence where practical; queue or retry failed writes on reconnect.
- **Security:** Firestore and Storage rules scoped by authenticated user (and shared workspace ID only if multi-user is added later).

## Developer workflow (mobile)

1. `npm run dev` — web development.
2. `npm run build:mobile` — production static build + `cap sync` into `android/`.
3. `npm run android` — open Android Studio project.

Ensure `.env.local` is populated from `.env.example` before exercising Firebase in the app.
