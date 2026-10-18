---
doc: prd
status: approved
---

# Cuenta — Product Requirements

Cuenta is an invoicing and shelf-count app for Eileen, owner of La Condesa Baking Company, a wholesale bakery in Santa Barbara delivering to four cafes. It's her paper invoice, come to life. Source: `scope.md > The Unique Kernel`, `scope.md > Who It's For`.

**Accounts (location code, name):**

| Code | Account | Logo |
|---|---|---|
| 1 | Corazon Cocina (Santa Barbara Public Market) | Corazon heart |
| 2 | Little Heart Cafecito | none |
| 3 | Alma | none (mock) |
| 4 | Corazon SUR (Carpinteria) | Corazon heart |

**Products:**

| Product | Price |
|---|---|
| Strawberry Tres Leches Cake | $4.75 |
| Coconut Tres Leches Cake | $4.75 |
| Coconut Rice Pudding | $3.75 |
| Pixie Tangerine/Orange Flan | $4.00 |
| Mexican Wedding Cookies | $3.50 |

Mock cafes in the repo use these products with fake contact details.

## The Core Journey
Source: `scope.md > The Core Loop`, `scope.md > What "Working" Looks Like`.

1. **PIN (first open on a device).** The La Condesa wordmark, one six-digit field, one button. The right PIN is remembered on that device for 30 days. Later visits skip the PIN.
2. **Count (phone, at a cafe).** Lands here after the PIN. She picks the cafe, taps or types counts for the products she's counting, and saves. Only the rows she entered get recorded.
3. **Deliver (laptop, kitchen).** She picks the cafe. Its standing list appears with prices and the last shelf count in grey beside each line. She enters quantities and totals compute live. The date defaults to today and the invoice number is pre-filled. She taps Create invoice.
4. **Invoice (laptop).** Her Canva form, rendered with only the lines she delivered. Print opens the browser print dialog. Send email opens the Email pop-up; she taps Send email, and "Last sent [date, time]" shows on the invoice.
5. **Ledger (phone).** The new invoice shows Unpaid, due in 30 days, and the stat row updates. When the ACH lands she taps Unpaid, enters the paid date, and the row goes muted as Paid.

Count and Deliver never feed each other (`scope.md > The Core Loop`).

**Judge path (hackathon done):** steps 2 through 5 on the deployed URL with mock data, under three minutes, using Corazon Cocina.

## Screens and Layout

**How it works** (added in `5-build`): a small "?" in the top corner of every page, the PIN screen included, opens a plain-words page. It has one short section each for Count, Deliver, Invoice page, Email pop-up, Ledger and Customers: what the screen is for and what each button does, using the buttons' exact names.

| Screen | Primary device | Reached from |
|---|---|---|
| PIN | both | first open, or after 30 days |
| Count | phone | bottom nav; landing screen after the PIN |
| Deliver | laptop | bottom nav; also "Edit" on an invoice |
| Invoice | laptop | after Create invoice; from a Ledger row |
| Ledger | phone | bottom nav |
| Customers | both | bottom nav (read-only) |

- **Bottom nav:** four tabs, Count · Deliver · Ledger · Customers, on every screen except PIN and the printout.
- **Pop-ups:** the Email pop-up and Mark paid open over their screen, not as new pages.
- **References:** the layout and style of each screen follow the Stitch mockups in `design/`: `count_inventory`, `new_delivery`, `invoice_preview_actions`, `wholesale_ledger`, `customers_standing_orders`. **Stitch content is not a source.** Stitch invented products, fees, permit numbers, tiers, signer names, shift and drop times, and "Direct ACH". Everything a screen shows comes from this PRD.
- **Count is one cafe at a time,** chosen with a picker. This overrides the Stitch mockup, which stacks all four.
- **Other devices:** every screen must work on both phone and laptop. Each is laid out first for its primary device.

## Look and Feel
Source: `scope.md > Inspiration & Identity`, `design/DESIGN.md`.

**Overall:** her paper invoice come to life.
- white paper and black ink
- one warm blush tint (`#EFE6E1`) for panels and the overdue accent
- 1px dotted hairline rules for separation
- 0px corners, no shadows
- states use an inverted ink fill or a hairline border, never colored badges

