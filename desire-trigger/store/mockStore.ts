import { create } from 'zustand';
// タスクデータは constants/mockData.ts に統合
export { MOCK_TASK_SETS, MOCK_TASKS, type TaskSet } from '../constants/mockData';

// --- Mock Questions (for Diagnostic) ---
export type Question = {
    id: string;
    text: string;
    category: string;
};

// 質問データは constants/mockData.ts に統合（後方互換性のため型変換して使用）
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
