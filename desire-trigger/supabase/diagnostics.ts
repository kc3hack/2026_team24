import { supabase } from './client';
import { Diagnostic, QuestionAnswer, ParameterScores, MetricKey, DayDetail, DBTask } from '../types';

/**
 * 初期セットアップ時: モードに応じた初期診断データを作成
 */
export async function createInitialDiagnostic(
    profileId: string,
    date: string,
    currentMode: 'exploration' | 'immersion' | 'organization' | 'contribution' | 'vitality'
): Promise<string> {
    // モードごとの初期値
    const initialScores: Record<string, ParameterScores> = {
        exploration: { exploration: 70, immersion: 40, organization: 40, contribution: 40, vitality: 40 },
        immersion: { exploration: 40, immersion: 70, organization: 40, contribution: 40, vitality: 40 },
        organization: { exploration: 40, immersion: 40, organization: 70, contribution: 40, vitality: 40 },
        contribution: { exploration: 40, immersion: 40, organization: 40, contribution: 70, vitality: 40 },
        vitality: { exploration: 40, immersion: 40, organization: 40, contribution: 40, vitality: 70 },
    };

    const scores = initialScores[currentMode];

    const { data, error } = await supabase
        .from('diagnostics')
        .insert([
            {
                profile_id: profileId,
                date: date,
                answers: [],
                exploration: scores.exploration,
                immersion: scores.immersion,
                organization: scores.organization,
                contribution: scores.contribution,
                vitality: scores.vitality,
                dominant_metric: currentMode,
                advice: null,
            }
        ])
        .select('id')
        .single();

    if (error) {
        throw new Error(`Failed to create initial diagnostic: ${error.message}`);
    }

    return data.id;
}

/**
 * 診断開始時: 空のdiagnosticレコードを作成
 * answersやスコアはまだ入れない
 */
export async function createDiagnostic(profileId: string, date: string): Promise<string> {
    // Mock mode check
    const { useDataModeStore } = await import('../store/dataModeStore');
    const { dataMode } = useDataModeStore.getState();

    if (dataMode === 'mock') {
        console.log('[MOCK MODE] Skipping diagnostic creation, returning mock ID');
        // モックモードでは固定IDを返す（DB操作をスキップ）
        return 'mock-diagnostic-id-' + date;
    }

    // 仮の初期値を設定（後でUPDATE）
    const { data, error } = await supabase
        .from('diagnostics')
        .insert([
            {
                profile_id: profileId,
                date: date,
                answers: [],
                exploration: 0,
                immersion: 0,
                organization: 0,
                contribution: 0,
                vitality: 0,
                dominant_metric: 'exploration',  // 仮
            }
        ])
        .select('id')
        .single();

    if (error) {
        // ユニーク制約違反の場合は既存レコードのIDを返す
        if (error.code === '23505') {
            const { data: existing } = await supabase
                .from('diagnostics')
                .select('id')
                .eq('profile_id', profileId)
                .eq('date', date)
                .single();

            if (existing) return existing.id;
        }
        throw new Error(`Failed to create diagnostic: ${error.message}`);
    }

    return data.id;
}

/**
 * 質問回答完了時: answersだけを先に保存（パラメータ計算前）
 * これにより、ホーム画面が即座に「今日は回答済み」と認識できる
 */
export async function markDiagnosticAnswered(
    diagnosticId: string,
    answers: QuestionAnswer[]
): Promise<void> {
    // Mock modeの場合はSupabaseへの書き込みをスキップ
    if (diagnosticId.startsWith('mock-')) {
        console.log('✅ Mock mode: Skipping markDiagnosticAnswered');
        return;
    }

    const { error } = await supabase
        .from('diagnostics')
        .update({
            answers: answers,
        })
        .eq('id', diagnosticId);

    if (error) {
        throw new Error(`Failed to mark diagnostic as answered: ${error.message}`);
    }
}

/**
 * 診断完了時: answersとスコアとadviceを保存
 */