**Type:**
- Display: Bodoni Moda (deco-leaning)
- Body and product names: EB Garamond
- Labels and column headers: Space Grotesk, tracked all-caps
- Exception: the **invoice** uses the Canva form's faces (see Invoice Typography below)

**Controls:**
- Primary buttons are solid black, 48px tall
- Secondary buttons are outlined
- Steppers have 48px touch targets
- Inline fields are underline-only

**Messages:** errors and confirmations are one quiet line of serif text, never a red banner.

**No icon without words** (added in `5-build`): every icon comes with words she can read, such as the envelope with "Emailed Oct 17". On a laptop, hovering shows the full detail, and screen readers hear the same words.

**Button names** (added in `5-build`): the send button never says "Resend", which is also the email provider's name. It reads **Send email** the first time and **Send again** after a successful send. The same words are used on the Invoice page, in the Email pop-up, in the Ledger and on the How it works page.

**The printed invoice** is indistinguishable from `design/canva-invoice-reference.png`:
- **Header:** the LA CONDESA BAKING COMPANY wordmark on the left, INVOICE on the right
- **Customer block:** "Invoice for:" with the cafe name, phone and address, plus the cafe's logo when it has one. The logo space is left empty when it doesn't.
- **Number and date:** "Invoice #" and "Date:" at the right. The date prints as `10/17/2026` (learner-accepted in `5-build`).
- **Line table:** DESCRIPTION / QTY / PRICE / TOTAL columns under a dotted rule
- **Totals:** a dotted rule, then "INVOICE TOTAL $"
- **Footer:**
  - the blush contact block: La Condesa Baking Company, *Chef Eileen Foster Randall*, the kitchen address, phone and Gmail
  - "Order received by: ____"
  - the closing line "Payment Terms: Net 30 - Due in full within 30 days of invoice date, *Thank You!*"
- **Page:** one US Letter page

**Invoice Typography** (learner-decided):
- **"INVOICE":** Limelight (Google Fonts).
- **Body text:** the system serif stack, Times New Roman first. The original is TeX Gyre Termes, a Times clone. **Tinos** comes next (added in `5-build`): it is metric-compatible with Times New Roman, so the PDF, rendered on a server with no system fonts, breaks lines exactly where her printout does.
- **Images, not live text:** the wordmark "LA CONDESA / BAKING COMPANY", the footer block title, and the column headers DESCRIPTION / QTY / PRICE / TOTAL are PNGs exported from Canva. The original face, DK Otago, is licensed in a way that forbids web use, so the font file never enters the repo. The images go in `design/` before Block 3.

## Features and Behavior

### PIN Gate
- One six-digit field and one button under the wordmark. On a phone the field opens the numeric keypad.
- **Wrong PIN:** a single serif line under the field reads "That's not it."
- **Right PIN:** remembered on that device for 30 days, then she lands on Count.
- **Attempt limiting** (added during `5-build`, learner-directed: four digits with no brake is 10,000 guesses on a public URL):
  - 5 wrong attempts from one IP within 15 minutes lock that IP for 15 minutes.
  - 20 wrong attempts from anywhere within 15 minutes lock the PIN screen for everyone for 15 minutes.
  - While locked, every attempt (even the right PIN) is refused with "Too many tries. Wait 15 minutes." in the same quiet serif line.
  - Every failed attempt is logged with its IP and time, never the digits tried.
- [ ] A wrong PIN shows "That's not it." and stays on the PIN screen.
- [ ] Six wrong attempts in a row: the sixth is refused with "Too many tries. Wait 15 minutes."
- [ ] The right PIN during a lockout is still refused; after 15 minutes it works again.
- [ ] The attempted PIN never appears in any log.
- [ ] After the right PIN, reopening the app on the same device within 30 days goes straight to Count.
- [ ] No screen or data request works without a valid PIN session.

