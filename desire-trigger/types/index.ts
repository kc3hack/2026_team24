
export type UserId = string;
export type ISODateString = string; // "2026-02-18"

// ─── 5 Metrics ───
export type MetricKey =
    | 'exploration'   // 探索
    | 'immersion'     // 没頭
    | 'organization'  // 整理
    | 'contribution'  // 貢献
    | 'vitality';     // 元気

export type Metrics = {
    exploration: number;   // 0〜100
    immersion: number;     // 0〜100
    organization: number;  // 0〜100
    contribution: number;  // 0〜100
    vitality: number;      // 0〜100
};

// ─── Profile ───
export type JobTitle =
    | 'Frontend' | 'Backend' | 'Infra'
    | 'ML/Data' | 'Mobile' | 'Student' | 'Other';

export type CurrentMode = '成長期' | '維持期' | '停滞期';

export interface Profile {
    id: UserId;
    name: string;
    job_title: JobTitle;
    job_title_other?: string;
    hobbies: string[];
    interests: string[];
    current_mode: CurrentMode;
    notify_time: string;        // "21:00"
    created_at: ISODateString;
    updated_at: ISODateString;
    // Frontend compatibility if needed
    avatarUrl?: string;
    level?: number;
    exp?: number;
    // New fields for settings
    favorite_technology?: string;
    worry?: string;
}

export type OnboardingInput = Omit<Profile, 'id' | 'created_at' | 'updated_at'>;

// ─── Diagnostic ───
export type QuestionAnswer = {
    question_id: number;
    answer: boolean;   // true=YES(Right Swipe) / false=NO(Left Swipe)
    strength: number;  // 0〜100 (SYNC STRENGTH)
};

export type Diagnostic = Metrics & {
    id: string;
    profile_id: UserId;
    date: ISODateString;
    answers: QuestionAnswer[];
    dominant_metric: MetricKey;
    created_at: ISODateString;
};

// ─── Question ───
export interface Question {
    id: number; // Changed from string to number in BE spec, check FE usage
    text: string;
    metric_effects: Partial<Metrics>;
    weight: number;
    // Frontend compatibility
    category?: string;
}

// ─── Task ───
export type TaskLevel = 'quick' | 'core' | 'deep';
export type TaskCategory = '探索系' | '集中系' | '実行系' | '休息系';
export type ActionTiming = 'night' | 'morning' | 'auto';
export type TaskStatus = 'pending' | 'applied' | 'expired';

export interface Task {
    id: string;
    profile_id: UserId;
    diagnostic_id: string;
    title: string;
    description: string;
    level: TaskLevel;
    category: TaskCategory;
    action_timing: ActionTiming;
    status: TaskStatus;
    expires_at: ISODateString;
    completed_at: ISODateString | null;
    created_at: ISODateString;

    // Frontend compatibility for mockStore/legacy
    tag?: string;
    time?: string;
    color?: 'Quick' | 'Core' | 'Deep';
    isCompleted?: boolean;
    // mock properties to allow build while refactoring
    mode?: string;
    duration?: number;
    difficulty?: string;
    timing_tag?: string;
    buff_metric?: string;
    buff_delta?: number;
    buffValue?: number;
    buff_expires_at?: string;
    task_expires_at?: string;
    expiresAt?: string;
}

// ─── History ───
export type PrimaryMetric = MetricKey | 'idle' | 'refactor'; // Frontend legacy support?

export interface HistoryLog {
    date: string;
    primaryMetric: PrimaryMetric | MetricKey;
    score: number;
    metrics: { [key: string]: number };
    tasksCompleted: number;
    taskList: Task[];
}

export interface Diary {
    id: string;
    date: string;
    content: string;
    mood: string;
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
