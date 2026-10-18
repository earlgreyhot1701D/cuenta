---
doc: spec
status: approved
---

# Cuenta — Technical Spec

Implements `prd.md` (approved), within `scope.md > The POC Boundary`.

## How This Works, In Plain Language

Cuenta is one **Next.js** web app deployed on **Vercel**.

**Storage.** Everything Eileen records lives in one **Postgres database on Neon**: cafes, products, counts, invoices, and payments. Think of it as a set of spreadsheets the app reads and writes.

**Screens and saves.** The screens are web pages. When she taps Save, Create invoice or Mark paid, the page sends a small request to one of the app's own **API routes**. That's server code that checks her PIN session, writes to the database, and logs one line about what happened.

**Invoices.** Every invoice is a **snapshot**. When it's saved, it copies the product names, prices and cafe details, so nothing that changes later can rewrite it.

**One invoice layout, three uses:**
- the Invoice screen she looks at
- the page her Print button prints
- the PDF

**Making the PDF.** The server starts a small **headless Chrome** (a browser with no window) and opens a hidden print page that only it can reach, using a 60-second pass that works for that one invoice. It saves that page as a PDF.

**Email.** The app hands the PDF to **Resend**, which sends it from invoices@lacondesabakingcompany.com.

**Dates.** All dates are worked out in **Pacific time** by one helper, so an evening invoice never lands on tomorrow.

**Why this shape:**
- **One app, one database, one email service:** the fewest moving parts that still deliver a real email on camera.
- **Headless Chrome:** the only way the PDF can't drift from the printed page.

## The Core Journey Through the System
PRD ref: `prd.md > The Core Journey`.

1. **PIN.**
   - She types the PIN, which goes to `POST /api/session`.
   - The server compares it to `APP_PIN` and sets a signed, httpOnly cookie that's valid for 30 days.
   - From then on, the PIN check (`proxy.ts`) lets her through to every page and API route.
2. **Count.**
   - The Count page reads the cafe list, that cafe's standing products, and the latest count per product from the database.
   - She enters numbers and taps Save, which sends `POST /api/counts` with only the entered rows.
   - The server adds one count record per row, dated today in Pacific time.
   - The page refreshes its grey "last counted" lines.
3. **Deliver.**
   - The page loads the cafe's standing list, with prices from `products` and the grey latest counts. Counts are shown only and never copied into quantities.
   - The date defaults to `todayPacific()`, and the number defaults to `suggestNumber(code, date)`.
   - She types quantities, and totals calculate in cents in the browser.
   - Create invoice sends `POST /api/invoices` with the cafe, date, number and lines.
   - The server checks the number is unique and that every line is valid, then saves the invoice and copies the cafe details and lines onto it in one transaction.
   - The browser goes to `/invoices/[id]`.
4. **Invoice.**
   - The page renders `<InvoiceDocument>` from the saved copy.
   - **Print** calls `window.print()`. Print CSS hides the app chrome, so only the document prints.
   - **Download PDF** goes to `GET /api/invoices/[id]/pdf`. It checks the PIN session, mints a 60-second token, and has headless Chrome open `/print/invoice/[id]?t=…` and save a Letter PDF.
   - **Email** opens the confirm sheet. Send calls `POST /api/invoices/[id]/email` with `{to}`. The server renders the same PDF, calls Resend, and records the result:
     - **success:** `email_sent_at` and `email_message_id` are set
     - **failure:** `email_last_failed_at` is set
   - Either way, the server logs one line.
5. **Ledger.**
   - The page reads invoices with totals summed from their lines, works out the due date and overdue days from `todayPacific()`, and calculates the three stats, leaving out voided invoices.
   - Mark paid sends `POST /api/invoices/[id]/payment` with `{paidOn, reference}`. Mark unpaid sends `DELETE` to the same route.
   - Void sends `POST /api/invoices/[id]/void`.

**Count and invoices never touch each other's records** (`scope.md > The Core Loop`). Deliver only reads the latest counts to show them in grey.

## Stack

| Piece | Choice | Why | Docs |
|---|---|---|---|
| Framework | **Next.js** (current stable, App Router) with TypeScript | The learner's established stack | https://nextjs.org/docs |
| Hosting | **Vercel** (Hobby for the hackathon) | Established; one-click deploys | https://vercel.com/docs |
| Database | **Neon Postgres**, using the `@neondatabase/serverless` driver | Established; works from serverless functions | https://neon.com/docs |
| Data access | **Drizzle ORM** plus `drizzle-kit` migrations *(agent recommendation)* | Small and typed, with the schema as code in one file per table and no hidden runtime. Tradeoff: one more library to learn versus raw SQL. | https://orm.drizzle.team/docs/overview |
| PDF | **`puppeteer-core`** plus a serverless Chromium build (`@sparticuz/chromium` or the current equivalent) | **Learner decision:** one layout for screen, print and PDF | https://pptr.dev · https://github.com/Sparticuz/chromium |
| Email | **Resend** Node SDK | Established | https://resend.com/docs/send-with-nodejs |
| Fonts | `next/font/google`: Bodoni Moda, EB Garamond, Space Grotesk, Limelight | Self-hosted at build time, so headless Chrome loads them from the same site | https://nextjs.org/docs/app/getting-started/fonts |
| Styling | **CSS Modules** plus one global token sheet *(agent recommendation)* | Print CSS and exact layout are easier to control without utility-class indirection. Tradeoff: more CSS by hand than Tailwind. | https://nextjs.org/docs/app/getting-started/css |
| Tests | **Vitest** for pure helpers; **Playwright** for one judge-path smoke test *(agent recommendation)* | The learner already uses Playwright | https://vitest.dev · https://playwright.dev |