export async function saveDiagnosticResult(
    diagnosticId: string,
    data: {
        answers: QuestionAnswer[];
        scores: ParameterScores;
        advice?: any;
    }
): Promise<void> {
    // Mock mode check
    const { useDataModeStore } = await import('../store/dataModeStore');
    const { dataMode } = useDataModeStore.getState();

    if (dataMode === 'mock') {
        console.log('[MOCK MODE] Skipping save diagnostic result');
        return; // モックモードではDB操作をスキップ
    }

    // dominant_metricを計算
    const dominantMetric = Object.entries(data.scores)
        .reduce((max, [key, value]) =>
            value > max.value ? { key: key as MetricKey, value } : max,
            { key: 'exploration' as MetricKey, value: -Infinity }
        ).key;

    const { error } = await supabase
        .from('diagnostics')
        .update({
            answers: data.answers,
            exploration: data.scores.exploration,
            immersion: data.scores.immersion,
            organization: data.scores.organization,
            contribution: data.scores.contribution,
            vitality: data.scores.vitality,
            dominant_metric: dominantMetric,
            advice: data.advice || null,
        })
        .eq('id', diagnosticId);

    if (error) {
        throw new Error(`Failed to save diagnostic result: ${error.message}`);
    }
}

/**
 * 最新の診断を取得
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
 * 月単位で診断履歴を取得
 */
export async function getMonthlyDiagnostics(
    profileId: string,
    year: number,
    month: number
): Promise<Diagnostic[]> {
    const startOfMonth = `${year}-${String(month).padStart(2, '0')}-01`;
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    const startOfNextMonth = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;

    const { data, error } = await supabase
        .from('diagnostics')
        .select('*')
        .eq('profile_id', profileId)
        .gte('date', startOfMonth)
        .lt('date', startOfNextMonth)
        .order('date', { ascending: true });

    if (error) {
        throw new Error(`Failed to get monthly diagnostics: ${error.message}`);
    }

    return data as Diagnostic[];
}

/**
 * データが存在する月の一覧を取得
 * 返り値例: ['2026-02', '2026-01', '2025-12']
 */
export async function getAvailableMonths(profileId: string): Promise<string[]> {
    const { data, error } = await supabase
        .from('diagnostics')
        .select('date')
        .eq('profile_id', profileId)
        .order('date', { ascending: false });

    if (error) {
        throw new Error(`Failed to get available months: ${error.message}`);
    }

    if (!data || data.length === 0) return [];

    // YYYY-MM形式に変換してユニーク化
    const months = data.map(d => d.date.substring(0, 7));
    return Array.from(new Set(months));
}

/**
 * 全診断データを取得（ストリーク計算用）
 */
export async function getAllDiagnostics(profileId: string): Promise<Diagnostic[]> {
    const { data, error } = await supabase
        .from('diagnostics')
        .select('*')
        .eq('profile_id', profileId)
        .order('date', { ascending: false });

    if (error) {
        throw new Error(`Failed to get all diagnostics: ${error.message}`);
    }

    return data as Diagnostic[];
}

/**
 * 特定日の詳細（診断 + 完了済みタスク）を取得
 */
export async function getDayDetail(profileId: string, date: string): Promise<DayDetail | null> {
    // 診断データを取得
    const { data: diagnostic, error: diagError } = await supabase
        .from('diagnostics')
        .select('*')
        .eq('profile_id', profileId)
        .eq('date', date)
        .maybeSingle();

    if (diagError) {
        throw new Error(`Failed to get diagnostic: ${diagError.message}`);
    }

    if (!diagnostic) return null;

    // その日の完了済みタスクを取得
    const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('diagnostic_id', diagnostic.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: true });

    if (tasksError) {
        throw new Error(`Failed to get tasks: ${tasksError.message}`);
    }

    return {
        diagnostic: diagnostic as Diagnostic,
        completedTasks: (tasks || []) as DBTask[],
    };
}
