-- profiles
create table profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  job_title text not null,
  job_title_other text,
  hobbies text[] default '{}',
  interests text[] default '{}',
  current_mode text not null,
  notify_time text default '21:00',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- questions
create table questions (
  id serial primary key,
  text text not null,
  metric_effects jsonb not null,  -- { "exploration": 1, "vitality": -1 }
  weight float not null default 0.8
);

-- diagnostics
create table diagnostics (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) not null,
  date date not null,
  answers jsonb not null,           -- QuestionAnswer[]
  exploration float not null,
  immersion float not null,
  organization float not null,
  contribution float not null,
  vitality float not null,
  dominant_metric text not null,
  created_at timestamptz default now(),
  unique(profile_id, date)          -- 1日1レコード
);

-- tasks
create table tasks (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) not null,
  diagnostic_id uuid references diagnostics(id) not null,
  title text not null,
  description text not null,
  level text not null,              -- quick / core / deep
  category text not null,           -- 探索系 / 集中系 / 実行系 / 休息系
  action_timing text not null,      -- night / morning / auto
  status text default 'pending',    -- pending / applied / expired
  expires_at timestamptz not null,  -- created_at + 24時間
  completed_at timestamptz,
  created_at timestamptz default now()
);
