import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * タイトル画面の起動時に一番最初に呼ぶ
 * AsyncStorageにprofile_idがあるかを確認して画面遷移先を決める
 * アプリ全体の起点となる関数
 */
export async function initUser(): Promise<{ isFirstTime: boolean; profileId: string | null }> {
    try {
        const profileId = await AsyncStorage.getItem('profile_id');

        if (profileId) {
            // Profile exists -> Home
            return { isFirstTime: false, profileId };
        } else {
            // No profile -> Setup
            return { isFirstTime: true, profileId: null };
        }
    } catch (e) {
        console.error("Failed to init user:", e);
        // Error fallback -> Setup
        return { isFirstTime: true, profileId: null };
    }
}
