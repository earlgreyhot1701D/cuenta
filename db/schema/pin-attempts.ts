// Job: define the wrong-PIN and lockout record used for attempt limiting.
import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const pinAttempts = pgTable(
  "pin_attempts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    kind: text("kind", { enum: ["fail", "lock"] }).notNull(),
    ip: text("ip"),
    at: timestamp("at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("pin_attempts_kind_at_idx").on(t.kind, t.at)],
);
