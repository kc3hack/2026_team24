import { create } from 'zustand';
import { Task } from '../types';

const now = new Date();
const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

// --- Mock Tasks (for Action Screen) ---
export const MOCK_TASKS: Task[] = [
    {
        id: 'task-1',
        user_id: 'user-1',
        diagnostic_id: 'diag-1',
        title: '技術記事の流し読み',
        description: '最新のトレンドをキャッチアップするために、TechFeedやZennで気になった記事を3つ読む。',
        type: 'quick',
        levelType: 'quick',
        category: '探索系',
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
        title: '個人開発のCI/CD構築',
        description: 'GitHub Actionsを使って、デプロイフローを自動化する。ビルド時間の短縮を目指す。',
        type: 'core',
        levelType: 'core',
        category: '実行系',
        timing_tag: '休日',
        action_timing: 'auto',
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
        id: 'task-3',
        user_id: 'user-1',
        diagnostic_id: 'diag-1',
        title: 'デジタルデトックス',
        description: '寝る前の1時間はスマホを触らず、紙の本を読むか瞑想をする。',
        type: 'deep',
        levelType: 'deep',
        category: '休息系',
        timing_tag: '夜',
        action_timing: 'night',
        buff_metric: 'vitality',
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
