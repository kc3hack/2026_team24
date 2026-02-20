import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * 回答済み質問IDの管理
 */

const getStorageKey = (profileId: string): string => {
    return `answered_questions_${profileId}`;
};

/**
 * 回答済み質問IDを取得
 */
export async function getAnsweredQuestionIds(profileId: string): Promise<number[]> {
    try {
        const key = getStorageKey(profileId);
        const value = await AsyncStorage.getItem(key);
        if (!value) return [];
        return JSON.parse(value) as number[];
    } catch (error) {
        console.error('Failed to get answered question IDs:', error);
        return [];
    }
}

/**
 * 回答済み質問IDを追加
 */
export async function addAnsweredQuestionId(profileId: string, questionId: number): Promise<void> {
    try {
        const key = getStorageKey(profileId);
        const currentIds = await getAnsweredQuestionIds(profileId);
        if (!currentIds.includes(questionId)) {
            currentIds.push(questionId);
            await AsyncStorage.setItem(key, JSON.stringify(currentIds));
        }
    } catch (error) {
        console.error('Failed to add answered question ID:', error);
        throw error;
    }
}

/**
 * 回答済み質問IDを複数追加
 */
export async function addAnsweredQuestionIds(profileId: string, questionIds: number[]): Promise<void> {
    try {
        const key = getStorageKey(profileId);
        const currentIds = await getAnsweredQuestionIds(profileId);
        const newIds = [...new Set([...currentIds, ...questionIds])];
        await AsyncStorage.setItem(key, JSON.stringify(newIds));
    } catch (error) {
        console.error('Failed to add answered question IDs:', error);
        throw error;
    }
}

/**
 * 回答済み質問IDをリセット（全問回答済みの場合）
 */
export async function resetAnsweredQuestions(profileId: string): Promise<void> {
    try {
        const key = getStorageKey(profileId);
        await AsyncStorage.removeItem(key);
    } catch (error) {
        console.error('Failed to reset answered questions:', error);
        throw error;
    }
}