### Count
Source: `scope.md > The Core Loop`.

**Layout:**
- **Cafe picker:** the four cafes, preselected to the one she last counted.
- **Rows:** that cafe's standing products. Each row shows the product name, a stepper (−, number, +), and a grey line under the name: "last counted Oct 9: 3".
- **Save** is pinned to the bottom.

**Behavior:**
- **Steppers start blank,** never pre-filled. She can tap or type.
- **Save records only the rows with a number entered,** as today's count for that cafe. Untouched rows keep their previous count and date; nothing is silently rewritten.
- **Save is disabled when every row is blank.**
- **After Save:** the grey line on each saved row updates to today's date and the new number, the steppers clear, and a quiet "Saved" shows for two seconds.
- **Unsaved changes:** switching cafes with entries pending prompts once before discarding them.

**Past counts** (added during `5-build`, learner-directed; Eileen keeps a paper book of old counts today):
- One link under the cafe picker, "Past counts", opens a plain read-only list for the selected cafe.
- Newest day first. Each day shows its date, then the product and number for each row saved that day.
- No editing, no charts. Same style as the rest of the app.
- A cafe never counted shows "No counts yet."

**Checks:**
- [ ] Picking Corazon Cocina shows its standing products with blank steppers and the grey last-count line.
- [ ] Entering two numbers and saving updates only those two grey lines to today; the other rows keep their old dates.
- [ ] Save is disabled with every row blank.
- [ ] Switching cafes with unsaved entries prompts once.
- [ ] Saving a count changes nothing on any invoice, and creating an invoice changes no count.
- [ ] After two saves on different days, Past counts shows both dates, newest first, with the right numbers under each.

### Deliver (New Delivery and Edit)
Source: `scope.md > The Core Loop`, `scope.md > The POC Boundary`.

**Layout:**
- **Cafe:** a picker.
- **Date:** the invoice date, which is also the delivery date. Defaults to today and is editable.
- **Invoice #:** a text field, pre-filled with a suggestion.
- **Lines:** one per product on the cafe's standing list. Each shows the product name, the price, a blank quantity field, a live line total, and in grey the cafe's last shelf count for that product. The count is reference only and never pre-fills the quantity.
- **Running invoice total.**
- **Create invoice** button.

**Invoice number:**
- Stored as text and shown exactly as typed everywhere.
- **Suggestion:** the cafe's location code followed by the date as MMDDYYYY, with no separators. Corazon SB on Oct 17, 2026 gives `110172026`.
- **Follows the date and cafe** until she types her own number. After that, the app leaves her number alone.
- **Must be unique.** A duplicate shows "Already used on Oct 3 for Corazon SB" and won't save.
- **Second delivery to the same cafe on the same day:** she adds a suffix herself (`110172026-2`). The app never invents one.

**Money:** all amounts are calculated in integer cents and displayed as dollars.

**Unit price on each line:**
- An editable field, pre-filled from the product on a new invoice, or from the invoice's saved copy on Edit.
- Changing it affects only that invoice and never touches the product record. It covers one-off prices and corrections.

**Special order line:**
- An "+ Add special order" link under the standing list adds a blank line with a free-text description, an editable unit price, and a quantity.
- It isn't linked to any product. It prints like any other line, in the order added. It never creates a product, never joins the standing list, and never shows in Count.
- Validation: the description is required, the price is zero or more, and the quantity is at least 1.
- Built in Block 4 if the standing-list lines are done; otherwise in Block 6. Either way, it ships before Handoff.

**Invoices are snapshots:**
- Each line saves its own description, unit price and quantity at the moment the invoice is saved.
- The invoice saves the cafe's name, address, phone, email and logo the same way.
- Totals come from the lines. Past invoices and past Ledger totals never change when a product or cafe changes later.
- Edit shows the saved copy, not today's prices.

