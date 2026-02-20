import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Question, QuestionAnswer, UserId } from '../types';

interface SupabaseAppState {
    // State
    questions: Question[];
    currentQuestionIndex: number;
    answers: Record<number, QuestionAnswer>;
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchQuestions: () => Promise<void>;
    setAnswer: (questionId: number, answer: boolean) => void;
    nextQuestion: () => void;
    resetQuestions: () => void;
    submitDiagnostic: (userId: UserId) => Promise<void>;
}

export const useSupabaseStore = create<SupabaseAppState>((set, get) => ({
    // Initial State
    questions: [],
    currentQuestionIndex: 0,
    answers: {},
    isLoading: false,
    error: null,

    // Actions
    fetchQuestions: async () => {
        set({ isLoading: true, error: null });
        try {
            const { data, error } = await supabase
                .from('questions')
                .select('*')
                .order('id', { ascending: true });

            if (error) throw error;
            set({ questions: data || [] });
        } catch (e: any) {
            set({ error: e.message });
        } finally {
            set({ isLoading: false });
        }
    },

    setAnswer: (questionId, answer) => set((state) => ({
        answers: {
            ...state.answers,
            [questionId]: { question_id: questionId, answer }
        }
    })),

    nextQuestion: () => set((state) => ({ currentQuestionIndex: state.currentQuestionIndex + 1 })),

    resetQuestions: () => set({ currentQuestionIndex: 0, answers: {} }),

    submitDiagnostic: async (userId) => {
        const { answers } = get();
        set({ isLoading: true, error: null });

        try {
            // Edge Function 'submit-diagnostic' (仮) を呼び出すか、直接テーブルにインサートする
            // ここでは一旦直接インサートの例
            const payload = {
                user_id: userId,
                answers: Object.values(answers),
                timing: 'auto', // 仮
            };

            const { error } = await supabase
                .from('diagnostics')
                .insert(payload);

            if (error) throw error;
        } catch (e: any) {
            set({ error: e.message });
            throw e;
        } finally {
            set({ isLoading: false });
        }
    }
}));
