import { supabase } from './client';
import { HomeData, Diagnostic, MetricKey } from '../types';
import { getUser } from './profiles';
import { getLatestDiagnostic } from './diagnostics';

/**
 * ホーム画面用のデータを一括取得
 */
export async function getHomeData(profileId: string, sessionDate: string): Promise<HomeData> {
    try {
        // 1. ユーザー名を取得
        const profile = await getUser(profileId);

        // 2. 今日の診断があるかチェック（answersが入っているか確認）
        const { data: todayDiag } = await supabase
            .from('diagnostics')
            .select('id, answers')
            .eq('profile_id', profileId)
            .eq('date', sessionDate)
            .maybeSingle();

        // 診断レコードが存在し、かつ回答が入っている場合のみ「回答済み」とする
        const todayAnswered = !!(todayDiag && todayDiag.answers && todayDiag.answers.length > 0);

        // 3. 最新の診断を取得
        const latestDiagnostic = await getLatestDiagnostic(profileId);

        // 4. タスクサマリーを取得
        let taskSummary = { total: 0, completed: 0 };
        if (todayDiag) {
            const { data: tasks } = await supabase
                .from('tasks')
                .select('status')
                .eq('diagnostic_id', todayDiag.id);

            if (tasks) {
                taskSummary.total = tasks.length;
                taskSummary.completed = tasks.filter(t => t.status === 'completed').length;
            }
        }

        // 5. トップパラメータを計算
        let topParameter: { name: string; score: number } | null = null;
        if (latestDiagnostic) {
            const metrics: Record<MetricKey, number> = {
                exploration: latestDiagnostic.exploration,
                immersion: latestDiagnostic.immersion,
                organization: latestDiagnostic.organization,
                contribution: latestDiagnostic.contribution,
                vitality: latestDiagnostic.vitality,
            };

            const metricNames: Record<MetricKey, string> = {
                exploration: '探索',
                immersion: '没頭',
                organization: '整理',
                contribution: '貢献',
                vitality: '元気',
            };

            const topMetric = Object.entries(metrics)
                .reduce((max, [key, value]) =>
                    value > max.value ? { key: key as MetricKey, value } : max,
                    { key: 'exploration' as MetricKey, value: -Infinity }
                );

            topParameter = {
                name: metricNames[topMetric.key],
                key: topMetric.key,
                score: Math.round(topMetric.value),
            };
        }

        return {
            todayAnswered,
            userName: profile.name,
            latestDiagnostic,
            taskSummary,
            topParameter,
        };
    } catch (error: any) {
        throw new Error(`Failed to get home data: ${error.message}`);
    }
}
