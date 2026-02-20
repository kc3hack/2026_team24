import { supabase } from './client';
import { DBQuestion } from '../types';
import { getAnsweredQuestionIds, resetAnsweredQuestions } from '../lib/answeredQuestions';

/**
 * ランダムに5問の質問を取得
 * - 回答済みの質問を除外
 * - 全問回答済みの場合は自動リセット
 * - .order('random()') は使わず、JS側でランダム選択
 */
export async function getRandomQuestions(profileId: string): Promise<DBQuestion[]> {
    // 回答済みIDを取得
    const answeredIds = await getAnsweredQuestionIds(profileId);

    // 全件取得
    const { data: allQuestions, error } = await supabase
        .from('questions')
        .select('*');

    if (error) {
        throw new Error(`Failed to fetch questions: ${error.message}`);
    }

    if (!allQuestions || allQuestions.length === 0) {
        throw new Error('No questions found in database');
    }

    // 回答済みIDを除外
    let availableQuestions = allQuestions.filter(q => !answeredIds.includes(q.id));

    // 全問回答済みの場合：リセット
    if (availableQuestions.length === 0) {
        console.log('All questions answered. Resetting...');
        await resetAnsweredQuestions(profileId);
        availableQuestions = allQuestions;
    }

    // JS側でランダムに5問選択
    const selectedQuestions: DBQuestion[] = [];
    const questionPool = [...availableQuestions];

    const count = Math.min(5, questionPool.length);
    for (let i = 0; i < count; i++) {
        const randomIndex = Math.floor(Math.random() * questionPool.length);
        selectedQuestions.push(questionPool[randomIndex]);
        questionPool.splice(randomIndex, 1);
    }

    return selectedQuestions as DBQuestion[];
}
