import { create } from 'zustand';
import { MOCK_QUESTIONS } from '../data/mock/mockQuestions';
import { MOCK_SCORES } from '../data/mock/mockScores';
import { MOCK_ACTIONS } from '../data/mock/mockActions';

interface AppState {
    questions: typeof MOCK_QUESTIONS;
    currentQuestionIndex: number;
    scores: typeof MOCK_SCORES;
    actions: typeof MOCK_ACTIONS;
    answers: Record<number, 'YES' | 'NO' | 'UNKNOWN'>;

    setAnswer: (questionId: number, answer: 'YES' | 'NO' | 'UNKNOWN') => void;
    nextQuestion: () => void;
    resetQuestions: () => void;
}

export const useMockStore = create<AppState>((set) => ({
    questions: MOCK_QUESTIONS,
    currentQuestionIndex: 0,
    scores: MOCK_SCORES,
    actions: MOCK_ACTIONS,
    answers: {},

    setAnswer: (id, answer) => set((state) => ({ answers: { ...state.answers, [id]: answer } })),
    nextQuestion: () => set((state) => ({ currentQuestionIndex: state.currentQuestionIndex + 1 })),
    resetQuestions: () => set({ currentQuestionIndex: 0, answers: {} }),
}));
