-- Add advice column to diagnostics table
ALTER TABLE diagnostics ADD COLUMN IF NOT EXISTS advice jsonb;

-- Add comment
COMMENT ON COLUMN diagnostics.advice IS 'AI-generated advice based on diagnostic results';