**Not looked up, so verify early:**
- **Current versions.** Check the current versions of Next.js, the serverless Chromium package and Drizzle. Next.js 16 may rename `middleware.ts` to `proxy.ts`; use whichever the installed version expects.
- **Vercel Hobby limits.** Check the function size and duration limits during Spike 1.
- **Hobby terms.** The Hobby plan may forbid commercial use. Revisit at Block 8.

## Where It Runs and How Someone Tries It

**Local:**
- Node (the current LTS that Vercel supports) and a Neon database. Local dev uses the Neon `dev` branch; production uses `main` (set up in `5-build`, after test invoices landed in production). Schema changes are migrated to both.
- `cp .env.example .env.local` and fill in the values.
- `npm install`
- `npm run db:migrate`
- `npm run db:seed`
- `npm run dev`
- Open http://localhost:3000.

**Environment variables** (all in `.env.example` without values; never committed):

| Name | Purpose |
|---|---|
| `DATABASE_URL` | Neon connection string |
| `APP_PIN` | the six-digit PIN |
| `SESSION_SECRET` | signs the 30-day PIN cookie |
| `PRINT_TOKEN_SECRET` | signs the 60-second print tokens |
| `RESEND_API_KEY` | Resend |
| `EMAIL_FROM` | `onboarding@resend.dev` (Resend's onboarding sender, which only delivers to the account owner) until the domain verifies; then `invoices@lacondesabakingcompany.com`. Never hardcoded |
| `EMAIL_REPLY_TO` | Eileen's Gmail |
| `SEED_BILLING_EMAIL` | seed only: the test inbox every mock cafe with an email bills to (Alma stays without one). Local only, never committed |
| `APP_URL` | the app's own public URL, which headless Chrome loads |
| `BUSINESS_CHEF_LINE` | footer signature line ("Chef …"). Placeholder "Chef Example Name" except in production |
| `BUSINESS_ADDRESS_LINES` | invoice footer address. Placeholder in the repo and the mock deploy ("619 Example Street…"); Eileen's real kitchen address only in production env |
| `BUSINESS_PHONE` | footer phone. Placeholder 555 number except in production |
| `BUSINESS_EMAIL` | footer email. `hello@example.com` except in production |

**Deployed (learner's choice):**
- Production on Vercel, connected to the public GitHub repo, with the env vars set in the Vercel dashboard.
- Production is the judge URL.
- Headless Chrome loads `APP_URL`, which must be the production domain. Vercel Deployment Protection on preview URLs would block it.

**Demo video:** run the judge path (`prd.md > The Core Journey`) on the production URL.
1. Count for Corazon Cocina
2. Deliver
3. Invoice: Print, then Email to the learner's inbox
4. Ledger

Then show the email arriving and the matching Resend message ID in Vercel's function logs.

**Submission:** a short demo video and a public GitHub repository are both required. The deployed URL is an addition, not a substitute.

## Look and Feel
Carried forward from `prd.md > Look and Feel` and `design/DESIGN.md`.

**Tokens** (`styles/tokens.css`), as CSS custom properties:

| Token | Value | Use |
|---|---|---|
| `--ink` | `#111111` | text, rules, primary fills |
| `--ink-muted` | `#555555` | grey reference lines, labels, paid and void rows |
| `--paper` | `#FFFFFF` | page background |
| `--blush` | `#EFE6E1` | contact panel, sheets, overdue accent |
| `--rule` | `#222222` | the color of the 1px dotted hairline rules |

**Shape:** radius 0 and no shadows anywhere.

**Spacing:**
- 1rem margins on mobile, 2.5rem on desktop
- rows at least 44px tall
- touch targets at least 48px, including steppers and primary buttons

**App type:**
- **Bodoni Moda:** headings
- **EB Garamond:** body text and product names
- **Space Grotesk:** labels and column headers, in all-caps with 0.14em tracking

**Invoice type** (`components/invoice/`):
- **INVOICE:** Limelight.
- **Body:** `"Times New Roman", Tinos, "TeX Gyre Termes", Times, serif`. Tinos (self-hosted with `next/font`) is metric-compatible with Times New Roman. Serverless Chromium has no system fonts, so the PDF renders in Tinos, and its lines break exactly where Eileen's Windows print does.
- **Images, not text:** the wordmark, the footer block title, and the DESCRIPTION / QTY / PRICE / TOTAL headers are PNGs in `public/invoice/`, exported from Canva and trimmed to their ink. DK Otago never enters the repo.
- **Layout unit:** every element sits at its PDF-point coordinates from Eileen's form (612 × 792 Letter), scaled from the page width (`--pt`), so screen, print and PDF share one coordinate system.
- **Rule:** the invoice uses only its own fonts and never the app fonts.

**Controls:**
- **Primary buttons:** ink fill with white label caps.
- **Secondary buttons:** a 1px ink outline that inverts on hover.
- **Inline fields:** underline only.
- **Stepper:** − / number / +, framed in hairlines.

**Copy:**
- Messages are one quiet serif line ("That's not it.", "Saved", "Couldn't send. The invoice is saved. Try again or print it.").
- No toasts with icons, no colored badges, no red banners.

**Layout:**
- Count and Ledger are a single column, built for the phone first.
- Deliver and Invoice are built for the laptop, with the invoice at Letter proportions, and stack on a phone.
- The bottom nav shows four tabs on all screens except PIN and print.

**Print CSS** (`styles/print.css`):
- `@page { size: Letter; margin: … }`, tuned to the Canva reference.
- The nav, buttons, sheets and status line are hidden.
- Only `<InvoiceDocument>` prints.

## Components

### PIN Gate
- **What it does:** shows the PIN screen at `app/pin/page.tsx`, and `POST /api/session` checks the PIN in constant time.
- **On success:** sets the `cuenta_session` cookie, an HMAC-signed `{exp}` that's httpOnly, Secure, SameSite=Lax and lasts 30 days.
- **On failure:** returns 401, and the page shows "That's not it."
- **Attempt limiting (`lib/pin-limit.ts`, table `pin_attempts`):** every wrong PIN adds a `fail` row with the client IP. When an IP reaches 5 fails within 15 minutes, a `lock` row for that IP is added; at 20 fails from anywhere, a global `lock` row (IP null) is added. Any lock row younger than 15 minutes for the caller's IP, or a global one, makes `POST /api/session` return 429 "Too many tries. Wait 15 minutes." before the PIN is even compared. Attempts during a lock aren't counted, so they don't extend it. The IP comes from `x-forwarded-for`, which Vercel sets.
- **Logging:** each failure logs `{route, outcome, ip, ts}`, never the digits.
- **The PIN check (`proxy.ts`):** requires a valid session for everything except `/pin`, `/api/session`, `/print/*`, `/health` and static assets. Pages redirect to `/pin`; API routes return 401.
- PRD ref: `prd.md > PIN Gate`.

### Count Screen
- **What it does:** the page at `app/(app)/count/page.tsx` loads the cafes and the last cafe counted, which is kept in a long-lived cookie `cuenta_last_count_cafe`. The client component `CountForm` holds the stepper values, starting blank.
- **Save:**
  - disabled when every row is blank
  - `POST /api/counts {customerId, entries:[{productId, quantity}]}` saves only the entered rows
  - after saving, it refreshes the page data, clears the steppers, and shows "Saved" for 2 seconds
- **Unsaved-changes prompt:** shown when switching cafes, and when leaving by the bottom nav. The nav checks a shared "dirty" flag.
- **Past counts:** a "Past counts" link under the picker opens `app/(app)/count/past/page.tsx?cafe=`. It reads every count row for that cafe through `lib/queries/counts.ts`, groups them by `counted_on` (newest first, then by standing-list position), and renders them read-only. Added in `5-build`, built in slice 8.
- PRD ref: `prd.md > Count`.

### Deliver Screen (New and Edit)
- **What it does:** `app/(app)/deliver/page.tsx` for a new delivery, and `app/(app)/invoices/[id]/edit/page.tsx` for Edit. Both render the client component `DeliveryForm`, so there's one form for both.
- **Lines:**
  - one per standing product, with name, editable unit price, blank quantity, line total and grey latest count
  - special order lines with a description, unit price and quantity
- **Calculations:**
  - totals use `lib/money.ts`
  - the number suggestion uses `lib/invoice-number.ts`
  - a `numberTouched` flag stops the suggestion following the date or cafe once she's typed her own
- **Saving:**
  - **Create:** `POST /api/invoices`
  - **Edit:** `PUT /api/invoices/[id]`
  - **Duplicate number:** the server returns `409 {usedOn, cafeName}`, and the form shows "Already used on Oct 3 for Corazon SB"
  - **Create invoice:** disabled until at least one line has a quantity above 0
- **Edit loads the saved copy** (prices and descriptions) and never the current products.
- **Cafe switch on Edit:** included only if the form handles it without a separate path. Otherwise the cafe picker is locked on Edit (`prd.md > Open Questions`).
- PRD ref: `prd.md > Deliver (New Delivery and Edit)`.

### Invoice Document
- **What it does:** `components/invoice/InvoiceDocument.tsx` is a pure presentational component that takes an invoice snapshot and renders Eileen's Canva form.
- **Used by:**
  - the Invoice screen
  - the print route
  - nothing else
- Its CSS module plus `styles/print.css` are the **only** invoice-shaped styles in the codebase.
- Lines with a quantity above 0 render in their saved order.
- The logo renders when `cafeLogoPath` is set; otherwise its space stays empty.
- **Footer:** the business identity comes from `lib/business.ts`, which reads the `BUSINESS_*` env vars and never source constants.
- **One-page capacity:**
  - `lib/invoice-capacity.ts` holds `MAX_LINES_ONE_PAGE`, measured in Block 3 at **8**: the form's 36pt spacing for up to 5 lines, tightening evenly to 22pt.
  - Above it, the Invoice screen shows the quiet line "Too many lines for one page", and the PDF and email routes return 422 with that message.
  - It never silently overflows to a second page.
- PRD ref: `prd.md > Invoice`, `prd.md > Look and Feel`.

### Invoice Screen
- **What it does:** `app/(app)/invoices/[id]/page.tsx` shows the `<InvoiceDocument>`, the grey status line, and the actions: Print, Download PDF, Email invoice / Resend, Edit, Void.
- **Status line** (`lib/email-status.ts`):
  - "Sent Oct 18 9:14am" when a send has succeeded
  - "Sent Oct 18 9:14am · resend failed" when the latest attempt failed after an earlier success
  - "Not sent" only when no send has ever succeeded and an attempt failed
  - nothing when no send was ever attempted
  - The first email really reached the cafe, so the stamp never lies.
- **Void:** one confirm, then `POST /api/invoices/[id]/void`.
- **Navigation:** the bottom nav stays; a "← Back to Ledger" link sits at the top.
- **Download PDF:** the route answers with `Content-Disposition: attachment`. The button fetches it in the background and saves the file, so the tab never navigates to the PDF, and a failure can still show the quiet one-line message.
- **Sheets (`components/ui/Sheet.tsx`):** an open sheet pushes one history entry (marked `cuentaSheet`), so the phone's back button closes it. Cancel, a tap outside, Discard or a successful send close it through `useSheetClose()`, which steps back off that entry before running the action, so a follow-up navigation is never undone.
- PRD ref: `prd.md > Invoice`.

### Print Route
- **What it does:** `app/print/invoice/[id]/page.tsx` renders `<InvoiceDocument>` only, with print CSS applied and no nav or buttons.
- **Token check:** checks `?t=` with `lib/print-token.ts`. The token is an HMAC of `(invoiceId, exp)` with `PRINT_TOKEN_SECRET`, valid 60 seconds and scoped to that one invoice ID.
- **Bad token:** missing, expired, or for a different invoice returns `notFound()` (404).
- **What it never does:** read the PIN cookie, or log the token.
- **Indexing:** `X-Robots-Tag: noindex` plus a `robots` meta tag.
- **Who uses it:** only headless Chrome. Eileen's Print button never uses it.
- PRD ref: `prd.md > Email Invoice`, `prd.md > Invoice`.

### PDF Renderer
- **What it does:** `lib/pdf/render-invoice-pdf.ts` mints a token, launches Chromium with `lib/pdf/browser.ts`, and opens `${APP_URL}/print/invoice/[id]?t=…`.
- It waits for `load`, `document.fonts.ready` and every image to decode, then runs `page.pdf({ format: 'Letter', printBackground: true, preferCSSPageSize: true })` and returns a Buffer.
- **Used by:**
  - `GET /api/invoices/[id]/pdf`, which serves `Invoice-[number].pdf` as an attachment for Download PDF
  - the email route
- `maxDuration` is 60 seconds on both routes; Spike 1 measured a cold render at about 6 seconds server-side.
- **Bundling:** `serverExternalPackages` covers `@sparticuz/chromium` and `puppeteer-core`, and `outputFileTracingIncludes` adds the Chromium `bin/` to the PDF and email routes. Route keys are globs, so the route is written `/api/invoices/*/pdf`, not `[id]`.
- **Fallback, declared now:** if Spike 1 fails after 60 minutes, `browser.ts` is swapped for a hosted HTML-to-PDF endpoint, such as Browserless's free tier, that renders the *same* print URL. There is never a second layout.
- PRD ref: `prd.md > Invoice`, `prd.md > Email Invoice`.

### Email Sender
- **What it does:** `POST /api/invoices/[id]/email {to}` validates `to`.
- **Build:**
  - `lib/email/invoice-email.ts` fills in the template: the cafe name, the total, and the due date from `lib/dates.ts`
  - the subject is `La Condesa Baking Company Invoice ${number}`
- **Send:** the server renders the PDF, then `lib/email/send.ts` calls Resend `emails.send({ from, to, replyTo, subject, text, attachments: [{ filename: 'Invoice-${number}.pdf', content: pdfBuffer }] })`.
- **Success:** sets `email_sent_at` and `email_message_id`, and clears `email_last_failed_at`.
- **Any failure** (PDF, network or Resend): sets `email_last_failed_at` and returns 502. It never clears an earlier `email_sent_at`. The sheet stays open with the failure line and Retry.
- **Ordering:** the invoice is always saved before this route can be called.
- **Confirm sheet:** the client component `EmailSheet`.
  - **To:** pre-filled from the snapshot `cafe_email`, and editable for this send only.
  - **Missing email:** shows "No email on file for [cafe]" and disables Send.
  - **Preview:** shows the subject, the body preview (from `GET /api/invoices/[id]/email-preview`) and the attachment line.
- PRD ref: `prd.md > Email Invoice`.

### Ledger Screen
- **What it does:** `app/(app)/ledger/page.tsx` reads invoices through `lib/queries/ledger.ts`, which returns rows with `totalCents`, `dueOn`, `overdueDays` and a status of unpaid, paid or void. `lib/ledger-stats.ts` calculates Open, Outstanding and This month.
- **Filters:** a `?cafe=` query parameter.
- **Sort:** `invoice_date desc`, then `created_at desc`.
- **Mark paid sheet** (client component `PaymentSheet`):
  - **Mark paid:** `POST /api/invoices/[id]/payment {paidOn, reference}`
  - **Mark unpaid:** one confirm, then `DELETE /api/invoices/[id]/payment`
- **Void rows:** no payment action.
- **Envelope mark:** shown when `email_sent_at` is set.
- PRD ref: `prd.md > Ledger`.

### Customers Screen
- **What it does:** `app/(app)/customers/page.tsx` shows each cafe's details, logo and standing list with prices, read-only.
- PRD ref: `prd.md > Customers (read-only)`.

### Logging and Health
- **Logger:** `lib/log.ts` writes one JSON line per event: `{ts, route, outcome, ms, invoiceNumber?, cafe?, messageId?, error?}`.
- **Route wrapper:** `lib/api/with-route.ts` wraps every API route handler to time it, log it, and turn thrown errors into a JSON `{error}` response with the right status code.
- **Never logged:** emails, addresses, phones, invoice bodies, the PIN, tokens, or env values.
- **No indexing:** `next.config.ts` sends `X-Robots-Tag: noindex, nofollow` on every response, static files included (the proxy skips those), and `public/robots.txt` disallows everything.
- **Health:** `app/health/route.ts` runs `select 1` and returns `{ok, db: 'up'|'down', version}`. The version comes from `VERCEL_GIT_COMMIT_SHA` or `package.json`.
- **Client:** `lib/api/client.ts` wraps `fetch`. On failure, it logs `console.error(route, err)` and returns a one-line message for the UI.
- PRD ref: `prd.md > Operational Requirements`.

### Dates and Money Helpers
- **Dates:** `lib/dates.ts` has `TZ = 'America/Los_Angeles'` and these helpers:
  - `todayPacific()` returns a `YYYY-MM-DD` string
  - `addDays(date, 30)`
  - `daysBetween`
  - `formatShort` ("Oct 9")
  - `formatStamp` ("Oct 18 9:14am", Pacific)
- **No code reads the browser's clock** for a calendar date. The Deliver page gets its default date from the server.
- **Money:** `lib/money.ts` handles integer cents throughout, with `formatUSD(cents)` and `parseUSD(input)` to cents. There's no floating-point money anywhere.
- **Invoice number:** `lib/invoice-number.ts` has `suggestNumber(code, ymd)`, which turns `1` and `2026-10-17` into `110172026`.
- PRD ref: `prd.md > Deliver (New Delivery and Edit)`, `prd.md > Ledger`.

## Data Model
Postgres on Neon, defined in Drizzle, with one schema file per table in `db/schema/`. Money is `integer` cents. Calendar dates use Postgres `date`. Moments use `timestamptz`.

**`customers`**: the cafes.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid pk | |
| `code` | int | unique; 1–4 |
| `name` | text | |
| `phone` | text | |
| `address_lines` | text[] | |
| `billing_email` | text | nullable |
| `logo_path` | text | nullable. Mock seed: `/logos/placeholder.png` (a generated circle reading "LOGO", no trademark) for the Corazon locations. The real Corazon heart is never in git; it's added to the production seed at Handoff |
| `sort` | int | |

**`products`**: the products (five now, more after the hackathon).

| Column | Type | Notes |
|---|---|---|
| `id` | uuid pk | |
| `slug` | text | unique, stable, e.g. `pixie-flan` |
| `name` | text | |
| `price_cents` | int | |
| `active` | bool | |

**Products are open-ended:**
- **Referenced by slug, never by position.** The seed and standing lists use slugs; foreign keys use the ID.
- **Adding a product is one seed entry** plus its standing-list memberships.
- **No screen, query or test hardcodes the product count.**
- **Count and Deliver scroll** for any number of rows.
- **Block 1 check:** add a sixth product to the seed, reseed, and it appears on Count, Deliver and Customers with no code change.

**`standing_items`**: each cafe's standing list.

| Column | Type | Notes |
|---|---|---|
| `customer_id` | fk | primary key with `product_id` |
| `product_id` | fk | |
| `position` | int | |

**`counts`**: one row per counted product, never updated.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid pk | |
| `customer_id` | fk | |
| `product_id` | fk | |
| `quantity` | int | ≥ 0 |
| `counted_on` | date | Pacific |
| `created_at` | timestamptz | |

The "last counted" line is the newest row per `(customer, product)`. Rows are only ever added, so untouched products keep their previous count.

**`invoices`**: one row per invoice, with the cafe details copied on.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid pk | |
| `number` | text | unique |
| `customer_id` | fk | used for filters |
| `invoice_date` | date | also the delivery date |
| `cafe_name`, `cafe_phone`, `cafe_address_lines`, `cafe_email`, `cafe_logo_path` | | the **snapshot** |
| `voided_at` | timestamptz | nullable |
| `paid_on` | date | nullable |
| `paid_reference` | text | nullable |
| `email_sent_at` | timestamptz | nullable; the latest **successful** send |
| `email_message_id` | text | nullable; from that send |
| `email_last_failed_at` | timestamptz | nullable; cleared by a later success |
| `created_at`, `updated_at` | timestamptz | |

Due date and total are **calculated, not stored**: the due date is `invoice_date + 30`, and the total is the sum of the lines.

**`pin_attempts`**: wrong PINs and the lockouts they trigger (added in `5-build`).

| Column | Type | Notes |
|---|---|---|
| `id` | uuid pk | |
| `kind` | text | `fail` or `lock` |
| `ip` | text | nullable; null on a global lock |
| `at` | timestamptz | |

**`invoice_lines`**: the lines on each invoice.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid pk | |
| `invoice_id` | fk | cascade on delete is never used, since there's no hard delete |
| `product_id` | fk | nullable; null means a special order |
| `description` | text | |
| `unit_price_cents` | int | ≥ 0 |
| `quantity` | int | ≥ 1 |
| `position` | int | |

Only lines with a quantity of at least 1 are saved. Blank standing rows aren't stored, so an invoice holds only what was delivered.

**Where each piece of data lives, how it changes, and what happens when she comes back:**

| Data | Lives in | Updated by | When she returns |
|---|---|---|---|
| PIN session | `cuenta_session` cookie | the PIN form | Still valid for 30 days, then the PIN screen |
| Last cafe counted | `cuenta_last_count_cafe` cookie | Count Save | Preselected |
| Unsaved stepper and form entries | browser memory only | typing | Lost when she leaves, after the prompt |
| Counts | `counts` | Count Save (adds rows) | Newest per product shown in grey |
| Invoices and lines | `invoices`, `invoice_lines` | Create, Edit, Void, Payment, Email | Exactly as saved |
| Products, cafes, standing lists | seed tables | seed script only (Handoff adds screens) | Unchanged |

**Number uniqueness** is enforced by the unique index. The API catches the conflict and looks up the existing invoice to build the "Already used on [date] for [cafe]" message.

## File Structure

Every code file starts with a one-sentence `// Job: …` comment. A file that needs a second sentence gets split. Files over about 200 lines get flagged at each checkpoint.

```
cuenta/
├── app/
│   ├── layout.tsx                      # Job: root HTML shell, fonts, global styles
│   ├── pin/page.tsx                    # Job: PIN entry screen
│   ├── (app)/                          # PIN-protected app with bottom nav
│   │   ├── layout.tsx                  # Job: app frame with the bottom nav
│   │   ├── page.tsx                    # Job: redirect / to /count
│   │   ├── count/page.tsx              # Job: load data for the Count screen
│   │   ├── count/past/page.tsx         # Job: show one cafe's past counts, newest day first
│   │   ├── deliver/page.tsx            # Job: load data for a new delivery
│   │   ├── invoices/[id]/page.tsx      # Job: show one invoice and its actions
│   │   ├── invoices/[id]/edit/page.tsx # Job: load an invoice snapshot into the delivery form
│   │   ├── ledger/page.tsx             # Job: load ledger rows and stats
│   │   └── customers/page.tsx          # Job: show cafes read-only
│   ├── print/invoice/[id]/page.tsx     # Job: token-gated, chrome-free invoice for the PDF renderer
│   ├── health/route.ts                 # Job: report DB status and app version
│   └── api/
│       ├── session/route.ts            # Job: check the PIN and set the session cookie
│       ├── counts/route.ts             # Job: save entered count rows
│       ├── invoices/route.ts           # Job: create an invoice snapshot
│       └── invoices/[id]/
│           ├── route.ts                # Job: update an invoice snapshot
│           ├── void/route.ts           # Job: void an invoice
│           ├── payment/route.ts        # Job: mark paid or unpaid
│           ├── pdf/route.ts            # Job: return the invoice PDF for download
│           ├── email/route.ts          # Job: render the PDF and send it via Resend
│           └── email-preview/route.ts  # Job: return the filled email text for the confirm sheet
├── proxy.ts                            # Job: require a PIN session (middleware.ts if the Next.js version expects it)
├── components/
│   ├── nav/BottomNav.tsx               # Job: the four-tab nav with the unsaved-changes guard
│   ├── count/CountForm.tsx             # Job: steppers and Save for one cafe
│   ├── count/Stepper.tsx               # Job: − / number / + input
│   ├── deliver/DeliveryForm.tsx        # Job: build or edit an invoice's lines and header
│   ├── deliver/LineRow.tsx             # Job: one editable invoice line
│   ├── invoice/InvoiceDocument.tsx     # Job: render the Canva-matched invoice from a snapshot
│   ├── invoice/InvoiceDocument.module.css
│   ├── invoice/InvoiceActions.tsx      # Job: Print, PDF, Email, Edit, Void buttons
│   ├── invoice/EmailSheet.tsx          # Job: email confirm sheet with send/fail states
│   ├── ledger/LedgerRow.tsx            # Job: one ledger row in its state
│   ├── ledger/StatRow.tsx              # Job: Open / Outstanding / This month
│   ├── ledger/PaymentSheet.tsx         # Job: mark paid / unpaid sheet
│   └── ui/                             # Job (each): one primitive: Button, Sheet, Confirm, CafePicker, QuietMessage
├── lib/
│   ├── dates.ts                        # Job: Pacific calendar dates and display formats
│   ├── money.ts                        # Job: integer-cents math and USD formatting
│   ├── invoice-number.ts               # Job: suggest an invoice number from code and date
│   ├── invoice-capacity.ts             # Job: the one-page line limit and its check
│   ├── email-status.ts                 # Job: derive the Sent / resend failed / Not sent line
│   ├── business.ts                     # Job: read Eileen's footer identity from env
│   ├── session.ts                      # Job: sign and verify the PIN session cookie
│   ├── pin-limit.ts                    # Job: lock the PIN route after too many wrong tries
│   ├── client-ip.ts                    # Job: find the caller's IP from Vercel's headers
│   ├── last-count-cafe.ts              # Job: name the last-cafe-counted cookie
│   ├── invoice-input.ts                # Job: validate a submitted delivery
│   ├── print-token.ts                  # Job: mint and verify 60-second per-invoice print tokens
│   ├── log.ts                          # Job: write one structured JSON log line
│   ├── ledger-stats.ts                 # Job: compute Open, Outstanding, This month
│   ├── api/with-route.ts               # Job: time, log and error-wrap an API handler
│   ├── api/client.ts                   # Job: client fetch wrapper with one-line errors
│   ├── pdf/browser.ts                  # Job: launch serverless Chromium
│   ├── pdf/render-invoice-pdf.ts       # Job: turn the print route into a Letter PDF buffer
│   ├── email/invoice-email.ts          # Job: the invoice email template (edit copy here until Handoff)
│   ├── email/send.ts                   # Job: send one email with an attachment via Resend
│   └── queries/                        # Job (each): one read or write against the DB
│       ├── customers.ts  products.ts  counts.ts  invoices.ts  ledger.ts
├── db/
│   ├── client.ts                       # Job: create the Drizzle client for Neon
│   ├── schema/                         # Job (each): one table definition
│   │   ├── customers.ts  products.ts  standing-items.ts  counts.ts  invoices.ts  invoice-lines.ts  pin-attempts.ts
│   └── migrations/                     # generated by drizzle-kit
├── seed/
│   ├── mock-data.ts                    # Job: mock cafes, real products and prices, fake contacts
│   └── seed.ts                         # Job: load mock data into the DB
├── styles/
│   ├── tokens.css                      # Job: color, type and spacing tokens
│   ├── globals.css                     # Job: base element styles
│   └── print.css                       # Job: @page and hide app chrome when printing
├── public/
│   ├── invoice/                        # Canva-exported PNGs: wordmark, footer title, column headers
│   └── logos/placeholder.png           # generated neutral logo for mock data (real logo never in git)
├── tests/
│   ├── unit/                           # Vitest: dates, money, invoice-number, ledger-stats, print-token
│   └── e2e/judge-path.spec.ts          # Playwright: the four-step judge path
├── design/                             # Stitch references; canva-invoice-reference.png is gitignored (local only)
├── devpost/                            # Devpost learning workspace
├── .env.example
├── drizzle.config.ts
├── next.config.ts
├── package.json
└── README.md
```

## External Services and Dependencies

**Neon Postgres** (https://neon.com/docs)
- **Calls:** SQL through Drizzle using `@neondatabase/serverless`.
- **Key:** `DATABASE_URL`.
- **Cost and limits:** the free tier is enough. Expect a cold start of a few seconds after inactivity; `/health` makes it visible.
- **Verify:** current free-tier limits.

**Resend** (https://resend.com/docs/api-reference/emails/send-email)
- **Call:** `resend.emails.send({ from, to, replyTo, subject, text, attachments: [{ filename, content }] })` returns `{ data: { id }, error }`.
- **Key:** `RESEND_API_KEY`.
- **Domain:** `lacondesabakingcompany.com` must be verified with the DKIM/SPF (and MX/return-path) records Resend provides, added at Eileen's registrar. **Merge** these into any existing SPF record; don't replace it.
- **Timing:** not a gate on the email build (learner decision in `5-build`). Until the domain verifies, `EMAIL_FROM` is Resend's onboarding sender, which only delivers to the account owner's inbox, the same as the Block 5 check. Once it verifies, setting `EMAIL_FROM`/`EMAIL_REPLY_TO` in Vercel and redeploying makes the switch, with no code change (checklist slice 8 polish, before submission). The sender is never hardcoded.
- **Cost:** the free tier is enough. **Verify** the current daily and monthly limits.

**Serverless Chromium plus puppeteer-core**
- **Usage:** `browser.newPage()` → `page.goto(printUrl, { waitUntil: 'load' })` → `page.evaluate(...)` awaiting `document.fonts.ready` and every image's `decode()` → `page.pdf({...})`.
- **Spike 1 pass criteria (learner-written):**
  - **Longevity:** last release within six months, and works on the current Vercel Node runtime.
  - **Size:** deploys on Hobby within the function size limit.
  - **Output:** a one-page Letter PDF in under 10 seconds cold and under 3 seconds warm.
  - **Fonts and images:** Limelight and the wordmark PNGs render correctly.
  - **Duration:** `maxDuration` is set explicitly and covers a cold start.
- **Fallback:** a hosted HTML-to-PDF endpoint on a free tier rendering the same URL.

**Vercel** (https://vercel.com/docs/functions)
- **Use:** hosting, function logs as the log viewer, and env vars.
- **Verify:** Hobby's function size and duration limits, and its commercial-use terms (Block 8).

**Google Fonts through `next/font`:** self-hosted at build time, with no runtime calls.

## Important Failure Modes
- **Chromium cold start or bundle too large on Vercel:** Spike 1 decides. If it fails, use the hosted renderer on the same print URL. In the app, Download PDF and Email show their one-line failure, and **Print always works** because it's the browser's own.
- **Resend send fails** (domain not verified, network, bad address): the invoice is already saved. `email_last_failed_at` is set. The invoice shows "Not sent", or "Sent … · resend failed" if an earlier send succeeded, and the sheet shows "Couldn't send. The invoice is saved. Try again or print it." with Retry. It never shows "Sent".
- **Neon cold start or outage:** pages show a one-line error and never a blank screen. `/health` tells "db down" apart from slow. On the demo day, open `/health` first to warm the database.
- **Duplicate invoice number in a race:** the unique index is the final guard, and returns the same "Already used on…" message.
- **Wrong date late in the day:** prevented by `todayPacific()`. The Block 1 check covers it.

## What Was Simplified and Why
- **One PIN in an env var and a signed cookie** instead of accounts. Eileen is the only user; multi-user login is Later.
- **Seeded products, cafes and standing lists, with a read-only Customers screen,** instead of admin screens. It keeps admin UI off the judge path. Block 8 adds editing.
- **The email template lives in code** (`lib/email/invoice-email.ts`) instead of an editor. Same reason; Block 8.
- **Due date and totals are calculated, not stored.** One source of truth and nothing to get out of sync. The cost is a sum per Ledger row, which is trivial at this size.
- **The email status keeps only the latest success and the latest failure** instead of a full send history. The history line was deferred to Block 8 in the PRD.
- **No background jobs.** "Overdue" is calculated when the Ledger loads.

## Decisions and Open Issues

**Learner decisions (this spec):**
- **PDF:**
  - headless Chrome, with one `<InvoiceDocument>` and one stylesheet for screen, print and PDF
  - Spike 1 with written pass criteria and a 60-minute timebox
  - a hosted renderer as the fallback, and never a second layout
- **Spikes:**
  - only one spike (PDF)
  - the Neon check folded into Block 1's `/health`
  - Resend DNS started on day 1 as a step
- **Print route:**
  - `/print/invoice/[id]?t=`, with an HMAC token of (id, exp) that's valid 60 seconds and scoped to one invoice
  - minted only by the PDF and email routes after the PIN check
  - a bad token returns 404, and the route is noindex and never logged
  - Eileen's Print button prints the current screen instead
- **Time zone:**
  - Pacific, fixed in config
  - plain dates computed by one helper, and timestamps shown in Pacific
  - nothing reads the browser's clock for a date
  - **Block 1 check:** an invoice created at 5:30pm Pacific gets today's date and the matching number
- **Invoices are snapshots:**
  - lines save their own description, price and quantity
  - the cafe details are copied onto the invoice
  - Edit shows the saved copy
  - per-line prices are editable and never touch the product
  - price changes only go forward: a seed change and redeploy now, a Products screen at Handoff
- **Special order line,** with the validation above, in Block 4 if there's room, otherwise Block 6, and before Handoff either way.
- **Build rules:** one file, one job; a `Job:` comment on every file; flag files over about 200 lines at each checkpoint.
- **Block 8 list additions:** check Vercel Hobby's commercial-use terms, and Eileen decides on Pro.

**Review decisions (learner):**
- **Drizzle, CSS Modules, Vitest plus Playwright are accepted.** Drizzle gets a longevity check in Block 1: a release in the last six months.
- **Resend status never lies.** An earlier success keeps "Sent [time]", and a later failure adds "resend failed". "Not sent" appears only when no send has ever succeeded.
- **Corazon logo:** not in the public repo. The mock seed uses a generated placeholder; the real logo goes into the production seed at Handoff, from outside git.
- **Eileen's footer details come from env** (`BUSINESS_*`). Placeholders in the repo and the mock deploy; real values only in production env. Handoff is a config step.
- **`design/canva-invoice-reference.png` is gitignored:** kept on disk for the Block 3 side-by-side and never committed. The Stitch mockups (HTML and PNG) are gitignored too: they turned out to contain real addresses, phones and emails (found in `5-build`). Only `design/DESIGN.md` is committed.
- **Block 6 mock-data audit** explicitly checks: no real logo, no real footer details, the reference PNG untracked, and only mock customer data.
- **Products are open-ended:** slug-referenced, nothing hardcodes the count, the lists scroll, there's a one-page capacity check, and the Block 1 sixth-product check.
- **Block 1 scaffolding gets the time it needs** for the one-file-one-job structure. Files are never merged to save time.
- **Also accepted:** the last cafe counted is kept in a cookie.

**Useful unknown (from the learner's learning goal): "Where does the missing 20% leak: PRD, spec, or checking?"**
- **What this spec showed:** three leaks that no PRD could have caught, because they're about *how*, not *what*:
  - the server's UTC clock shifting dates and invoice numbers
  - the PDF renderer being blocked by the PIN gate
  - linked prices rewriting past invoices
- **The PRD,** meanwhile, caught the *what* leaks: blank versus pre-filled steppers, delivered-only lines, and the logo.
- **How we'll check it in `5-build`:** each block's PASS/FAIL check cites both the PRD heading and the spec heading it implements, so "checking against the plan" means checking against these two addresses.

**Carried from the PRD:**
- **Cafe switch on Edit:** included only if `DeliveryForm` handles it without a separate path; otherwise the picker is locked on Edit. Decided during the build.
