export interface Question {
    id: number;
    text: string;
    category: string;
}

export interface Score {
    recovery: number;
    recognition: number;
    security: number;
    challenge: number;
    stimulation: number;
    connection: number;
    creation: number;
}

export interface Action {
    id: number;
    title: string;
    description: string;
    duration: number;
    category: string;
    why: string;
}

export type PrimaryMetric = 'exploration' | 'immersion' | 'refactor' | 'contribution' | 'idle';

export interface HistoryLog {
    date: string; // ISO format "2026-02-18"
    dominantMetric: string; // 最も成長したパラメータ名
    hasQuestions: boolean;
    hasTasks: boolean;
    score: number; // 0-100
    // 後方互換性のため残す
    primaryMetric?: PrimaryMetric;
    metrics?: { [key: string]: number };
    tasksCompleted?: number;
    taskList?: Task[];
}

export interface Task {
    id: string;
    title: string;
    tag: string;
    time: string;
    color: 'Quick' | 'Core' | 'Deep';
    isCompleted: boolean;
}

export interface TaskSet {
    date: string; // YYYY-MM-DD
    tasks: Task[];
}

export interface Diary {
    id: string;
    date: string;
    content: string;
    mood: string;
}

export interface Profile {
    name: string;
    avatarUrl?: string;
    level: number;
    exp: number;
}

// ============================================
// Supabase Database Types
// ============================================

export type MetricKey = 'exploration' | 'immersion' | 'organization' | 'contribution' | 'vitality';

export interface Metrics {
    exploration: number;   // 0-100
    immersion: number;     // 0-100
    organization: number;  // 0-100
    contribution: number;  // 0-100
    vitality: number;      // 0-100
}

export type CurrentMode = '成長期' | '維持期' | '停滞期';

export interface DBProfile {
    id: string;
    name: string;
    job_title: string[];
    hobbies: string[];
    interests: string[];
    current_mode: CurrentMode;
    notify_time: string;
    created_at: string;
    updated_at: string;
}

export interface OnboardingInput {
    name: string;
    job_title: string[];
    hobbies: string[];
    interests: string[];
    current_mode: CurrentMode;
    notify_time: string;
}

export interface DBQuestion {
    id: number;
    text: string;
    metric_effects: Record<MetricKey, number>;  // { "exploration": 1, "vitality": -0.5 }
    weight: number;
}

export interface QuestionAnswer {
    question_id: number;
    question_text: string;
    direction: 'yes' | 'no';
    swipe_value: number;  // 1-100
}

export interface Diagnostic {
    id: string;
    profile_id: string;
    date: string;  // YYYY-MM-DD
    answers: QuestionAnswer[];
    exploration: number;
    immersion: number;
    organization: number;
    contribution: number;
    vitality: number;
    dominant_metric: MetricKey;
    advice?: any;  // jsonb from Edge Function
    created_at: string;
}

export interface DBTask {
    id: string;
    profile_id: string;
    diagnostic_id: string;
    title: string;
    description: string;
    level: 'quick' | 'core' | 'deep';
    category: string;  // 探索系、集中系、実行系、休息系
    action_timing: 'night' | 'morning' | 'auto';
    status: 'pending' | 'completed' | 'expired';
    expires_at: string;
    completed_at?: string;
    created_at: string;
}

export interface DBTaskSet {
    date: string;          // YYYY-MM-DD
    diagnosticId: string;
    expiresAt: string;     // ISO timestamp
    tasks: DBTask[];
}

export interface ParameterScores extends Metrics {}

export interface HomeData {
    todayAnswered: boolean;
    userName: string;
    latestDiagnostic: Diagnostic | null;
    taskSummary: { total: number; completed: number };
    topParameter: { name: string; key: MetricKey; score: number } | null;
}

export interface DayDetail {
    diagnostic: Diagnostic;
    completedTasks: DBTask[];
}
