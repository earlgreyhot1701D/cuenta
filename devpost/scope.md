---
doc: scope
status: approved
---

# Cuenta

An invoicing and shelf-count app for La Condesa Baking Company: Eileen's paper invoice, come to life.

## The Unique Kernel
**Her paper invoice, come to life.**
- She builds a delivery from each cafe's standing list, with her latest shelf count beside each line as a greyed reference.
- The invoice it prints in the kitchen is *indistinguishable* from the Canva form she hands out today.

It isn't generic invoicing software. It digitizes one baker's existing route and paperwork exactly as she already does them.

## Who It's For
**Eileen**, owner of La Condesa Baking Company, a wholesale bakery in Santa Barbara. She delivers to four cafes:
- Corazon Cocina (Santa Barbara Public Market)
- Little Heart Cafecito
- Corazon Cocina SUR (Carpinteria)
- Alma

**Today, by hand:**
- She counts what's left on each cafe's shelf.
- She pre-prints a blank Canva form per cafe, fills in quantities and does the totals by hand.
- She tracks who owes her in her head. Terms are Net 30, paid by ACH.

**Most wants to stop:** the hand-filled forms, the hand math, and the mental ledger.

## The Core Loop
1. **At a cafe (phone):** open Count, pick the cafe, see the last count in grey with its date, update it, save.
2. **In the kitchen before leaving (laptop):** open Deliver, pick the cafe. Its standing product list appears with prices and the latest shelf count beside each line. She enters quantities, totals compute, and she creates the invoice, prints it and emails it to the cafe.
3. **Later (phone):** open the Ledger to see who owes what, what's due, and what's overdue.

She comes back every delivery day. The count tells her what to bake and bring next time.

**Count and invoicing are separate jobs that never feed each other:**
- **Count** is for Eileen's planning only. It records what's on the shelf so she knows what to bake and bring.
- **Deliver and Invoice** record what she actually dropped off. She types the quantities in herself.
- The invoice never reads from a count, and a count never changes because of an invoice.
- The shelf count beside each Deliver line is greyed, glance-only reference. It never pre-fills the quantity field.

## Inspiration & Identity
- **Look:** her paper invoice come to life. White paper, black ink, one warm blush tint, dotted hairline rules, serif text.
- **Navigation:** four tabs along the bottom: Count, Deliver, Ledger, Customers. Every page has a small "?" that opens a plain-words How it works page. No icon appears without words she can read, and the send button says Send email or Send again, never "Resend". She is never on a page with no way back: the Invoice screen keeps the tabs and a "Back to Ledger" link, sheets close with Cancel or the phone's back button, and Download PDF never navigates the tab away.
- **Devices:** Count and Ledger are phone screens, used standing in a cafe. Deliver and Invoice are laptop screens, used in the kitchen.
- **Fidelity:** the printed invoice matches her existing Canva form exactly.
- **References:** the learner has Stitch mockups of all five screens, coming in `3-prd`. Eileen's Canva invoice form is the fidelity reference.

## Why This Matters to the Learner
- It's a real tool for a real person. "Cuenta working for Eileen is the proof it worked."
- It's a test of their learning goal: a plan sharp enough that the build lands at 100% of what they imagined, with the leftovers caught on paper first.

## What "Working" Looks Like
**Hackathon done:** a judge can follow the four-step path on the deployed URL with mock data, under three minutes, and every step works.
1. Count screen, pick Corazon Cocina. The last count shows in grey with its date under each product. Enter two numbers and save.
2. New delivery for Corazon Cocina. The standing list shows prices and the latest shelf count beside each line. Enter quantities, totals compute live, create the invoice.
3. The invoice matches her Canva form, with its invoice number (location code + date) and today's date. Print opens the browser dialog. Send email, check the Email pop-up, tap Send email, and "Last sent" shows on it, with a real send on camera.
4. On the Ledger, the new invoice shows as unpaid, due in 30 days, and the month total updates.

**The "oh, that's cool" moment:** the printed invoice looks exactly like the paper one, and the email really arrives.

**Project done (after submission):** Eileen completes one real delivery without the learner: count on her phone, invoice printed in the kitchen, one emailed to the cafe, ledger updated.

