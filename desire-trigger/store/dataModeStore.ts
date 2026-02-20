import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type DataMode = 'mock' | 'live';

interface DataModeState {
  dataMode: DataMode;
  isInitialized: boolean;

  // Actions
  setDataMode: (mode: DataMode) => Promise<void>;
  loadDataMode: () => Promise<void>;
  toggleDataMode: () => Promise<void>;
}

export const useDataModeStore = create<DataModeState>((set, get) => ({
  dataMode: 'live', // デフォルト値
  isInitialized: false,

  // AsyncStorageから読み込み
  loadDataMode: async () => {
    try {
      const storedMode = await AsyncStorage.getItem('data_mode');
      const mode = (storedMode === 'mock' ? 'mock' : 'live') as DataMode;
      set({ dataMode: mode, isInitialized: true });
    } catch (e) {
      console.error('Failed to load data mode:', e);
      set({ dataMode: 'live', isInitialized: true });
    }
  },

  // モードを設定してAsyncStorageに保存
  setDataMode: async (mode: DataMode) => {
    try {
      await AsyncStorage.setItem('data_mode', mode);
      set({ dataMode: mode });

      // モード切り替え時に質問関連のデータをクリア（Mock/Live間の整合性を保つため）
      await AsyncStorage.multiRemove([
        'current_questions',
        'current_answers',
        'current_question_index',
        'current_diagnostic_id',
      ]);
      console.log(`✅ Data mode switched to ${mode.toUpperCase()}. Questions cleared.`);
    } catch (e) {
      console.error('Failed to save data mode:', e);
    }
  },

  // トグル（MOCK ⇔ LIVE）
  toggleDataMode: async () => {
    const currentMode = get().dataMode;
    const newMode: DataMode = currentMode === 'mock' ? 'live' : 'mock';
    await get().setDataMode(newMode);
  },
}));
