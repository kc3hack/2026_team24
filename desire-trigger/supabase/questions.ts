
import { supabase } from './client';
import { Question } from '../types';

/**
 * 質問画面の起動時に一度だけ呼ぶ
 * questionsテーブルから全件取得してローカルstateに持つ
 */
export async function fetchQuestions(): Promise<Question[]> {
    const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('id', { ascending: true });

    if (error) {
        throw new Error(`Failed to fetch questions: ${error.message}`);
    }

    return data as Question[];
}
