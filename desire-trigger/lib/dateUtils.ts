import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * セッション日付を取得
 * デバッグモードの場合はオーバーライドされた日付を返す
 */
export async function getSessionDate(): Promise<string> {
    try {
        const override = await AsyncStorage.getItem('debug_date_override');
        if (override) {
            return override;
        }
    } catch (error) {
        console.warn('Failed to read debug_date_override:', error);
    }

    // デフォルトは今日の日付
    return new Date().toISOString().split('T')[0];
}

/**
 * デバッグ日付を設定
 */
export async function setDebugDate(date: string | null): Promise<void> {
    try {
        if (date === null) {
            await AsyncStorage.removeItem('debug_date_override');
        } else {
            await AsyncStorage.setItem('debug_date_override', date);
        }
    } catch (error) {
        console.error('Failed to set debug_date_override:', error);
        throw error;
    }
}

/**
 * デバッグ日付を1日進める
 */
export async function incrementDebugDate(): Promise<string> {
    const currentDate = await getSessionDate();
    const date = new Date(currentDate);
    date.setDate(date.getDate() + 1);
    const newDate = date.toISOString().split('T')[0];
    await setDebugDate(newDate);
    return newDate;
}

/**
 * デバッグ日付をリセット
 */
export async function resetDebugDate(): Promise<void> {
    await setDebugDate(null);
}
