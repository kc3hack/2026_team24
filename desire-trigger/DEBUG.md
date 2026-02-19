# Debugging Guide (Desire Trigger)

## 🏗️ Supabase Local Development

Start the local Supabase stack:
```bash
npx supabase start
```

Stop the local stack:
```bash
npx supabase stop
```

Check status (API URL, keys, etc.):
```bash
npx supabase status
```

Apply database migrations:
```bash
npx supabase db reset
```

Get Types:
```bash
npx supabase gen types typescript --local > types/supabase.ts
```

## 🌐 Edge Functions

Serve functions locally:
```bash
npx supabase functions serve --no-verify-jwt
```

Invoke function locally:
```bash
curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/generate-tasks' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"name":"Functions"}'
```

## 📱 Expo (Frontend)

Start Expo in development mode:
```bash
npx expo start
```

Clear Metro bundler cache:
```bash
npx expo start -c
```

## 🔍 Common SQL Queries (Supabase Dashboard > SQL Editor)

### Check Profiles
```sql
select * from profiles order by created_at desc;
```

### Check Diagnostics (Today)
```sql
select * from diagnostics where date = current_date;
```

### Check Tasks
```sql
select * from tasks order by created_at desc;
```

### Reset User Data (Caution: deletes related data via cascade)
```sql
delete from profiles where id = 'USER_UUID';
```

## 🐛 Troubleshooting

### `Error: extensive_task_generation_failed`
- Check if Edge Function is running (`npx supabase functions serve`).
- Verify `OPENAI_API_KEY` in `.env` or Supabase secrets.

### `PostgrestError: new row violates row-level security policy`
- Check RLS policies on tables.
- Verify user authentication token.