**Create invoice:**
- Disabled until at least one line has a quantity greater than zero.
- Saves the invoice and opens the Invoice screen.

**Edit (from an existing invoice):**
- The same screen, loaded with the invoice's data.
- She can change quantities, add or remove lines, the date and the number. Totals recompute. Saving returns to the Invoice screen.
- **Changing the cafe** isn't offered on Edit (decided in slice 7). The cafe shows as text with "To bill a different cafe, void this invoice and create a new one."
- **A void invoice** can't be edited or emailed. Print and Download PDF still work, so she keeps the record.

**Checks:**
- [ ] Picking Corazon Cocina loads its standing list with prices and grey shelf counts; every quantity is blank.
- [ ] Typing quantities updates line totals and the invoice total immediately and correctly to the cent.
- [ ] The suggested number for Corazon SB on Oct 17, 2026 is `110172026`. It changes when the date or cafe changes, until she types over it.
- [ ] Entering a number already in use shows "Already used on [date] for [cafe]" and blocks the save.
- [ ] Create invoice is disabled with no quantities entered.
- [ ] Changing a line's unit price changes that invoice only; the product's price is unchanged on the next new delivery.
- [ ] A special order line with a description, price and quantity prints on the invoice; missing description, negative price or a quantity of 0 blocks the save.
- [ ] Editing a saved invoice and changing one quantity updates its total on the Invoice screen and in the Ledger.

### Invoice
Source: `scope.md > The Unique Kernel`.

**What shows:**
- Her Canva form (see Look and Feel), filled with the cafe's details and logo if any, the invoice number, the date, and **only the lines with a quantity**. Undelivered standing products don't appear at all, so there are no blank rows.
- **Status line in grey:** "Last sent Oct 17, 8:12pm", "Last sent Oct 17, 8:12pm · last try failed" after a failed later attempt, "Not sent" if no send ever succeeded, or nothing if it was never emailed.

**Navigation (phone first, added in `5-build`):**
- The Invoice screen keeps the bottom nav and has a "← Back to Ledger" link at the top. She is never on a page with no way back.
- Every pop-up (the Email pop-up, confirms, Mark paid) closes with Cancel, a tap outside it, or the phone's back button, and returns her to the same screen. Back never jumps to the previous page while a sheet is open.

**Actions:**
- **Print:** opens the browser print dialog. The output is one Letter page matching the Canva form, with no app chrome. Cancelling the dialog leaves her on the same Invoice screen, state intact.
- **Download PDF:** saves the same PDF the email attaches (`Invoice-[number].pdf`), for her records. It sits between Print and Send email. It's served as an attachment and downloads (the share sheet on iOS, saved on Android); the app tab never navigates to the PDF.
- **Send email:** opens the Email pop-up. After the first successful send, the button reads **Send again**.
- **Edit:** opens Deliver loaded with this invoice.
- **Void:** one confirm. The invoice gets a "Void" stamp and stays visible. Its number is never reused. There's no hard delete anywhere.

**Checks:**
- [ ] The printed page, laid next to `design/canva-invoice-reference.png`, matches its layout, fonts, header, footer block, contact details and Net 30 line. Only the delivered lines appear.
- [ ] Corazon invoices show the heart logo; Little Heart and Alma invoices leave that space empty.
- [ ] The printout fits one Letter page with no nav, buttons or browser-styled UI.
- [ ] Download PDF saves `Invoice-[number].pdf`, identical to the email attachment.
- [ ] At 390px, after Download PDF the Invoice screen is still showing with its buttons.
- [ ] Cancel and the phone's back button both close the Email pop-up and leave her on the invoice.
- [ ] Voiding asks once, stamps "Void", and the number stays taken.

### Email Invoice
Source: `scope.md > The POC Boundary` (Email).

