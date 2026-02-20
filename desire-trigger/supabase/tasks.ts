import { supabase } from './client';
import { DBTask, DBTaskSet } from '../types';

/**
 * 有効期限内のタスクを日付セットごとにグループ化して取得
 * expires_at > now() のタスクのみ
 * diagnostic_idごとにグループ化
 */
export async function getActiveTasks(profileId: string): Promise<DBTaskSet[]> {
    const now = new Date().toISOString();

    // タスクを取得
    const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*, diagnostics!inner(date)')
        .eq('profile_id', profileId)
        .gt('expires_at', now)
        .order('created_at', { ascending: false });

    if (tasksError) {
        throw new Error(`Failed to fetch active tasks: ${tasksError.message}`);
    }

    if (!tasks || tasks.length === 0) return [];

    // diagnostic_idごとにグループ化
    const grouped = tasks.reduce((acc, task: any) => {
        const diagnosticId = task.diagnostic_id;
        if (!acc[diagnosticId]) {
            acc[diagnosticId] = {
                date: task.diagnostics.date,
                diagnosticId: diagnosticId,
                expiresAt: task.expires_at,
                tasks: []
            };
        }
        // diagnosticsプロパティを除外してタスクを追加
        const { diagnostics, ...taskData } = task;
        acc[diagnosticId].tasks.push(taskData as DBTask);
        return acc;
    }, {} as Record<string, DBTaskSet>);

    // 配列に変換して日付順にソート
    return Object.values(grouped).sort((a, b) =>
        a.date.localeCompare(b.date)
    );
}

/**
 * タスク完了
 * statusをcompletedに更新してcompleted_atを記録する
 */
export async function completeTask(taskId: string): Promise<void> {
    const { error } = await supabase
        .from('tasks')
        .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
        })
        .eq('id', taskId);

    if (error) {
        throw new Error(`Failed to complete task: ${error.message}`);
    }
}

/**
 * 特定の診断IDに紐づくタスクを取得
 * result-flow.tsxでタスク生成後にカード表示用に使用
 */
export async function getTasksByDiagnosticId(diagnosticId: string): Promise<DBTask[]> {
    const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('diagnostic_id', diagnosticId)
        .order('created_at', { ascending: true });

    if (error) {
        throw new Error(`Failed to fetch tasks by diagnostic ID: ${error.message}`);
    }

    return (data || []) as DBTask[];
}

/**
 * 直近のタスクタイトルを取得（重複防止用）
 * 過去7日間のタスクタイトルを返す
 */
export async function getPreviousTitles(profileId: string): Promise<string[]> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data, error } = await supabase
        .from('tasks')
        .select('title')
        .eq('profile_id', profileId)
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Failed to fetch previous titles:', error);
        return [];
    }

    if (!data || data.length === 0) return [];

    // ユニークなタイトルのみ返す
    return [...new Set(data.map(t => t.title))];
}
