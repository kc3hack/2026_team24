
import { supabase } from './client';
import { Diagnostic, Metrics, QuestionAnswer, MetricKey } from '../types';

/**
 * 全5問のスワイプが完了した直後
 * calcParameters()で計算した結果をDBに保存する
 */
export async function saveDiagnostic(
    profileId: string,
    metrics: Metrics,
    answers: QuestionAnswer[],
    dominantMetric: MetricKey
): Promise<string> {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const { data, error } = await supabase
        .from('diagnostics')
        .insert([
            {
                profile_id: profileId,
                date: today,
                answers: answers, // JSONB will handle this
                exploration: metrics.exploration,
                immersion: metrics.immersion,
                organization: metrics.organization,
                contribution: metrics.contribution,
                vitality: metrics.vitality,
                dominant_metric: dominantMetric,
            }
        ])
        .select('id')
        .single();

    if (error) {
        // If conflict (duplicate entry for today), maybe we should update instead?
        // BE spec says "unique(profile_id, date) -- 1日1レコード"
        // If fail, let's try update or just throw error (user already did it today)
        // For simplicity/safety, we can check update strategy if needed, but error is safe default.
        if (error.code === '23505') { // unique_violation
            // Update existing record for today?
            // Or throw friendly error. 
            // Let's try upsert for better UX
            const { data: upsertData, error: upsertError } = await supabase
                .from('diagnostics')
                .upsert(
                    {
                        profile_id: profileId,
                        date: today,
                        answers: answers,
                        exploration: metrics.exploration,
                        immersion: metrics.immersion,
                        organization: metrics.organization,
                        contribution: metrics.contribution,
                        vitality: metrics.vitality,
                        dominant_metric: dominantMetric,
                        updated_at: new Date().toISOString()
                    },
                    { onConflict: 'profile_id, date' }
                )
                .select('id')
                .single();

            if (upsertError) throw new Error(`Failed to upsert diagnostic: ${upsertError.message}`);
            return upsertData.id;
        }
        throw new Error(`Failed to save diagnostic: ${error.message}`);
    }

    return data.id;
}

/**
 * ホーム画面起動時に「今日すでに診断済みか」を判定
 */
export async function getTodayDiagnostic(profileId: string): Promise<Diagnostic | null> {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
        .from('diagnostics')
        .select('*')
        .eq('profile_id', profileId)
        .eq('date', today)
        .maybeSingle();

    if (error) {
        throw new Error(`Failed to check today's diagnostic: ${error.message}`);
    }

    return data as Diagnostic | null;
}

/**
 * 最新の診断を取得（分析画面のレーダーチャート用）
 */
export async function getLatestDiagnostic(profileId: string): Promise<Diagnostic | null> {
    const { data, error } = await supabase
        .from('diagnostics')
        .select('*')
        .eq('profile_id', profileId)
        .order('date', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) {
        throw new Error(`Failed to get latest diagnostic: ${error.message}`);
    }

    return data as Diagnostic | null;
}

/**
 * 分析画面の推移グラフ表示時
 * 日付昇順の診断履歴配列
 */
export async function getDiagnosticHistory(profileId: string): Promise<Diagnostic[]> {
    const { data, error } = await supabase
        .from('diagnostics')
        .select('*')
        .eq('profile_id', profileId)
        .order('date', { ascending: true });

    if (error) {
        throw new Error(`Failed to get diagnostic history: ${error.message}`);
    }

    return data as Diagnostic[];
}

/**
 * 履歴画面のカレンダー表示時
 * 月単位で取得してマスの色を決める
 */
export async function getCalendarData(
    profileId: string,
    year: number,
    month: number
): Promise<{ date: string; dominant_metric: MetricKey }[]> {
    // Construct date range for query: start of month to end of month
    const startOfMonth = `${year}-${String(month).padStart(2, '0')}-01`;
    // Calculate end of month roughly or just use next month 1st
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    const startOfNextMonth = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;

    const { data, error } = await supabase
        .from('diagnostics')
        .select('date, dominant_metric')
        .eq('profile_id', profileId)
        .gte('date', startOfMonth)
        .lt('date', startOfNextMonth);

    if (error) {
        throw new Error(`Failed to get calendar data: ${error.message}`);
    }

    return data as { date: string; dominant_metric: MetricKey }[];
}

/**
 * 履歴画面でカレンダーのマスをタップしたとき
 */
export async function getDiagnosticByDate(profileId: string, date: string): Promise<Diagnostic | null> {
    const { data, error } = await supabase
        .from('diagnostics')
        .select('*')
        .eq('profile_id', profileId)
        .eq('date', date)
        .maybeSingle();

    if (error) {
        throw new Error(`Failed to get diagnostic by date: ${error.message}`);
    }

    return data as Diagnostic | null;
}
