-- Migrate 'withdrawn' quotes to 'rejected' before altering enum
UPDATE "quotes" SET "status" = 'rejected' WHERE "status" = 'withdrawn';

-- Recreate quote_status enum without 'withdrawn'
ALTER TYPE "public"."quote_status" RENAME TO "quote_status_old";
CREATE TYPE "public"."quote_status" AS ENUM('pending', 'accepted', 'rejected');
ALTER TABLE "quotes" ALTER COLUMN "status" TYPE "public"."quote_status" USING "status"::text::"public"."quote_status";
DROP TYPE "public"."quote_status_old";
