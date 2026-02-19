import { create } from 'zustand';
import { Task, Question, MetricKey } from '../types';

const now = new Date();
const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

// --- Mock Tasks (for Action Screen) ---
export const MOCK_TASKS: Task[] = [
    {
        id: 'task-1',
        profile_id: 'user-1',
        diagnostic_id: 'diag-1',
        title: '技術キャッチアップ',
        description: 'TechFeedなどで気になった記事を3つ読む。',
        level: 'quick',
        category: '探索系',
        action_timing: 'auto',
        status: 'pending',
        expires_at: expiresAt,
        completed_at: null,
        created_at: now.toISOString(),

        // Mock / Legacy fields
        color: 'Quick',
        tag: '探索系',
        time: '15m',
        isCompleted: false,

        mode: 'EXPLORATION',
        duration: 15,
        difficulty: 'QUICK',
        timing_tag: '移動中',
        buff_metric: 'exploration',
        buff_delta: 5,
        buffValue: 5,
        buff_expires_at: expiresAt,
        task_expires_at: expiresAt,
        expiresAt: expiresAt,
    },
    {
        id: 'task-2',
        profile_id: 'user-1',
        diagnostic_id: 'diag-1',
        title: '集中開発',
        description: 'ポモドーロで90分間集中実装する。',
        level: 'deep',
        category: '集中系',
        action_timing: 'auto',
        status: 'pending',
        expires_at: expiresAt,
        completed_at: null,
        created_at: now.toISOString(),

        color: 'Deep',
        tag: '集中系',
        time: '90m',
        isCompleted: false,

        mode: 'IMMERSION',
        duration: 90,
        difficulty: 'DEEP',
        timing_tag: '休日',
        buff_metric: 'immersion',
        buff_delta: 15,
        buffValue: 15,
        buff_expires_at: expiresAt,
        task_expires_at: expiresAt,
        expiresAt: expiresAt,
    },
    {
        id: 'task-3',
        profile_id: 'user-1',
        diagnostic_id: 'diag-1',
        title: '週次計画',
        description: 'タスク整理と来週の計画を立てる。',
        level: 'quick',
        category: '探索系', // Or Organization?
        action_timing: 'morning',
        status: 'pending',
        expires_at: expiresAt,
        completed_at: null,
        created_at: now.toISOString(),

        color: 'Quick',
        tag: '朝',
        time: '30m',
        isCompleted: false,

        mode: 'ORGANIZATION',
        duration: 30,
        difficulty: 'QUICK',
        timing_tag: '朝',
        buff_metric: 'organization',
        buff_delta: 10,
        buffValue: 10,
        buff_expires_at: expiresAt,
        task_expires_at: expiresAt,
        expiresAt: expiresAt,
    },
    {
        id: 'task-4',
        profile_id: 'user-1',
        diagnostic_id: 'diag-1',
        title: 'OSS活動',
        description: 'OSSのIssueを確認・再現する。',
        level: 'core',
        category: '実行系',
        action_timing: 'auto',
        status: 'pending',
        expires_at: expiresAt,
        completed_at: null,
        created_at: now.toISOString(),

        color: 'Core',
        tag: '休日',
        time: '60m',
        isCompleted: false,

        mode: 'CONTRIBUTION',
        duration: 60,
        difficulty: 'CORE',
        timing_tag: '休日',
        buff_metric: 'contribution',
        buff_delta: 12,
        buffValue: 12,
        buff_expires_at: expiresAt,
        task_expires_at: expiresAt,
        expiresAt: expiresAt,
    },
    {
        id: 'task-5',
        profile_id: 'user-1',
        diagnostic_id: 'diag-1',
        title: 'デジタルデトックス',
        description: '寝る前1時間はスマホ断ちで読書。',
        level: 'core',
        category: '休息系',
        action_timing: 'night',
        status: 'pending',
        expires_at: expiresAt,
        completed_at: null,
        created_at: now.toISOString(),

        color: 'Core',
        tag: '夜',
        time: '60m',
        isCompleted: false,

        mode: 'REST',
        duration: 60,
        difficulty: 'CORE',
        timing_tag: '夜',
        buff_metric: 'vitality',
        buff_delta: 20,
        buffValue: 20,
        buff_expires_at: expiresAt,
        task_expires_at: expiresAt,
        expiresAt: expiresAt,
    },
];

// --- Mock Questions (for Diagnostic) ---
const MOCK_QUESTIONS: Question[] = [
    {
        id: 1,
        text: '昨晩は7時間以上睡眠をとりましたか？',
        category: 'vitality',
        metric_effects: { vitality: 10 },
        weight: 1.0
    },
    {
        id: 2,
        text: '今日のタスクは明確に定義されていますか？',
        category: 'organization',
        metric_effects: { organization: 10 },
        weight: 1.0
    },
    {
        id: 3,
        text: '新しい技術や知識に触れる意欲はありますか？',
        category: 'exploration',
        metric_effects: { exploration: 10 },
        weight: 1.0
    },
    {
        id: 4,
        text: '現在のストレスレベルは許容範囲内ですか？',
        category: 'stress', // Note: 'stress' is not in MetricKey, but okay if partial metrics allowed or if handled loosely
        metric_effects: { vitality: 5, immersion: -5 },
        weight: 1.0
    },
    {
        id: 5,
        text: '今、集中して作業に取り組める状態ですか？',
        category: 'focus',
        metric_effects: { immersion: 10 },
        weight: 1.0
    },
];

// --- Zustand Store ---
interface MockStoreState {
    questions: Question[];
    currentQuestionIndex: number;
    answers: Record<number, 'YES' | 'NO' | 'UNKNOWN'>;
    nextQuestion: () => void;
    setAnswer: (questionId: number, answer: 'YES' | 'NO' | 'UNKNOWN') => void;
    resetQuestions: () => void;
}

export const useMockStore = create<MockStoreState>((set) => ({
    questions: MOCK_QUESTIONS,
    currentQuestionIndex: 0,
    answers: {},
    nextQuestion: () => set((state) => ({
        currentQuestionIndex: Math.min(state.currentQuestionIndex + 1, state.questions.length - 1)
    })),
    setAnswer: (questionId, answer) => set((state) => ({
        answers: { ...state.answers, [questionId]: answer }
    })),
    resetQuestions: () => set({
        currentQuestionIndex: 0,
        answers: {}
    }),
}));
