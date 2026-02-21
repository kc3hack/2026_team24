-- job_titleをtext[]に変更
ALTER TABLE profiles
ALTER COLUMN job_title TYPE text[] USING ARRAY[job_title];

-- job_title_otherカラムを削除
ALTER TABLE profiles
DROP COLUMN IF EXISTS job_title_other;
