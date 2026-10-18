// Job: show each cafe's details, logo and standing list with prices, read-only.
import { formatUSD } from "@/lib/money";
import { listCustomers } from "@/lib/queries/customers";
import { standingProducts } from "@/lib/queries/products";
import styles from "./customers.module.css";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const customers = await listCustomers();
  const cafes = await Promise.all(customers.map(async (c) => ({ ...c, products: await standingProducts(c.id) })));

  return (
    <>
      <h1>Customers</h1>
      <p className="quiet">Read-only. Changes go through the seed file for now.</p>
      {cafes.length === 0 && <p className="quiet">No cafes yet.</p>}
      <ul className={styles.list}>
        {cafes.map((cafe) => (
          <li key={cafe.id} className={styles.card}>
            <div className={styles.head}>
              <div>
                <p className={`label muted ${styles.code}`}>Location {cafe.code}</p>
                <h2 className={styles.name}>{cafe.name}</h2>
              </div>
              {cafe.logoPath && (
                // eslint-disable-next-line @next/next/no-img-element
                <img className={styles.logo} src={cafe.logoPath} alt={`${cafe.name} logo`} />
              )}
            </div>

            <dl className={styles.details}>
              <div>
                <dt className="label">Phone</dt>
                <dd>{cafe.phone}</dd>
              </div>
              <div>
                <dt className="label">Address</dt>
                <dd>
                  {cafe.addressLines.map((line) => (
                    <span key={line} className={styles.line}>
                      {line}
                    </span>
                  ))}
                </dd>
              </div>
              <div>
                <dt className="label">Billing email</dt>
                <dd className={styles.email}>{cafe.billingEmail ?? <span className="quiet">No email on file</span>}</dd>
              </div>
              <div>
                <dt className="label">Terms</dt>
                <dd>Net 30</dd>
              </div>
            </dl>

            <p className={`label ${styles.listTitle}`}>Standing list</p>
            <table className={styles.products}>
              <thead>
                <tr>
                  <th className="label muted">Description</th>
                  <th className="label muted">Price</th>
                </tr>
              </thead>
              <tbody>
                {cafe.products.map((p) => (
                  <tr key={p.productId}>
                    <td>{p.name}</td>
                    <td>{formatUSD(p.priceCents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </li>
        ))}
      </ul>
    </>
  );
}
