import { create } from 'zustand';
// タスクデータは constants/mockData.ts に統合
export { MOCK_TASK_SETS, MOCK_TASKS, type TaskSet, MOCK_QUESTIONS } from '../constants/mockData';

// --- Mock Questions (for Diagnostic) ---
// 質問データは constants/mockData.ts に統合済み（焼肉テーマ）

// --- Zustand Store ---
// Note: This store is deprecated - questions are now managed via AsyncStorage
// and retrieved from constants/mockData.ts in mock mode