**The Email pop-up:**
- **To:** the invoice's saved billing email, filled in when the pop-up opens (no waiting on a second request). It's editable for this send only and doesn't change the customer record. If none is saved, the field is empty, the cursor goes in it, and one plain line reads "No email saved for this invoice. Type one to send." **Send email** stays disabled until there's an address.
- **Subject:** fixed, not editable: "La Condesa Baking Company Invoice [number]".
- **Body:** the fixed template with the cafe name, invoice total and due date filled in, not editable. It's collapsed to its first two lines, with **Show full email**. The template is edited in code until Handoff.
- **Attachment line:** "Invoice-[number].pdf attached".
- **Buttons:** **Cancel** and **Send email** (black), pinned to the bottom of the pop-up so they're always visible without scrolling, on phone and laptop. After a send the button reads **Send again**, with a grey "Last sent Oct 17, 8:12pm" line above it. One tap, with no second confirm.

**Sending:**
- From invoices@lacondesabakingcompany.com, with Reply-To set to Eileen's Gmail. The PDF matches the printed invoice.
- Until the domain verifies, sends go from Resend's onboarding sender, which only delivers to the account owner's inbox. The sender and Reply-To live in env, so the switch is two values and a redeploy (`5-build`, slice 8).
- **She never types the recipient.** To is pre-filled from the cafe's saved billing email; her only required action is one tap on Send.
- The invoice is already saved before any send is attempted.

