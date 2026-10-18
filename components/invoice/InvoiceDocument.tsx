// Job: render Eileen's Canva invoice form from a saved snapshot, positioned in PDF points.
import { Limelight } from "next/font/google";
import type { Business } from "@/lib/business";
import { INVOICE_FIRST_LINE_TOP, linePitch } from "@/lib/invoice-capacity";
import { formatUSD, lineTotal, sumCents } from "@/lib/money";
import styles from "./InvoiceDocument.module.css";

const limelight = Limelight({ weight: "400", subsets: ["latin"], display: "block" });

export type InvoiceSnapshot = {
  number: string;
  invoiceDate: string;
  cafeName: string;
  cafePhone: string;
  cafeAddressLines: string[];
  cafeLogoPath: string | null;
  lines: { id: string; description: string; unitPriceCents: number; quantity: number }[];
};

/** One PDF point (1/72 inch) on a Letter page, whatever size the page is drawn at. */
const pt = (n: number) => `calc(var(--pt) * ${n})`;

/** "10/17/2026" from YYYY-MM-DD. */
function formatInvoiceDate(ymd: string): string {
  const [y, m, d] = ymd.split("-");
  return `${m}/${d}/${y}`;
}

export function InvoiceDocument({ invoice, business }: { invoice: InvoiceSnapshot; business: Business }) {
  const lines = invoice.lines.filter((l) => l.quantity > 0);
  const pitch = linePitch(lines.length);
  const total = sumCents(lines.map((l) => lineTotal(l.unitPriceCents, l.quantity)));

  return (
    <div className={styles.page} data-invoice-page>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className={styles.abs} src="/invoice/wordmark.png" alt="La Condesa Baking Company"
        style={{ left: pt(94), top: pt(52), width: pt(197) }} />
      <div className={`${styles.abs} ${styles.invoiceWord} ${limelight.className}`} style={{ left: pt(390), top: pt(52.8) }}>
        INVOICE
      </div>

      <div className={`${styles.abs} ${styles.forLabel}`} style={{ left: pt(83), top: pt(140) }}>Invoice for:</div>
      <div className={`${styles.abs} ${styles.cafeName}`} style={{ left: pt(81), top: pt(161) }}>{invoice.cafeName}</div>
      <div className={`${styles.abs} ${styles.cafeLines}`} style={{ left: pt(82), top: pt(180) }}>
        <div>{invoice.cafePhone}</div>
        {invoice.cafeAddressLines.map((line) => (
          <div key={line}>{line}</div>
        ))}
      </div>
      {invoice.cafeLogoPath && (
        // eslint-disable-next-line @next/next/no-img-element
        <img className={`${styles.abs} ${styles.logo}`} src={invoice.cafeLogoPath} alt=""
          style={{ left: pt(272), top: pt(131), width: pt(55), height: pt(91) }} />
      )}

      <div className={`${styles.abs} ${styles.metaLabel}`} style={{ left: pt(370), top: pt(127) }}>
        Invoice # <span className={styles.metaValue}>{invoice.number}</span>
      </div>
      <div className={`${styles.abs} ${styles.metaLabel}`} style={{ left: pt(370), top: pt(180) }}>
        Date: <span className={styles.metaValue}>{formatInvoiceDate(invoice.invoiceDate)}</span>
      </div>

      {/* eslint-disable @next/next/no-img-element */}
      <img className={styles.abs} src="/invoice/header-description.png" alt="Description" style={{ left: pt(82), top: pt(283), width: pt(73.9) }} />
      <img className={styles.abs} src="/invoice/header-qty.png" alt="Qty" style={{ left: pt(303), top: pt(283), width: pt(25.4) }} />
      <img className={styles.abs} src="/invoice/header-price.png" alt="Price" style={{ left: pt(398), top: pt(283), width: pt(31.9) }} />
      <img className={styles.abs} src="/invoice/header-total.png" alt="Total" style={{ left: pt(472), top: pt(283), width: pt(41) }} />
      {/* eslint-enable @next/next/no-img-element */}
      <div className={`${styles.abs} ${styles.rule}`} style={{ left: pt(82), top: pt(304), width: pt(447) }} />

      {lines.map((line, i) => (
        <div key={line.id} className={`${styles.abs} ${styles.line}`} style={{ top: pt(INVOICE_FIRST_LINE_TOP + i * pitch) }}>
          <span style={{ left: pt(82) }}>{line.description}</span>
          <span className={styles.center} style={{ left: pt(315.7) }}>{line.quantity}</span>
          <span className={styles.center} style={{ left: pt(414) }}>{formatUSD(line.unitPriceCents)}</span>
          <span className={styles.center} style={{ left: pt(492.5) }}>{formatUSD(lineTotal(line.unitPriceCents, line.quantity))}</span>
        </div>
      ))}

      <div className={`${styles.abs} ${styles.rule}`} style={{ left: pt(78), top: pt(500), width: pt(449) }} />
      <div className={`${styles.abs} ${styles.totalLabel}`} style={{ left: pt(313), top: pt(522) }}>
        INVOICE TOTAL&nbsp;&nbsp;$ <span className={styles.totalValue}>{formatUSD(total).slice(1)}</span>
      </div>

      <div className={`${styles.abs} ${styles.contact}`} style={{ left: pt(37.4), top: pt(533), width: pt(233.6), height: pt(138) }} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className={styles.abs} src="/invoice/footer-title.png" alt="La Condesa Baking Company"
        style={{ left: pt(43), top: pt(554), width: pt(221) }} />
      <div className={`${styles.abs} ${styles.contactText}`} style={{ left: pt(37.4), top: pt(574), width: pt(233.6) }}>
        <div className={styles.chef}>{business.chefLine}</div>
        {business.addressLines.map((line, i) => (
          <div key={line}>{i === 0 ? `Kitchen: ${line}` : line}</div>
        ))}
        <div className={styles.contactPhone}>{business.phone}</div>
        <div>{business.email}</div>
      </div>

      <div className={`${styles.abs} ${styles.received}`} style={{ left: pt(313), top: pt(655) }}>
        Order received by: <span className={styles.blank} />
      </div>

      <div className={`${styles.abs} ${styles.terms}`} style={{ left: 0, width: "100%", top: pt(723) }}>
        <div>Payment Terms: Net 30 - Due in full within 30 days of invoice date,</div>
        <div className={styles.thanks}>Thank You!</div>
      </div>
    </div>
  );
}
