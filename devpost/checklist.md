---
doc: checklist
status: approved
---

# Build Checklist

Build mode: fast

Slice numbers are this checklist's own. Where the plan names a Block, the slice says so: Block 1 is slice 1, Block 3 (invoice fidelity) is slice 3, the Block 6 mock-data audit is in slice 8. Block 8 (Handoff) stays after submission, per `scope.md > Later`, and is not slice 8. Each slice's PASS/FAIL cites both its PRD heading and its spec heading (`spec.md > Decisions and Open Issues`, useful unknown).

**Learner prerequisites (outside the code):**
- **Before slice 1:** the learner sets up Neon and Vercel with their CLIs and puts `DATABASE_URL` in `.env.local`.
- **Before slice 5:** a `RESEND_API_KEY`. The domain DNS is not a gate. Slice 5 sends from Resend's onboarding sender to the learner's own inbox, and slice 8 switches to the verified domain.
- **Before slice 3:** the Canva PNGs (wordmark, footer block title, the DESCRIPTION/QTY/PRICE/TOTAL headers).

## Slices

- [x] **1. Eileen can unlock the app and save a shelf count on her phone**
  Becomes usable: On the deployed URL, the PIN screen lets her in for 30 days. She lands on Count, picks Corazon Cocina, sees each standing product with blank steppers and a grey "last counted Oct 9: 3" (or "not counted yet"), enters two numbers, and saves. Only those two lines update. `/health` reports the database and the version.
  Why now: This sets up everything later slices sit on: the scaffold, Neon, Drizzle and seed data, the PIN gate, the Pacific date helper, logging, the tokens and bottom nav, and a live Vercel deploy. It does that through a real screen instead of plumbing. Deploying now also means Spike 1 (slice 4) can run on real Vercel straight away.
  PRD ref: `prd.md > PIN Gate`, `prd.md > Count`, `prd.md > Operational Requirements`, `prd.md > States and Boundaries`
  Spec ref: `spec.md > Stack`, `spec.md > Where It Runs and How Someone Tries It`, `spec.md > File Structure`, `spec.md > Data Model`, `spec.md > Look and Feel`, `spec.md > Components` (PIN Gate, Count Screen, Logging and Health, Dates and Money Helpers)
  Build: Scaffold Next.js (TypeScript, App Router, CSS Modules) to the spec's file structure, with a `Job:` comment on every file. Use the current Next.js file convention for `proxy.ts`/`middleware.ts`. Add `.env.example`, Drizzle with all six tables (the migration is created once, here), and the mock seed: four cafes, five products by slug, standing lists, the placeholder logo and some older counts. Add `lib/dates.ts`, `lib/money.ts`, `lib/invoice-number.ts`, `lib/session.ts`, `lib/log.ts`, `lib/api/with-route.ts`, `lib/api/client.ts`, `/health`, the PIN screen and `POST /api/session`, the PIN check, the app layout with BottomNav, `tokens.css`/`globals.css` and fonts, plus the Count page, CountForm, Stepper and `POST /api/counts`, the last-cafe cookie, and the unsaved-changes prompt on cafe switch. Then do the Vitest unit tests and the Drizzle longevity check, and deploy to Vercel.
  Verify (mechanical): `npm run build` passes. The Vitest units pass for dates (a 5:30pm Pacific instant gives today's date and `suggestNumber(1,'2026-10-17')` = `110172026`), money and invoice-number. `/health` returns `db:'up'` locally and on Vercel. With no session, a page redirects to `/pin` and an API returns 401. A wrong PIN gives 401 and the right PIN sets the cookie. A count POST adds rows only for the entered products. Adding a sixth seed product and reseeding shows it on Count with no code change, then it gets reverted. Logs show one JSON line per request, with no PIN or env values.
  Learner check: On your phone, open the deployed URL, enter a wrong PIN and then the right one, pick Corazon Cocina, enter two counts, Save. Confirm only those two grey lines change to today, and compare the screen with `design/count_inventory.png`.
  Commit: `Add PIN gate, Count screen, health and deploy`

- [x] **2. Eileen can build a delivery from a cafe's standing list and create an invoice**
  Becomes usable: On Deliver, she picks Corazon Cocina and sees its standing list with prices, blank quantities, and the grey last shelf count beside each line. Totals compute live to the cent. The date defaults to today in Pacific time and `110172026` is suggested, following the date and cafe until she types her own number. A duplicate number is refused with "Already used on …". Create invoice saves a snapshot and opens a plain invoice page that shows the saved lines.
  Why now: This is the first half of the unique kernel: her route, digitized. The invoice snapshot is what every later slice (print, PDF, email, ledger) reads, so its shape has to be right before anything is built on it.
  PRD ref: `prd.md > Deliver (New Delivery and Edit)`, `prd.md > The Core Journey` (step 3)
  Spec ref: `spec.md > Components` (Deliver Screen, Dates and Money Helpers), `spec.md > Data Model` (`invoices`, `invoice_lines`), `spec.md > The Core Journey Through the System` (step 3)
  Build: Add the Deliver page (server-provided default date), DeliveryForm and LineRow with an editable unit price, the `numberTouched` logic, `POST /api/invoices` (validation, one transaction for the snapshot, 409 with `{usedOn, cafeName}` on a duplicate), `lib/queries/invoices.ts`, and a minimal `/invoices/[id]` page listing the saved snapshot.
  Verify (mechanical): `npm run build` and the units pass. A scripted or Playwright run creates an invoice for Corazon Cocina. The DB shows only lines with a quantity of 1 or more, each with its own description and price, plus the cafe snapshot fields. No `counts` row changed. A second POST with the same number returns 409 with the date and cafe. Changing one line's price leaves `products.price_cents` unchanged. Create is disabled with every quantity blank.
  Learner check: On your laptop, open Deliver, pick Corazon Cocina, check the grey shelf counts match what you saved in slice 1 and that no quantity is pre-filled, type quantities, watch the totals, then Create invoice. Try reusing the same number and see it refused.
  Commit: `Add Deliver screen and invoice snapshots`

- [x] **3. The invoice looks exactly like Eileen's Canva form and prints on one Letter page**
  Becomes usable: The Invoice screen shows her Canva form, filled in with the wordmark, Limelight INVOICE, the cafe block (the placeholder logo for the Corazon cafes, an empty space for the others), the number and date, only the delivered lines, the INVOICE TOTAL, and the blush footer with the `BUSINESS_*` placeholders and the Net 30 line. Print opens the browser dialog and prints one Letter page with no app chrome.
  Why now: This is the second half of the kernel and the "oh, that's cool" moment. Fidelity is where your 20% usually leaks, so it gets your eyes before the PDF and email copy this layout.
  PRD ref: `prd.md > Invoice`, `prd.md > Look and Feel` (the printed invoice, Invoice Typography)
  Spec ref: `spec.md > Components` (Invoice Document, Invoice Screen), `spec.md > Look and Feel` (Invoice type, Print CSS)
  Build: Add the Canva PNGs to `public/invoice/`, `InvoiceDocument.tsx` and its CSS module, `styles/print.css`, `lib/business.ts`, `lib/invoice-capacity.ts` (measure `MAX_LINES_ONE_PAGE` against Letter), the Invoice screen with the Print button, and the "Too many lines for one page" line.
  Verify (mechanical): Build passes. A Playwright print-media screenshot at Letter size shows a single page with no nav or buttons. A `page.pdf` page count of 1 at `MAX_LINES_ONE_PAGE` lines. A side-by-side image with the gitignored `design/canva-invoice-reference.png` saved to the scratchpad. The invoice CSS uses no app fonts. `git status` confirms the reference PNG is untracked.
  Learner check: Open the invoice from slice 2, press Print, and save it as a PDF or print it. Lay it next to the Canva reference, and check a Little Heart invoice has an empty logo space. Tell me what doesn't match.
  Commit: `Add Canva-matched invoice document and print`

- [x] **4. Eileen can download the invoice as a PDF (Spike 1)**
  Becomes usable: Download PDF on the Invoice screen saves `Invoice-[number].pdf`, rendered by headless Chrome from the token-gated print route. It's the same layout as Print.
  Why now: This is the project's one critical technical risk. Email depends on it, so it's proven right after the layout it renders, and before email builds on it. It has a 60-minute timebox, then the declared fallback: a hosted renderer on the same print URL.
  PRD ref: `prd.md > Invoice` (Download PDF)
  Spec ref: `spec.md > Components` (Print Route, PDF Renderer), `spec.md > External Services and Dependencies` (Serverless Chromium, Spike 1 pass criteria), `spec.md > Important Failure Modes`
  Build: Add `lib/print-token.ts` (60-second HMAC of id and exp), `app/print/invoice/[id]/page.tsx` (404 on a bad token, noindex, never logs the token), `lib/pdf/browser.ts`, `lib/pdf/render-invoice-pdf.ts`, `GET /api/invoices/[id]/pdf` with an explicit `maxDuration`, the Download PDF button, and a 422 response when the capacity is exceeded.
  Verify (mechanical): Unit tests for the print token: valid, expired, wrong id. On the Vercel deploy: a print URL with no token, an expired token or another invoice's token returns 404. The PDF route without a session returns 401. With a session it returns a one-page Letter PDF. Cold and warm timings are recorded against the criteria (under 10s cold, under 3s warm). Limelight and the PNGs render. The bundle fits Hobby. The package's last release is within six months. The results go under Revisions.
  Learner check: On the deployed app, Download PDF for your test invoice, open it next to your printed copy from slice 3, and confirm they match.
  Commit: `Add token-gated print route and PDF download`

- [x] **5. Eileen can email the invoice with the PDF attached, and the stamp never lies**
  Becomes usable: Email invoice opens the confirm sheet: To pre-filled from the snapshot and editable, the fixed subject, the filled-in body preview, and the attachment line. Send delivers a real email from whatever `EMAIL_FROM` is set to (Resend's onboarding sender until the domain verifies), then "Sent [time]" stamps on the invoice and the button reads Resend. A failure keeps the sheet open with "Couldn't send. The invoice is saved. Try again or print it." and Retry, and never shows "Sent". A cafe with no email blocks Send until she types one.
  Why now: This is the last external dependency and the second half of the "oh, that's cool" moment. The Ledger's envelope mark reads this slice's state. It doesn't wait on DNS: the sender comes from env, so the verified domain is an env change in slice 8, with no code change.
  PRD ref: `prd.md > Email Invoice`
  Spec ref: `spec.md > Components` (Email Sender, Invoice Screen status line), `spec.md > External Services and Dependencies` (Resend)
  Build: Add `lib/email/invoice-email.ts`, `lib/email/send.ts` (From and Reply-To read only from `EMAIL_FROM` / `EMAIL_REPLY_TO`, never hardcoded), `lib/email-status.ts`, `POST /api/invoices/[id]/email`, `GET /api/invoices/[id]/email-preview`, `EmailSheet`, the Sheet primitive, and the status line.
  Verify (mechanical): Units for `email-status` (never sent, success, fail-after-success, fail-only). A forced failure (a bad API key) sets `email_last_failed_at`, returns 502, and leaves an earlier `email_sent_at` untouched. `grep` finds no sender address hardcoded in the code. A real send from the onboarding sender to the learner's inbox on Vercel returns a message ID, and the Vercel log line shows it with no email address in it.
  Learner check: Email the test invoice to your own inbox. Confirm it arrives (from Resend's onboarding sender for now) with Reply-To set to `EMAIL_REPLY_TO` and `Invoice-[number].pdf` attached, and the stamp appears. Then open the sheet for a cafe with no email on file.
  Commit: `Add email confirm sheet and Resend delivery`

- [x] **6. Eileen can see who owes her, and mark invoices paid and unpaid**
  Becomes usable: The Ledger lists invoices newest first, each with its number, cafe, date, due date, total and envelope mark. It has the Open / Outstanding / This month stats and per-cafe filter chips. Overdue rows get the blush due date, "overdue N days" and the left rule. Mark paid takes a paid date and an optional reference, and the row mutes to "Paid Oct 20". Mark unpaid flips it back after one confirm. Tapping a row opens the invoice. An empty filter shows "No invoices yet."
  Why now: This closes the core loop and the judge path's last step. It reads everything the earlier slices write.
  PRD ref: `prd.md > Ledger`, `prd.md > States and Boundaries` (empty Ledger)
  Spec ref: `spec.md > Components` (Ledger Screen), `spec.md > Data Model` (calculated due date and total)
  Build: Add `lib/queries/ledger.ts`, `lib/ledger-stats.ts`, the Ledger page with the `?cafe=` filter, LedgerRow, StatRow, PaymentSheet, and `POST`/`DELETE /api/invoices/[id]/payment`. Add an overdue mock invoice to the seed.
  Verify (mechanical): Units for `ledger-stats` (paid leaves Open and Outstanding but stays in This month, void is excluded, and overdue days from `todayPacific`). Through the API: mark paid, then unpaid, restores the stats. The filter returns only that cafe's invoices. The seeded overdue invoice shows its overdue days.
  Learner check: On your phone, open the Ledger. Find your new invoice at the top as Unpaid, due in 30 days. Mark it paid with a reference, then mark it unpaid, try the Corazon SB chip, and look at the overdue row.
  Commit: `Add Ledger with stats, filters and payments`

- [x] **7. Eileen can edit or void an invoice and add a special order line**
  Becomes usable: Edit opens Deliver loaded from the saved snapshot. Saving updates the invoice and its Ledger total. Void asks once, stamps "Void", keeps the number taken, and the Ledger greys the row and leaves it out of every stat. "+ Add special order" adds a free-text line that prints like any other line.
  Why now: These are correction paths on top of a working loop. They reuse DeliveryForm and the Ledger, so they're cheap now and would be guesswork earlier. Cafe switching on Edit is decided here (`prd.md > Open Questions`).
  PRD ref: `prd.md > Deliver (New Delivery and Edit)` (Edit, Special order line), `prd.md > Invoice` (Void)
  Spec ref: `spec.md > Components` (Deliver Screen, Invoice Screen), `spec.md > Decisions and Open Issues`
  Build: First, split `DeliveryForm` before adding anything: `useDeliveryLines.ts` (line state, per-line prices, totals), `SpecialOrderRow.tsx` next to `LineRow.tsx`, and `DeliveryForm` keeping only the header, the mode (new or edit) and submit. Each keeps its `Job:` line. Then add the Edit page, `PUT /api/invoices/[id]`, `POST /api/invoices/[id]/void`, the Confirm primitive, the special order LineRow with its validation, the void stamp on InvoiceDocument and LedgerRow, and the decision on cafe switching (recorded under Revisions).
  Verify (mechanical): Edit loads the snapshot prices even after a seed price change. A PUT that changes a quantity changes the Ledger total. Void sets `voided_at`, a reused number still returns 409, and the stats exclude the voided invoice. A special order line with a missing description, a negative price or a quantity of 0 returns 400. A valid one appears in the print screenshot.
  Learner check: Edit your test invoice's quantity and see the new total on the invoice and in the Ledger. Add a special order and print. In production, open the $97 test invoice `110172026` from its Ledger row and void it. Check the row greys out, the stats drop it, and the number stays taken.
  Commit: `Add invoice edit, void and special orders`

- [ ] **8. The whole app is judge-ready: Customers, polish and the judge path end to end**
  Becomes usable: Read-only Customers shows each cafe's details, logo and standing list with prices. A "Past counts" link under the Count cafe picker lists that cafe's earlier counts, newest day first. Every screen works on a phone and a laptop. Every request failure shows a one-line message. Leaving Count through the bottom nav with unsaved entries prompts. The mock-data audit passes. The four-step judge path runs on the production URL in under three minutes. Email goes out from invoices@lacondesabakingcompany.com once the domain verifies.
  Why now: Customers is off the judge path, and polish is only worth doing once there's a working whole to audit (the spec's Block 6 audit).
  PRD ref: `prd.md > Customers (read-only)`, `prd.md > States and Boundaries`, `prd.md > Operational Requirements` (client failures), `prd.md > The Core Journey` (judge path)
  Spec ref: `spec.md > Components` (Customers Screen, Logging and Health), `spec.md > Decisions and Open Issues` (Block 6 mock-data audit, file-size flag), `spec.md > File Structure` (`tests/e2e/judge-path.spec.ts`)
  Build: Add the brand wiring (link the icons and apple-touch-icon, the manifest, theme-color `#EFE6E1`, and Open Graph title "Cuenta", description "Count, deliver, invoice, ledger for a wholesale bakery," image `/og-image.png`), the Customers page, Past counts (`app/(app)/count/past/page.tsx` and its query, read-only, grouped by date), the verified-domain switch, the BottomNav dirty-flag guard, a mobile and laptop layout pass against the Stitch PNGs, one-line error states, `tests/e2e/judge-path.spec.ts`, the mock-data audit (no real logo, no real footer, the reference PNG untracked, mock customers only), and a check for files over 200 lines.
  Verify (mechanical): The Playwright judge-path spec passes against production with timing recorded. The audit script and `git ls-files` checks are clean. Screenshots at 390px and 1280px for every screen show no horizontal scroll. Killing the DB URL locally shows a one-line error, not a blank page. The 200-line report is recorded. Past counts: count rows inserted on two different dates for one cafe show both dates newest first with the right numbers, and a never-counted cafe shows "No counts yet." Verified-domain switch: after the learner changes the two env values and redeploys, a test send logs a message ID and Resend shows it sent from invoices@lacondesabakingcompany.com, with no code diff.
  Learner check: Once Resend shows the domain verified, change `EMAIL_FROM` to invoices@lacondesabakingcompany.com and `EMAIL_REPLY_TO` to Eileen's Gmail in Vercel, redeploy, and send one test. Open Past counts for Corazon Cocina and check it against what you saved. Then, as a judge would, on the production URL: Count, Deliver, Invoice (Print and Email), then Ledger for Corazon Cocina. Time it, and open Customers.
  Commit: `Add Customers, polish and judge-path test`

## Hands-on Checkpoints

- [x] Early usable behavior explored: after slice 1 (Count on your phone against the Stitch mockup, so app-style drift is caught before four more screens copy it) — Done: Eileen ran it on her own phone (wrong and right PIN, Corazon counts, cafe-switch prompt, side by side with the mockup). No changes.
- [ ] Kernel fidelity explored: after slice 3 (printed invoice against the Canva reference; this feedback shapes the PDF and the email) — Open: the overlay check against the Canva reference passed, and the learner approved going on. Eileen's physical print on her Windows laptop and the kitchen printer, laid on her form, is set for the next day and closes this box. Date format `10/17/2026` accepted for now.
- [ ] Final kick-the-tires exploration and feedback completed

## Final Review

- [ ] Final review complete — feedback resolved and learner confirms ready to ship

## Code Tour and App Map

- [ ] Learning activity complete — guided route, focused alternative, prior practice connected, or brief recap
- [ ] Optional edit and transfer reflection addressed — offered/declined/already covered/not applicable as appropriate
- [ ] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence: 
Route and stops: 
Edit outcome: 
Reflection: 
Activity mode: 

## Revisions

- Resend domain verification moved from a gate on email to a slice 8 polish item. Slice 5 builds and verifies the full send path with Resend's onboarding sender to the learner's own inbox, and `EMAIL_FROM`/`EMAIL_REPLY_TO` stay env-only, so the switch is two env values and a redeploy. The plan discovered that registrar access and DNS propagation are on Eileen's timeline, not the build's (learner decision at the gut check).
- Stitch mockups (`design/*.html`, `design/*.png`) made local-only and removed from the first commit by amending it before any push. Only `design/DESIGN.md` stays tracked. The pre-commit secret scan found Eileen's kitchen address, two real phone numbers and two real Gmail addresses in them, so the spec's assumption that their content was invented was wrong. From now on, every commit is preceded by a `git diff --cached --name-only` review.
- Unrelated to the mockups: `.gitignore` keeps `!.env.example` after the Vercel CLI's `.env*` rule, so the placeholder file stays committable.
- Past counts added to slice 8: Eileen keeps a paper book of old counts and will ask on day one. It's a read-only list under Count, with PRD, spec and scope updated. This was a learner-directed scope addition, small and off the judge path.
- Local dev moved to a Neon `dev` branch; production stays on `main`. Slice 2 testing showed local and production shared one database, so test invoices landed in production. The $97 test invoice stays in production on purpose, to be voided on real data in slice 7's learner check (Void is built in slice 7).
- The footer chef line now comes from a new `BUSINESS_CHEF_LINE` env var. The spec says footer identity comes from env, never from source code, and the chef line had no variable. The placeholder is in the repo and the mock deploy; Eileen's real line goes in production at Handoff.
- The Canva PNGs were trimmed to their visible ink before use, and each is placed at the learner's PDF-point coordinates. The exports carried transparent padding (`footer-title.png` was about half padding), so pixel sizes didn't match the PDF boxes. The invoice is laid out in PDF points scaled from the page width, so screen, print and PDF share one coordinate system.
- `MAX_LINES_ONE_PAGE` was measured at 8: the form's 36pt spacing holds up to 5 lines, then tightens evenly to a 22pt minimum. A 9-line invoice shows "Too many lines for one page". The printed page box is 10.95in, so sub-pixel rounding never adds a blank second page.
- **Spike 1 PASSED** (about 10 of 60 minutes, on Vercel production with `@sparticuz/chromium` 153.0.0 and `puppeteer-core` 25.14.0):
  - **Longevity:** released Sep 11, 2026; runs on the Vercel Node runtime.
  - **Size:** the PDF function is 71.3 MB (66.8 MB of it is the compressed Chromium). That's well under Hobby's 250 MB.
  - **Speed:** cold 5.96 s server-side (6.97 s from the client) against a 10 s target. Warm 0.71–1.66 s server-side (1.1–2.0 s from the client) against 3 s.
  - **Output:** a one-page Letter PDF with Limelight, Tinos and all 7 images.
  - **Duration:** `maxDuration` is 60.
  - **Security:** no token appears in our logs or Vercel's. A bad or missing token returns 404, and no session returns 401.
  - The fallback renderer wasn't needed.
- **Tinos added after Times New Roman** in the invoice stack. Serverless Chromium ships only Open Sans, so the PDF body would have rendered in a sans-serif. Tinos is metric-compatible with Times New Roman, so Eileen's Windows print (Times New Roman) and the PDF (Tinos) lay out identically.
- **The PDF waits for load, fonts and decoded images** instead of `networkidle0`. Dev-mode hot reload never goes network-idle and reloads the print page. Production was verified with `next start` and on Vercel.
- **The Chromium tracing key is `/api/invoices/*/pdf`.** The first deploy failed with the Chromium `bin/` missing, because `[id]` in an `outputFileTracingIncludes` key is a glob character class.
- **PIN hardened now, not at polish.** Six digits; 5 wrong tries per IP or 20 overall in 15 minutes lock for 15 minutes with a 429; constant-time compare; failures logged with IP and never the digits. Four digits with no lockout was 10,000 guesses with no brake on a public URL (learner decision). PRD, spec and the "PIN lockout" Later item are updated.
- **Brand files committed, plus `X-Robots-Tag: noindex, nofollow` on every response.** It's set in `next.config.ts` headers rather than the proxy, because the proxy skips static files. The rest of the brand wiring is added to slice 8.
- **Slice 5 send path verified on Vercel** with Resend's test inbox, `delivered@resend.dev`. Status was `delivered`, with Reply-To set and `Invoice-110172026.pdf` attached at 96,071 bytes, identical to Download PDF. The message ID `01a14cff…` matches the Vercel log line, and there's no address in any log. The box stays open until the same send lands in the learner's own inbox.
- **Mock cafes bill to `SEED_BILLING_EMAIL`, read from `.env.local`;** Alma keeps no email. The learner asked for their inbox on the mock cafes; it stays out of the public repo, and Alma is the PRD's "No email on file" case.
- **Provider errors go to the log only** (addresses scrubbed). The browser sees just the quiet failure line, as the PRD specifies.
- **The "No email on file" note sits outside the To label.** Inside it, the field's accessible name read "To No email on file for Alma".
- **Navigation rules pinned for the phone (learner-directed):**
  - The Invoice screen keeps the bottom nav and has "← Back to Ledger".
  - Every sheet adds one history entry, so the phone's back button closes it, and in-sheet closes step off that entry before acting.
  - Download PDF keeps `Content-Disposition: attachment` and a background fetch, so the tab never navigates.
  - Verified at 390px: Download, Print, Cancel, Back, and Count's Discard all leave her on the right screen with no reload.
  - The first sheet back-button version (popping history in cleanup) closed the sheet under dev StrictMode, and could undo a navigation made right after a confirm. It was replaced.
- **Overdue reminders added to Later** in the PRD and scope (ask-first daily cron, one signed link, PDF reused, "Reminded [date]"), with a stub comment in `lib/email/invoice-email.ts`. Not built.
- **Docs brought up to date** with every decision since spec approval: scope, PRD, spec, checklist, learner profile, and the three HTML review pages.
- **Mock billing emails switched to the learner's inbox** in place in production (cafes 1, 2 and 4; Alma none). On-camera invoice `110172026-2` ($128.00) created in production for the learner's slice 5 send.
- **Ledger stats follow the cafe filter.** On a cafe's chip, Open, Outstanding and This month show what that cafe owes; on All they cover every cafe. The PRD didn't say which; this is the agent's call, flagged at the slice 6 checkpoint.
- **The overdue due date uses `--blush-ink` (`#9a6a5e`)**, a deep blush that passes AA on white. The blush token itself (`#EFE6E1`) is unreadable as text. The thin left rule stays the true blush.
- **Mark unpaid's one confirm is a second step inside the same payment sheet**, not a sheet on top of a sheet. So one Back press still closes it.
- **Void rows were checked before Void exists** (slice 7), by setting `voided_at` directly in `dev`: the row greys out with a Void stamp and no payment button, it's dropped from all three stats, and the payment API answers 409.
- **The dev seed now includes an overdue invoice and a paid one**, so every row state has data.
- **Slice 5 bugs found in the learner's test, all fixed:**
  1. **To looked empty.** The data was right: the saved email was on the invoice, the preview API answered 200, and a headless browser showed it filled. But To depended on a second request after the pop-up opened. The Invoice page now hands the pop-up its full draft, so To is filled on first paint. The `email-preview` route was removed.
  2. **The send failed.** Resend refused it with a 403: on the onboarding sender it delivers only to the Resend account owner's address, and the seeded inbox was a different address. The test data (`SEED_BILLING_EMAIL`, cafes 1, 2 and 4 in production and `dev`, and test invoice `110172026-2`'s saved email) now uses the owner address. That one test invoice's snapshot email was corrected by hand, an exception to the snapshot rule for mock data, and its failed-try mark was cleared so the walkthrough starts clean.
  3. **Send was hard to find.** Cancel and Send are now pinned at the bottom of every sheet. The empty-To line is "No email saved for this invoice. Type one to send.", with the cursor in To. The preview shows two lines with "Show full email".
- **"Resend" dropped as a button name** (it's the provider's name): Send email, then Send again with "Last sent Oct 17, 8:12pm". The same words appear on the Invoice page, the pop-up, the Ledger and How it works. A failed try reads "Try again".
- **Ledger email label:** the envelope plus "Emailed Oct 17" (hover and screen readers get the full time), or "Not sent". A failed retry after a success reads "Emailed … · last try failed" rather than "Not sent", so the label never denies a send that happened. That's the agent's reading of "the stamp never lies", flagged for the learner.
- **How it works page** at `/help` (open without the PIN; no data), with a "?" on every page and the PIN screen. Sections: Count, Deliver, Invoice page, Email pop-up, Ledger. Unbuilt features (Edit, Void, Past counts) join when they ship.
- **Rule for the whole app: no icon without words.**
- **Later stubs added:** Excel export of the Ledger, and an accounts receivable aging report.
- **Slice 5 closed** by the learner's own send. Invoice `110172026-2` was emailed from production at Oct 17, 9:40pm Pacific (message ID `01a14d4f-a2b4-7e13-b9ac-8fd4fa65a417`) and arrived in the Resend account owner's inbox. The learner confirmed the Email pop-up fixes: To filled in, the two-line preview, and the buttons visible.
- **Cafe switching on Edit is locked** (`prd.md > Open Questions`, decided in slice 7). It wasn't free: switching would re-snapshot the cafe's details and reload another cafe's prices in the middle of an edit. Edit shows the cafe as text with "To bill a different cafe, void this invoice and create a new one", and `PUT` refuses a different `customerId` with a 400.
- **Edit shows the whole standing list,** not just the saved lines. Saved lines keep their saved name and price. Standing products that weren't delivered show today's price with a blank quantity, so she can add them. A saved product that has since left the standing list stays on the form. Special orders follow the standing lines and print in the order added.
- **A void invoice can't be edited or emailed** (409 from `PUT` and the email route). Its screen keeps Print and Download PDF for her records and hides Send, Edit and Void. The PRD didn't say; this is the agent's call, flagged at the slice 7 checkpoint.
- **The VOID stamp is see-through and sits below the lines,** so the prices underneath stay readable on screen, in print and in the PDF.
- **`.btn` now styles links too** (`display: inline-flex`), so Edit, a link to the Edit page, looks and sizes like the other buttons.
- **Void rows are crossed out, not just greyed (learner decision at the slice 7 check).** The number and total have a line through them, next to the "Void" stamp, in muted ink. That's how slice 6 built it, so no code changed. The PRD's Void row and its check now say "crossed out".
- **Slice 7 learner check passed on production (learner).** 110172026 ($97) was voided from its Ledger row: the row is crossed out, the stats went to 1 / $128.00 / $128.00, and the number stays taken. 110172026-2 was edited: the quantity change saved, and the added special order line prints on the invoice. The three agent calls above (cafe locked on Edit, a void invoice can't be edited or emailed, the stamp below the lines) are approved.
- **The unsaved-changes guard also covers New Delivery** (agent's call, flagged at the slice 8 checkpoint). The PRD names only Count, but a half-typed delivery was just as easy to lose with one tap on the bottom nav. Edit isn't guarded; it has its own Cancel. The guard is a shared flag (`components/nav/unsaved.ts`) that a form raises and `BottomNav` checks; Count's "Past counts" link asks too.
- **The proxy now lets `site.webmanifest`, `robots.txt` and `humans.txt` through without the PIN.** Before, they redirected to `/pin`, so the manifest never loaded on the PIN screen and `robots.txt` never reached a crawler.
- **How it works covers the slice 7 and 8 buttons** (Edit, Void, "+ Add special order", Past counts, the leave prompt) and has a Customers section. The PRD's list of sections includes Customers.
- **The judge-path test cleans up after itself.** It makes a uniquely numbered `E2E-…` invoice and voids it at the end, so production stats stay honest. It opens the Email pop-up and checks To is filled, but only really sends with `E2E_SEND=1`. Print is recorded, not opened, because headless Chrome has no print dialog.
- **The mock-data audit reads real values from local-only files** (the gitignored Stitch mockups and `.env.local`) and checks every tracked file against them, plus the forbidden-file and 555-number rules. So the real values never have to be written into the repo. A planted real email and phone were caught before the first clean run.