## The POC Boundary
- **Login:** a single six-digit PIN gate with attempt limiting (5 wrong tries per IP, or 20 overall, in 15 minutes lock it for 15 minutes).
- **Data:** Products and Customers, each cafe with a standing product list, a location code, and an optional seeded logo. Mock seed data only in the repo. The Customers tab is read-only for the hackathon.
- **Count:** per cafe, with the last count and its date shown in grey beside blank steppers, plus a read-only Past counts list.
- **Delivery:**
  - totals in integer cents
  - invoice numbers as text, location code + MMDDYYYY, suggested and overwritable, unique
  - edit and void (never delete)
  - quantities typed in by Eileen
  - the latest shelf count beside each line, greyed and reference only, never pre-filling the quantity
  - the invoice never reads from a count, and a count never changes because of an invoice
- **Invoice:** template matched to the Canva form, including the cafe's logo when it has one; print CSS fitting one letter page; PDF.
- **Email:** real send via Resend with the PDF attached.
  - From invoices@lacondesabakingcompany.com, Reply-To Eileen's Gmail.
  - The domain isn't a gate on the email build. Until it verifies, sends go from Resend's onboarding sender to the learner's inbox. Switching to the real From and Reply-To is an env change in the build's final polish slice (checklist slice 8, before submission; not Block 8 Handoff). DNS records go in at her registrar, and an existing SPF record gets merged, not replaced.
  - The test send goes to the learner's inbox.
- **Ledger:**
  - paid or unpaid, with the paid date and an optional ACH reference
  - due dates (Net 30) and overdue
  - month totals
  - filter by cafe
- **Polish:** mobile pass, error and empty states, a mock-data audit, deployed to Vercel.

## Later
- **Block 8, Handoff (after the video and the tagged submission), in the same production deployment and database:** back up the mock data with a Neon branch snapshot, seed her real data from the gitignored `private/` file, rotate `APP_PIN`, then hand her the URL (on her phone's home screen). Eileen runs the path herself as the acceptance test. The full order is in `checklist.md > Block 8: Handoff`.
  - in-app editing of Products, Customers and standing lists; the email-template editor; the full printed/emailed history line
- Stripe or other payments
- Multi-user login
- Low-stock alerts
- Bake list
- Ledger export to Excel, respecting the cafe filter and a date range
- Accounts receivable aging report (current, 1–30, 31–60, 61–90, over 90 days; per cafe and total; PDF or Excel)
- Overdue reminders: a daily job finds unpaid, past-due invoices and emails Eileen one list with a single signed link to send the reminders (ask-first; fully automatic per cafe is a later toggle)
- Per-cafe logo *upload* (seeded logos are in now)
- A separate demo deployment with mock data, only when a second customer wants a look. Until then, Handoff turns the one production deployment into Eileen's.

## Explicitly Cut
- **Ingredient tracking and recipe costing:** a different product. Cuenta is about the route and the paperwork.
- **Accounting and tax:** out of scope. The Ledger only tracks who owes what.
- **Model-generated prices, totals, dates, invoice numbers or email text:** the app is deterministic. The AI is in how it's built, not inside it.
- **Inventory decrement on delivery:** shelf counts are observed at the cafe, not calculated.
- **Real customer data in the repo:** mock data only. Real data goes in at Handoff from a gitignored file.

## Changes Since Approval
- **During `5-build` (learner-directed):** a How it works page behind a "?" on every page, the "no icon without words" rule, and Send email / Send again replacing "Resend". Excel export and an aging report were added to Later.
- **During `5-build` (learner-directed):** the PIN gate hardened to six digits with attempt limiting, because four digits with no lockout was 10,000 guesses with no brake on a public URL. Navigation rules pinned for the phone. Overdue reminders added to Later.
- **During `5-build` (learner-directed):** a read-only Past counts list on Count, since Eileen looks back through a paper book of counts today and will ask for it on day one. Built in the final polish slice, not Handoff.
- **During `5-build` (learner-directed):** Resend domain verification is no longer a gate on email. The sender lives in env, and the switch happens in the final polish slice.
- **During `3-prd` (learner-directed):** Alma replaces Corazon Cocina Ventura as the fourth account. Invoice numbers changed to Eileen's location-code + date scheme. Seeded per-cafe logos moved into the POC. The Customers tab is read-only until Handoff.
