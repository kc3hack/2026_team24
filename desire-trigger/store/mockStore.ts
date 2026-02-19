import { create } from 'zustand';
import { Task } from '../types';

const now = new Date();
const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

// --- Mock Tasks (for Action Screen) ---
// --- Mock Tasks (for Action Screen) ---
export const MOCK_TASKS: Task[] = [
    {
        id: 'task-1',
        user_id: 'user-1',
        diagnostic_id: 'diag-1',
        title: '技術キャッチアップ',
        description: 'TechFeedなどで気になった記事を3つ読む。',
        mode: 'EXPLORATION',
        duration: 15,
        difficulty: 'QUICK',
        timing_tag: '移動中',
        action_timing: 'auto',
        buff_metric: 'exploration',
        buff_delta: 5,
        buffValue: 5,
        buff_expires_at: expiresAt,
        task_expires_at: expiresAt,
        expiresAt: expiresAt,
        status: 'pending',
        completed_at: null,
        created_at: now.toISOString(),
        isCompleted: false,
    },
    {
        id: 'task-2',
        user_id: 'user-1',
        diagnostic_id: 'diag-1',
        title: '集中開発',
        description: 'ポモドーロで90分間集中実装する。',
        mode: 'IMMERSION',
        duration: 90,
        difficulty: 'DEEP',
        timing_tag: '休日',
        action_timing: 'auto',
        buff_metric: 'immersion',
        buff_delta: 15,
        buffValue: 15,
        buff_expires_at: expiresAt,
        task_expires_at: expiresAt,
        expiresAt: expiresAt,
        status: 'pending',
        completed_at: null,
        created_at: now.toISOString(),
        isCompleted: false,
    },
    {
        id: 'task-3',
        user_id: 'user-1',
        diagnostic_id: 'diag-1',
        title: '週次計画',
        description: 'タスク整理と来週の計画を立てる。',
        mode: 'ORGANIZATION',
        duration: 30,
        difficulty: 'QUICK',
        timing_tag: '朝',
        action_timing: 'morning',
        buff_metric: 'organization',
        buff_delta: 10,
        buffValue: 10,
        buff_expires_at: expiresAt,
        task_expires_at: expiresAt,
        expiresAt: expiresAt,
        status: 'pending',
        completed_at: null,
        created_at: now.toISOString(),
        isCompleted: false,
    },
    {
        id: 'task-4',
        user_id: 'user-1',
        diagnostic_id: 'diag-1',
        title: 'OSS活動',
        description: 'OSSのIssueを確認・再現する。',
        mode: 'CONTRIBUTION',
        duration: 60,
        difficulty: 'CORE',
        timing_tag: '休日',
        action_timing: 'auto',
        buff_metric: 'contribution',
        buff_delta: 12,
        buffValue: 12,
        buff_expires_at: expiresAt,
        task_expires_at: expiresAt,
        expiresAt: expiresAt,
        status: 'pending',
        completed_at: null,
        created_at: now.toISOString(),
        isCompleted: false,
    },
    {
        id: 'task-5',
        user_id: 'user-1',
        diagnostic_id: 'diag-1',
        title: 'デジタルデトックス',
        description: '寝る前1時間はスマホ断ちで読書。',
        mode: 'REST',
        duration: 60,
        difficulty: 'CORE',
        timing_tag: '夜',
        action_timing: 'night',
        buff_metric: 'vitality',
        buff_delta: 20,
        buffValue: 20,
        buff_expires_at: expiresAt,
        task_expires_at: expiresAt,
        expiresAt: expiresAt,
        status: 'pending',
        completed_at: null,
        created_at: now.toISOString(),
        isCompleted: false,
    },
];

// --- Mock Questions (for Diagnostic) ---
export type Question = {
    id: string;
    text: string;
    category: string;
};

const MOCK_QUESTIONS: Question[] = [
    { id: 'q1', text: '昨晩は7時間以上睡眠をとりましたか？', category: 'vitality' },
    { id: 'q2', text: '今日のタスクは明確に定義されていますか？', category: 'organization' },
    { id: 'q3', text: '新しい技術や知識に触れる意欲はありますか？', category: 'exploration' },
    { id: 'q4', text: '現在のストレスレベルは許容範囲内ですか？', category: 'stress' },
    { id: 'q5', text: '今、集中して作業に取り組める状態ですか？', category: 'focus' },
];

// --- Zustand Store ---
interface MockStoreState {
    questions: Question[];
    currentQuestionIndex: number;
    answers: Record<string, 'YES' | 'NO' | 'UNKNOWN'>;
    nextQuestion: () => void;
    setAnswer: (questionId: string, answer: 'YES' | 'NO' | 'UNKNOWN') => void;
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
