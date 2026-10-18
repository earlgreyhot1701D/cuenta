// Job: the "How it works" page: what each screen is for and what each button does, using the buttons' exact words.
import styles from "./help.module.css";

export const metadata = { title: "How it works · Cuenta" };

const SECTIONS = [
  {
    id: "count",
    title: "Count",
    what: "For counting what's still on a cafe's shelf, so you know what to bake and bring. A count never changes an invoice.",
    items: [
      ["The cafe cards", "Pick the cafe you're standing in. Cuenta remembers the last one you counted."],
      ["− and +", "Change a number, or type it. Every box starts empty, and − on an empty box records 0."],
      ["The grey line", "\"last counted Oct 9: 3\" is what you saved last time, for reference."],
      ["Save count", "Saves only the rows you filled in, dated today. Rows you left empty keep their old count."],
      ["Past counts", "Every earlier count for this cafe, newest day first. It's read-only, like your paper book."],
      ["Leaving with numbers typed", "Picking another cafe or tapping the menu at the bottom asks before your unsaved numbers are thrown away."],
    ],
  },
  {
    id: "deliver",
    title: "Deliver",
    what: "For building an invoice from what you dropped off at a cafe.",
    items: [
      ["The cafe cards", "Pick the cafe. Your menu appears, the same for every cafe, with prices and that cafe's latest shelf count in grey."],
      ["Date", "The delivery date. It's today unless you change it."],
      ["Invoice #", "Filled in for you: the cafe's number and the date. Type over it if you need to, such as adding -2 for a second delivery the same day."],
      ["Price and Qty", "Type how many you delivered. You can change a price for this invoice only; it never changes the product."],
      ["+ Add special order", "Adds a line that isn't one of your usual products, such as a birthday cake. Type what it is, the price and how many. It prints like any other line and never becomes a product. Remove takes it off."],
      ["Create invoice", "Saves the invoice and opens the Invoice page. It stays grey until at least one quantity is filled in."],
    ],
  },
  {
    id: "invoice",
    title: "Invoice page",
    what: "Your paper invoice, filled in. Only the products you delivered are on it.",
    items: [
      ["← Back to Ledger", "Returns to the Ledger."],
      ["Print", "Opens your printer's window; the button reads Opening print… while it comes up. It prints one page, exactly like the paper form. Cancel leaves you here."],
      ["Download PDF", "Saves the same PDF the email sends, for your records. This page stays open."],
      ["Send email", "Opens the Email pop-up. After a send, it reads Send again, and a grey line says \"Last sent Oct 17, 8:12pm\"."],
      ["Edit", "Opens the invoice to change quantities, prices, special orders, the date or the number. It shows the prices saved on the invoice, not today's. Save changes updates the invoice and the Ledger. To bill a different cafe, void it and make a new one."],
      ["Void", "Asks once, then stamps the invoice VOID. It stays in the Ledger, crossed out, and counts in no total. Its number stays taken. A void invoice can still be printed or downloaded, but not edited or emailed."],
    ],
  },
  {
    id: "email",
    title: "Email pop-up",
    what: "For emailing the invoice PDF to the cafe. You check it and tap one button.",
    items: [
      ["To", "Filled in from the cafe's saved email. Change it for this one send if needed; the saved email doesn't change. If it's empty, type an address. Send stays grey until there is one."],
      ["Show full email", "Shows the whole message. It's written for you: the cafe, the total and the due date."],
      ["Send email (or Send again)", "Sends it with the PDF attached. The button reads Sending… for the few seconds it takes; then the pop-up closes and the Invoice page shows when it was sent."],
      ["Try again", "Appears if a send failed. The invoice is already saved, so nothing is lost. You can also print it instead."],
      ["Cancel", "Closes the pop-up without sending. Your phone's back button does the same."],
    ],
  },
  {
    id: "ledger",
    title: "Ledger",
    what: "Who owes you what, and what's late. Newest delivery first.",
    items: [
      ["Open, Outstanding, This month", "How many invoices are unpaid, how much is unpaid in total, and how much you delivered this month (paid or not). Voided invoices don't count."],
      ["All and the cafe names", "Show every cafe, or just one. The numbers above follow your choice."],
      ["Unpaid", "Opens the pop-up to record a payment: the date it arrived and an optional reference, such as the ACH confirmation. Then Mark paid."],
      ["Paid Oct 20", "Shows when it was paid. Tap it, then Mark unpaid and Yes, mark unpaid, to undo a mistake."],
      ["Emailed Oct 17 / Not sent", "Whether the invoice was emailed. Point at it on a laptop to see the exact time."],
      ["overdue 9 days", "Shown in rose, with a thin line on the left, once an unpaid invoice is past its 30 days."],
      ["Tap a row", "Opens that invoice."],
      ["Crossed out with Void", "A voided invoice. It's kept for your records and left out of the numbers above."],
    ],
  },
  {
    id: "customers",
    title: "Customers",
    what: "Your menu, and each cafe's details. Read-only for now.",
    items: [
      ["Menu", "Your products and prices, the same for every cafe."],
      ["The cafe cards", "Phone, address, billing email (the one the Email pop-up fills in) and Net 30 terms."],
    ],
  },
];

export default function HelpPage() {
  return (
    <article className={styles.help}>
      <h1>How it works</h1>
      <nav className={styles.toc} aria-label="Sections">
        {SECTIONS.map((s) => (
          <a key={s.id} href={`#${s.id}`} className="label">
            {s.title}
          </a>
        ))}
      </nav>
      {SECTIONS.map((s) => (
        <section key={s.id} id={s.id} className={styles.section}>
          <h2>{s.title}</h2>
          <p className={styles.what}>{s.what}</p>
          <dl className={styles.items}>
            {s.items.map(([term, text]) => (
              <div key={term} className={styles.item}>
                <dt>{term}</dt>
                <dd>{text}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </article>
  );
}
