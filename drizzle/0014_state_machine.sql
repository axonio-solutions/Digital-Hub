-- Remove 'draft' from request_status
ALTER TYPE request_status RENAME TO request_status_old;
CREATE TYPE request_status AS ENUM('open', 'fulfilled', 'cancelled');
ALTER TABLE spare_part_requests
  ALTER COLUMN status TYPE request_status
  USING status::text::request_status;
DROP TYPE request_status_old;

-- Add 'withdrawn' to quote_status
ALTER TYPE quote_status ADD VALUE 'withdrawn';

-- Add soft-delete columns
ALTER TABLE spare_part_requests ADD COLUMN deleted_at timestamp;
ALTER TABLE quotes ADD COLUMN deleted_at timestamp;
