// types/index.ts

// ─── 共通 ──────────────────────────────────────────

export type UserId = string
export type ISODateString = string // "2026-02-17"

// ─── 5指標 ─────────────────────────────────────────

export type MetricKey =
    | 'exploration'   // 探索
    | 'immersion'     // 没頭
    | 'organization'  // 整理
    | 'contribution'  // 貢献
    | 'vitality'      // 元気

export type Metrics = {
    exploration: number   // 0-100
    immersion: number     // 0-100
    organization: number  // 0-100
    contribution: number  // 0-100
    vitality: number      // 0-100
}

export type MetricDeltas = {
    exploration_delta: number   // -20~+20
    immersion_delta: number
    organization_delta: number
    contribution_delta: number
    vitality_delta: number
}

// 日記補正後の最終値（レーダーチャートはこれを使う）
export type ComputedMetrics = Metrics & {
    hasDiaryAdjustment: boolean  // 日記補正があるかどうか（分析画面の「日記補正 +10%」表示に使う）
}

// ─── プロフィール ───────────────────────────────────

export type AgeGroup = '10代' | '20代' | '30代' | '40代以上'
export type JobTitle = 'Frontend' | 'Backend' | 'Infra' | 'ML/Data' | 'Mobile' | 'Student'
export type Experience = 'Junior' | 'Middle' | 'Senior' | 'Lead'
export type Lifestyle = '学生' | '社会人' | 'フリーランス'
export type CurrentMode = '成長期' | '維持期' | '停滞期'

export type Profile = {
    id: UserId
    age_group: AgeGroup
    job_title: JobTitle
    experience: Experience
    lifestyle: Lifestyle
    current_mode: CurrentMode
    interests: string[]         // 興味分野（複数選択）
    tech_stack: string[]        // よく使う技術（複数選択）
    working_start: string       // "09:00"
    working_end: string         // "18:00"
    notify_time: string         // "21:00"
    weekday_free_hours: number
    weekend_free_hours: number
    created_at: ISODateString
    updated_at: ISODateString
}

// 初回セットアップ用（全項目が揃ってない状態を扱う）
export type OnboardingProfile = Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>

// ─── 診断 ───────────────────────────────────────────

export type QuestionAnswer = {
    question_id: number
    answer: boolean  // スワイプ right=true / left=false
}

// 完了したタスクのバフが診断に適用された記録
export type AppliedBuff = {
    task_id: string
    deltas: MetricDeltas
}

export type Diagnostic = Metrics & {
    id: string
    user_id: UserId
    date: ISODateString
    answers: QuestionAnswer[]
    applied_task_buffs: AppliedBuff[]  // 前日タスク完了で適用されたバフ一覧
    created_at: ISODateString
}

// ─── 日記 ───────────────────────────────────────────

export type DiaryEntry = MetricDeltas & {
    id: string
    user_id: UserId
    diagnostic_id: string | null
    date: ISODateString
    content: string
    ai_prompt: string | null
    emotion_tags: string[]      // ['#焦燥感', '#達成感']
    created_at: ISODateString
}

// ─── タスク ─────────────────────────────────────────

// ─── タスク ─────────────────────────────────────────

export type TaskMode =
    | 'EXPLORATION'  // 探索モード（青）
    | 'IMMERSION'    // 没頭モード（緑）
    | 'ORGANIZATION' // 整理モード（紫）
    | 'CONTRIBUTION' // 貢献モード（オレンジ）
    | 'REST';        // 休息モード（シアン）

export type TaskTimingTag = '朝' | '移動中' | '夜' | '休日'   // 行動画面のフィルタ・通知に使う
export type ActionTiming = 'night' | 'morning' | 'auto'       // ユーザーが診断後に選んだ実行タイミング
export type TaskStatus = 'pending' | 'applied' | 'expired'

export type Task = {
    id: string
    user_id: UserId
    diagnostic_id: string
    title: string
    description: string
    mode: TaskMode                    // New Mode
    timing_tag: TaskTimingTag         // 朝・移動中・夜・休日
    action_timing: ActionTiming       // ユーザーが選んだ「いつやるか」
    buff_metric: MetricKey            // バフをかける指標
    buff_delta: number                // バフの補正量（翌日の診断に適用）
    buff_expires_at: ISODateString    // 生成から24h
    task_expires_at: ISODateString    // 生成から2週間
    status: TaskStatus
    completed_at: ISODateString | null
    created_at: ISODateString

    // Requested Extensions for Action Screen
    buffValue?: number   // Alias for buff_delta
    expiresAt?: ISODateString // Alias for task_expires_at
    duration: number;                 // Estimated duration in minutes
    difficulty: 'QUICK' | 'CORE' | 'DEEP'; // Difficulty level
    isCompleted?: boolean; // Helper for UI state
}

// ─── 質問 ───────────────────────────────────────────

export type Question = {
    id: number
    text: string
    category: MetricKey
}

// ─── 履歴画面用 ─────────────────────────────────────

// カレンダー1マス分のデータ
export type HistoryDay = {
    date: ISODateString
    diagnostic: Diagnostic | null
    diary: DiaryEntry | null
    tasks: Task[]
    dominantMetric: MetricKey | null  // その日最も高い指標 → カレンダーの色決定に使う
}
