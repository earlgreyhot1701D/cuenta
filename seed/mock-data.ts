// Job: mock cafes with fake contacts, the real products and prices, and standing lists by slug.

export const mockProducts = [
  { slug: "strawberry-tres-leches", name: "Strawberry Tres Leches Cake", priceCents: 475 },
  { slug: "coconut-tres-leches", name: "Coconut Tres Leches Cake", priceCents: 475 },
  { slug: "coconut-rice-pudding", name: "Coconut Rice Pudding", priceCents: 375 },
  { slug: "pixie-flan", name: "Pixie Tangerine/Orange Flan", priceCents: 400 },
  { slug: "mexican-wedding-cookies", name: "Mexican Wedding Cookies", priceCents: 350 },
];

const PLACEHOLDER_LOGO = "/logos/placeholder.png";

// Mock cafes bill to one test inbox from .env.local (never committed); Alma stays without email on purpose.
const TEST_INBOX = process.env.SEED_BILLING_EMAIL || "billing@example.com";

export const mockCustomers = [
  {
    code: 1,
    name: "Corazon Cocina",
    phone: "(555) 555-0101",
    addressLines: ["38 Example Street, Stall 1", "Santa Barbara, CA 93101"],
    billingEmail: TEST_INBOX,
    logoPath: PLACEHOLDER_LOGO,
    sort: 1,
    standing: ["strawberry-tres-leches", "coconut-tres-leches", "coconut-rice-pudding", "pixie-flan", "mexican-wedding-cookies"],
  },
  {
    code: 2,
    name: "Little Heart Cafecito",
    phone: "(555) 555-0102",
    addressLines: ["109 Example Avenue", "Santa Barbara, CA 93101"],
    billingEmail: TEST_INBOX,
    logoPath: null,
    sort: 2,
    standing: ["mexican-wedding-cookies", "coconut-rice-pudding", "strawberry-tres-leches"],
  },
  {
    code: 3,
    name: "Alma",
    phone: "(555) 555-0103",
    addressLines: ["22 Example Lane", "Santa Barbara, CA 93103"],
    billingEmail: null,
    logoPath: null,
    sort: 3,
    standing: ["strawberry-tres-leches", "coconut-tres-leches", "mexican-wedding-cookies"],
  },
  {
    code: 4,
    name: "Corazon SUR",
    phone: "(555) 555-0104",
    addressLines: ["801 Example Road", "Carpinteria, CA 93013"],
    billingEmail: TEST_INBOX,
    logoPath: PLACEHOLDER_LOGO,
    sort: 4,
    standing: ["strawberry-tres-leches", "pixie-flan", "mexican-wedding-cookies", "coconut-tres-leches"],
  },
];

/** Earlier shelf counts, as days before the seed date. Alma is left uncounted on purpose. */
export const mockCounts = [
  { code: 1, slug: "strawberry-tres-leches", quantity: 3, daysAgo: 8 },
  { code: 1, slug: "coconut-tres-leches", quantity: 2, daysAgo: 8 },
  { code: 1, slug: "coconut-rice-pudding", quantity: 4, daysAgo: 8 },
  { code: 1, slug: "pixie-flan", quantity: 1, daysAgo: 8 },
  { code: 1, slug: "mexican-wedding-cookies", quantity: 6, daysAgo: 8 },
  { code: 2, slug: "mexican-wedding-cookies", quantity: 5, daysAgo: 4 },
  { code: 2, slug: "coconut-rice-pudding", quantity: 2, daysAgo: 4 },
  { code: 4, slug: "strawberry-tres-leches", quantity: 2, daysAgo: 6 },
  { code: 4, slug: "pixie-flan", quantity: 3, daysAgo: 6 },
];
