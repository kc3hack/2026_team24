# Desire Trigger — Backend 実装仕様書 (v2)

> FE担当者はこのドキュメントを参照して関数を呼び出してください。
> BE担当者はこのドキュメントに従って実装してください。

---

## 1. 共通型定義（`types/index.ts`）

```typescript
export type UserId = string
export type ISODateString = string // "2026-02-18"

// ─── 5指標 ───────────────────────────────────────────

export type MetricKey =
  | 'exploration'   // 探索
  | 'immersion'     // 没頭
  | 'organization'  // 整理
  | 'contribution'  // 貢献
  | 'vitality'      // 元気

export type Metrics = {
  exploration: number   // 0〜100
  immersion: number     // 0〜100
  organization: number  // 0〜100
  contribution: number  // 0〜100
  vitality: number      // 0〜100
}

// ─── プロフィール ───────────────────────────────────

export type JobTitle =
  | 'Frontend' | 'Backend' | 'Infra'
  | 'ML/Data' | 'Mobile' | 'Student' | 'Other'

export type CurrentMode = '成長期' | '維持期' | '停滞期'

export type Profile = {
  id: UserId
  name: string
  job_title: JobTitle
  job_title_other?: string   // Otherの場合のフリー入力
  hobbies: string[]          // 複数選択+その他入力
  interests: string[]        // 複数選択+その他入力
  current_mode: CurrentMode  // ユーザーには知らせない（初期パラメータ計算に使う）
  notify_time: string        // "21:00"
  created_at: ISODateString
  updated_at: ISODateString
}

export type OnboardingInput = Omit<Profile, 'id' | 'created_at' | 'updated_at'>

// ─── 診断 ───────────────────────────────────────────

export type QuestionAnswer = {
  question_id: number
  answer: boolean   // true=YES(右スワイプ) / false=NO(左スワイプ)
  strength: number  // 0〜100 (SYNC STRENGTH)
}

export type Diagnostic = Metrics & {
  id: string
  profile_id: UserId
  date: ISODateString
  answers: QuestionAnswer[]
  dominant_metric: MetricKey  // 5指標の中の最大値（カレンダー色に使う）
  created_at: ISODateString
}

// ─── 質問 ───────────────────────────────────────────

export type Question = {
  id: number
  text: string
  metric_effects: Partial<Metrics>  // 例: { exploration: 1, vitality: -1 }
  weight: number                    // 0〜1の係数
}

// ─── タスク ─────────────────────────────────────────

export type TaskLevel = 'quick' | 'core' | 'deep'
export type TaskCategory = '探索系' | '集中系' | '実行系' | '休息系'
export type ActionTiming = 'night' | 'morning' | 'auto'
export type TaskStatus = 'pending' | 'applied' | 'expired'

export type Task = {
  id: string
  profile_id: UserId
  diagnostic_id: string
  title: string
  description: string
  level: TaskLevel
  category: TaskCategory
  action_timing: ActionTiming   // ユーザーが選んだ「いつやるか」
  status: TaskStatus
  expires_at: ISODateString     // 生成から24時間後
  completed_at: ISODateString | null
  created_at: ISODateString
}

// ─── 履歴画面用 ─────────────────────────────────────

export type HistoryDay = {
  date: ISODateString
  diagnostic: Diagnostic | null
  tasks: Task[]
  dominant_metric: MetricKey | null
}
```

---

## 2. Supabase テーブル定義（SQL）

```sql
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
```

---

## 3. `supabase/profiles.ts`

```typescript
// オンボーディングのデータを保存 → profile_idを返す
export async function saveProfile(data: OnboardingInput): Promise<string>

// profile_idでプロフィールを取得
export async function getProfile(profileId: string): Promise<Profile>

// 設定画面から更新（job_title / notify_time）
export async function updateProfile(profileId: string, data: Partial<Profile>): Promise<void>
```

---

## 4. `supabase/questions.ts`

```typescript
// 全質問を取得
export async function fetchQuestions(): Promise<Question[]>
```

---

## 5. `supabase/diagnostics.ts`

```typescript
// 診断結果を保存 → diagnostic_idを返す（Edge Function呼び出しに使う）
export async function saveDiagnostic(
  profileId: string,
  metrics: Metrics,
  answers: QuestionAnswer[],
  dominantMetric: MetricKey
): Promise<string>

// 今日の診断があるか確認（診断済み判定・ホーム画面）
export async function getTodayDiagnostic(profileId: string): Promise<Diagnostic | null>

// 最新の診断を取得（分析画面のレーダーチャート用）
export async function getLatestDiagnostic(profileId: string): Promise<Diagnostic | null>

// 月単位で取得（履歴カレンダー用）
export async function getCalendarData(
  profileId: string,
  year: number,
  month: number
): Promise<{ date: string; dominant_metric: MetricKey }[]>

// 特定日の診断を取得（履歴詳細用）
export async function getDiagnosticByDate(profileId: string, date: string): Promise<Diagnostic | null>

// 推移グラフ用（分析画面）
export async function getDiagnosticHistory(profileId: string): Promise<Diagnostic[]>
```

---

## 6. `supabase/tasks.ts`

```typescript
// 有効期限内のタスクを取得（行動画面・ホームサマリー用）
export async function fetchTodayTasks(profileId: string): Promise<Task[]>

// タスク完了
export async function completeTask(taskId: string): Promise<void>

// 特定日の完了済みタスクを取得（履歴詳細用）
export async function fetchTasksByDate(profileId: string, date: string): Promise<Task[]>
```

