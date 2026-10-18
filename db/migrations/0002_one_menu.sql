ALTER TABLE "products" ADD COLUMN "sort" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
-- Menu order comes from the longest standing list (the cafe that carries every product), before that table goes.
UPDATE "products" p SET "sort" = s."position" FROM (
	SELECT DISTINCT ON (si."product_id") si."product_id", si."position"
	FROM "standing_items" si
	JOIN (SELECT "customer_id", count(*) AS n FROM "standing_items" GROUP BY "customer_id") sizes ON sizes."customer_id" = si."customer_id"
	ORDER BY si."product_id", sizes.n DESC, si."customer_id"
) s WHERE s."product_id" = p."id";--> statement-breakpoint
DROP TABLE "standing_items" CASCADE;
