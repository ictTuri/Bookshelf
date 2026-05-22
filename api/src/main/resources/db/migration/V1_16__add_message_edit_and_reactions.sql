-- Add edited flag and reactions map to message table

ALTER TABLE message
    ADD COLUMN edited BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN reactions JSONB;