---

## 7. Edge Function: `generateTasks`

### リクエスト

```typescript
type GenerateTasksRequest = {
  profile_id: string
  diagnostic_id: string
  timing: ActionTiming
  task_levels: 'quick/quick/quick' | 'quick/core/core' | 'core/deep/deep'  // FEで計算して渡す
  profile: {
    job_title: string
    hobbies: string[]
    interests: string[]
  }
  metrics: Metrics
}
```

### task_levelsの計算ロジック（FE側: `lib/taskUtils.ts`）

```typescript
export const getTaskLevels = (metrics: Metrics): string => {
  const { vitality, exploration, immersion } = metrics
  if (vitality < 20) return 'quick/quick/quick'
  if (vitality <= 70) return 'quick/core/core'
  if (vitality > 70 && (exploration > 60 || immersion > 60)) return 'core/deep/deep'
  return 'quick/core/core'
}
```

### APIキーフォールバック

```typescript
// supabase/functions/generateTasks/index.ts
const API_KEYS = [
  Deno.env.get('OPENAI_API_KEY_1'),
  Deno.env.get('OPENAI_API_KEY_2'),
]

async function callWithFallback(prompt: string): Promise<TaskResult[]> {
  for (const key of API_KEYS) {
    if (!key) continue
    try {
      return await callOpenAI(key, prompt)  // gpt-4o-mini
    } catch (e) {
      continue
    }
  }
  // 全OpenAIキーが失敗したらClaudeへ
  return await callClaude(Deno.env.get('ANTHROPIC_API_KEY')!, prompt)
}
```

### プロンプト設計

```
あなたはITエンジニアのメンタルコーチです。
以下の状態に基づいて、最適なタスクを3つ提案してください。

【エンジニア情報】
職種: {job_title}
趣味: {hobbies}
興味分野: {interests}

【今日のメンタル状態】
探索: {exploration}/100
没頭: {immersion}/100
整理: {organization}/100
貢献: {contribution}/100
元気: {vitality}/100

【実行タイミング】
{timing}:
  night   → 今夜実行できるタスク（静かにできるもの）
  morning → 明日の朝のタスク（出社前・通勤中向き）
  auto    → 時間帯を問わないタスク

【タスクのレベル構成（必ずこの順番で3つ生成）】
{task_levels}
例: quick/core/deep → 1枚目はquick、2枚目はcore、3枚目はdeep

levelの基準:
- quick: 5分以内
- core: 15〜30分
- deep: 30〜60分

以下のJSON形式のみで返してください（前置き・説明不要）:
[
  {
    "title": "タスクタイトル（15文字以内）",
    "description": "なぜこのタスクか（2〜3文、スコアに言及する）",
    "level": "quick" | "core" | "deep",
    "category": "探索系" | "集中系" | "実行系" | "休息系"
  }
]
```

### レスポンス

```typescript
type GenerateTasksResponse = {
  success: boolean
  task_ids: string[]
}
```

---

## 8. 環境変数（`.env`）

```
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=xxx

# Edge Function用（Supabaseダッシュボードで設定）
OPENAI_API_KEY_1=sk-xxx
OPENAI_API_KEY_2=sk-xxx
ANTHROPIC_API_KEY=sk-ant-xxx
```

---

## 9. FEとBEの境界

| 処理 | 担当 | ファイル |
|------|------|----------|
| パラメータ計算（strength×weight×effects） | FE | `lib/calcParameters.ts` |
| dominant_metric計算 | FE | `lib/calcParameters.ts` |
| パラメータ文言・Advice出し分け | FE | `lib/calcParameters.ts` |
| task_levels計算 | FE | `lib/taskUtils.ts` |
| タスク期限切れ判定（expires_at - now） | FE | `lib/taskUtils.ts` |
| ストリーク計算 | FE | `lib/calcStreak.ts` |
| 時間帯によるtiming選択肢出し分け | FE | 画面コンポーネント内 |
| 通知スケジュール | FE | `hooks/useNotification.ts` |
| DB操作（SELECT/INSERT/UPDATE） | BE | `supabase/` |
| AIタスク生成 | BE | Edge Function |

---

## 10. 画面別の呼び出しフロー

```
タイトル
└── initUser() → profile_idの有無で分岐

初期セットアップ
└── saveProfile() → AsyncStorageにprofile_id保存

ホーム（2回目以降）
├── getProfile()
├── getTodayDiagnostic()
├── getLatestDiagnostic()  ← 診断済みの場合
└── fetchTodayTasks()      ← 診断済みの場合

質問
├── fetchQuestions()
├── calcParameters()       ← ローカル計算
├── getDominantMetric()    ← ローカル計算
└── saveDiagnostic()       → diagnostic_id取得

タイミング選択
└── 時間帯から選択肢出し分け（FEロジック）

レーダーチャート表示（DB不要、calcParametersの結果をそのまま表示）
└── 同時にバックグラウンドでEdge Function実行
    └── generateTasks(profile + metrics + timing + task_levels + diagnostic_id)

タスク表示
└── Edge Function完了後にtask_ids取得 → fetchTodayTasks()

分析
├── getLatestDiagnostic()
├── getDiagnosticHistory()
└── getParameterComment()  ← ローカル（FE）

行動
├── fetchTodayTasks()
└── completeTask()

履歴
├── getCalendarData(year, month)
├── getDiagnosticByDate(date)
└── fetchTasksByDate(date)

設定（モーダル）
├── getProfile()
└── updateProfile()
```