**Results:**
- **Success:** the pop-up closes, "Last sent [date, time]" shows on the invoice in grey, the button reads Send again, and the Ledger row shows the envelope with "Emailed [date]".
- **Failure** (the provider returns an error, the network is down, or the PDF didn't render):
  - the pop-up stays open with "Couldn't send. The invoice is saved. Try again or print it." and a **Try again** button
  - the invoice shows "Not sent", and she can send it again later
  - a failed send never shows "Sent"
- **Send again** uses the same number and the same subject. There's no "(revised)" wording in this version.

**Checks:**
- [ ] On camera, Send delivers a real email with `Invoice-[number].pdf` attached to the learner's inbox, and the logged message ID matches it.
- [ ] A cafe with no email on file shows the message and blocks Send until one is typed.
- [ ] A forced send failure shows the failure line and "Not sent", and never a "Last sent" line.
- [ ] On a 390×640 phone and a laptop, Cancel and Send email are visible without scrolling, even with the full email shown.
- [ ] An invoice with no saved email opens with the cursor in To, "No email saved for this invoice. Type one to send.", and Send email disabled.
- [ ] No button or label anywhere says "Resend". After a send, the Invoice page, the pop-up and the Ledger say "Last sent …", "Send again" and "Emailed …".

### Ledger
Source: `scope.md > The POC Boundary` (Ledger).

**Stat row:**
- **Open:** the count of unpaid, non-void invoices.
- **Outstanding:** the sum of unpaid, non-void invoices.
- **This month:** the sum of non-void invoices dated in the current month, paid or not.

**Filters and sort:** chips for All plus one per cafe, defaulting to All. Newest delivery date first.

**Unpaid row:**
- Shows the invoice number, cafe, delivery date, due date (delivery date + 30 days), total, and an "Unpaid" button.
- Shows the envelope with a short grey label, "Emailed Oct 17", once emailed. On a laptop, hovering shows the full time, and screen readers hear the same words. If no send has succeeded and the last one failed, it reads "Not sent".

**Overdue row** (unpaid and past its due date):
- The due date is in blush, followed by "overdue 9 days".
- A thin blush rule runs down the left edge. Nothing louder.

**Mark paid:**
- She taps Unpaid and a sheet opens with the paid date (defaults to today, editable), an optional free-text reference, and a Mark paid button.

**Paid row:**
- Muted grey. The button reads "Paid Oct 20", with the reference underneath if she entered one.
- It leaves Open and Outstanding, and stays in This month if dated this month.

**Undo:**
- Tapping "Paid Oct 20" opens the same sheet with a Mark unpaid button and one confirm.
- The row returns to unpaid and the totals recompute. She can flip it any number of times.

**Void row:** crossed out (a line through the number and total) with a "Void" stamp, can't be marked paid, and is excluded from all three stats.

**Opening an invoice:** tapping a row (outside its button) opens that invoice.

**Checks:**
- [ ] After the judge path's invoice is created, it appears at the top as Unpaid, due 30 days from its date, and Open, Outstanding and This month all reflect it.
- [ ] Marking it paid mutes the row, shows "Paid [date]" with the reference, and updates Open and Outstanding but not This month.
- [ ] Mark unpaid restores it and the totals.
- [ ] An unpaid invoice dated more than 30 days ago shows the blush due date, "overdue N days" and the left rule.
- [ ] A void invoice appears crossed out with "Void" and counts in no stat.
- [ ] The Corazon SB chip shows only that cafe's invoices.

### Customers (read-only)
Source: `scope.md > The POC Boundary` (Data).
- Each cafe shows its name, location code, phone, address, billing email, terms (Net 30), logo if any, and its standing list with prices.
- There's no editing in this version. Changes are edits to the seed file until Handoff.
- [ ] All four cafes appear with their seeded details, logo where present, and their standing lists.

## Operational Requirements
These are requirements, not implementation. `4-spec` decides how to build them.

**Logging from the first block onward:**
- One structured JSON line per server event: timestamp, route, outcome and duration.
- Sends also log the provider's message ID or the error text.
- **Never logged:** customer emails, addresses, phones, invoice bodies, the PIN, or any environment variable. Only the invoice number and cafe name are logged.
- The hosting provider's function logs are the viewer. There's no separate logging service.

**Health check:** a `/health` endpoint reports the database connection status and the app version. It tells a cold start apart from a real outage during the demo.

**Client failures:**
- Every request failure shows a one-line message, never a blank screen.
- The failure is logged to the browser console with the route name.

## States and Boundaries
- **First use on a device:** the PIN screen.
- **Cafe never counted:** the grey line on Count and Deliver reads "not counted yet".
- **Cafe with no email:** see Email Invoice.
- **Cafe with no logo:** the invoice logo space is left empty.
- **Empty Ledger** (or a filter with nothing in it): one quiet serif line, "No invoices yet." The stats read 0 / $0.00 / $0.00.
- **Unsaved Count entries:** a prompt when switching cafes. Leaving through the bottom nav prompts the same way.
- **Request failure anywhere:** one-line message, and the screen stays usable.
- **What persists:** the PIN session for 30 days per device. Counts, invoices, the paid state and the sent state persist until changed.
- **Who:** Eileen only, behind the PIN. There are no roles.
- **Data in the repo:** mock only. The four accounts, the five real products and prices, and fake contact details.

## Product Decisions
- **Count and invoice are separate jobs.** Count is for planning; the invoice records what she dropped off. The shelf count on Deliver is grey reference only.
- **Steppers start blank and Save records only entered rows.** Nothing is silently rewritten.
- **The invoice prints only the delivered lines,** not blank standing rows. The layout still matches her form exactly.
- **Seeded per-cafe logos are in, with no upload.** Eileen prints the Corazon heart today with Corazon's blessing.
- **Invoice numbers are Eileen's scheme:** location code plus MMDDYYYY, as text, suggested and overwritable, unique, with a manual suffix for repeat deliveries. It's her existing numbering.
- **Invoice date and delivery date are the same date.**
- **Invoices are editable, never deleted. Void instead.** She's the only user, so the ledger can't be corrupted by a mistake.
- **Paid can be undone, without limit.**
- **Invoices are snapshots, with editable per-line prices and special order lines** (added during `4-spec`). Price changes only ever apply going forward.
- **Email confirm:** the recipient is editable per send; the subject and body are fixed. One tap sends. The invoice saves before the send, so a failure loses nothing.
- **Send again keeps the same number and subject.** There's no "(revised)" wording for now.
- **Customers is read-only until Handoff.** Admin screens cost time the judge never sees.
- **Logging and `/health` are part of the plan from the start.** The logs prove on video that the send was real.

- **Download PDF is in:** it's the same PDF the email attaches, so it costs nothing extra, and she'll want it for her records.
- **Invoice typography:** Limelight for INVOICE and a Times-first serif stack for body text. The DK Otago pieces are Canva PNGs because its license forbids web use.

**Build rules to carry into `4-spec` and `5-build`:**
- One file, one responsibility, and no god files.
- Every code file starts with a one-sentence `Job:` comment. If it needs a second sentence, the file gets split.
- Flag any code file over about 200 lines at each checkpoint.

## What We're Building
- **PIN gate**
- **Count,** with blank steppers, partial save, the grey last count, and a read-only Past counts list
- **Deliver,** with the standing list, grey shelf counts, live totals in cents, the suggested and unique invoice number, and Edit
- **Invoice,** matching the Canva form, with seeded logos, Print, Download PDF, Void, and the status line
- **Email,** with the Email pop-up, a real send with the PDF, success and failure states, and Send again
- **How it works** page behind a "?" on every page
- **Ledger,** with stats, filters, overdue, Mark paid and its undo, void rows, and the "Emailed [date]" label
- **Read-only Customers**
- **Structured logging, `/health`, and client error lines**
- **Mock seed data:** four accounts and five products
- **Deployed** to a public URL

## Deferred From the POC
To Block 8, Handoff:
- **In-app editing of Products, Customers and standing lists:** an admin UI the judge path doesn't need. Seed edits cover it for now.
- **Email template editor:** the template lives in one code file for now.
- **Full history line** (the "Printed · Emailed" log) and **"Edited after sending" / "(revised)" wording:** a second send is just Send again for now.
- **Changing the cafe on an existing invoice,** unless it comes free: void and recreate covers it.
- **Real data seeding, the production PIN, and Eileen's own acceptance run:** the project finish line.

## Possible Later Enhancements
- **Stripe or other online payments.**
- **Multi-user login.**
- **Low-stock alerts** from counts.
- **A bake list** generated from counts.
- **Logo upload** in Customers.
- **Overdue reminders** (stub, added in `5-build`; not built now):
  - A daily Vercel Cron job finds invoices that are unpaid, not void, and past due.
  - Default mode is ask-first: Eileen gets one email listing them, with a single signed link that sends the reminders in one tap.
  - The reminder email reuses the invoice PDF with a short Net 30 body.
  - The Ledger row shows "Reminded [date]".
  - Fully automatic per cafe is a later toggle.
- **Export the Ledger as Excel (.xlsx)** (stub, added in `5-build`; not built now):
  - It respects the cafe filter and a date range.
  - Columns: invoice number, cafe, delivery date, due date, total, status, paid date, reference.
- **Accounts receivable aging report** (stub, added in `5-build`; not built now):
  - Unpaid invoices grouped by how overdue: current, 1 to 30, 31 to 60, 61 to 90, and over 90 days. Per cafe and in total.
  - Exportable as PDF or Excel, for Eileen's accountant or for following up on overdue bills.

## Non-Goals
- **Ingredient tracking or recipe costing:** a different product.
- **Accounting or tax:** the Ledger only tracks who owes what.
- **Model-generated prices, totals, dates, invoice numbers or email text:** a deterministic app.
- **Inventory decrement on delivery:** counts are observed, never calculated.
- **Real customer data in the repo.**
- **Hard delete of any invoice.**
- **App-generated invoice-number suffixes.**

## Open Questions
- **Cafe switch on Edit.** *Decided in slice 7: not included.* The cafe is locked on Edit; to bill a different cafe, she voids the invoice and creates a new one.
