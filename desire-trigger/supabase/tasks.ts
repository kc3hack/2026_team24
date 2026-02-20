
import { supabase } from './client';
import { Task } from '../types';

/**
 * 有効期限内のタスクを取得（行動画面・ホームサマリー用）
 * status != 'expired' AND expires_at > now ? 
 * Or just trust BE 'expires_at' logic?
 * BE Spec: "expires_at: ISODateString -- created_at + 24時間"
 * Use simple logic: select tasks where expires_at > now AND status != 'expired' (if we manage expired status)
 * Or simpler: created recently.
 * FUNCTIONS.md says: "expires_atが現在時刻より未来のタスクだけ返す"
 */
export async function fetchTodayTasks(profileId: string): Promise<Task[]> {
    const now = new Date().toISOString();

    const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('profile_id', profileId)
        .gt('expires_at', now)
        .order('created_at', { ascending: false }) // Newest first? Or by level?
        .limit(3); // Usually 3 tasks per day

    if (error) {
        console.warn(`[Mock Mode] Failed to fetch today tasks: ${error.message}. Returning empty list.`);
        return [];
    }

    return data as Task[];
}

/**
 * タスク完了
 * statusをappliedに更新してcompleted_atを記録する
 */
export async function completeTask(taskId: string): Promise<void> {
    const { error } = await supabase
        .from('tasks')
        .update({
            status: 'applied',
            completed_at: new Date().toISOString(),
        })
        .eq('id', taskId);

    if (error) {
        console.warn(`[Mock Mode] Failed to complete task: ${error.message}.`);
        return;
    }
}

/**
 * 特定日の完了済みタスクを取得（履歴詳細用）
 * status IN ('applied') ? Or check completed_at date?
 * Assuming we want tasks that were completed ON that date, or created/assigned for that date?
 * Usually "History" implies "What I did on that day".
 * Let's query based on created_at date matching the diagnostic date (which drives the task generation).
 * Be.md says "diagnostic_id" links task to diagnostic. Maybe use that if available?
 * But getTasksByDate(date) implies date query.
 * Let's query based on created_at::date == date.
 */
export async function fetchTasksByDate(profileId: string, date: string): Promise<Task[]> {
    // date is YYYY-MM-DD
    // created_at is timestamptz. 
    // We can filter by range [dateT00:00, dateT23:59]
    // Or simpler: filter by diagnostic date if joined? No join here.

    // Using created_at range
    const startOfDay = `${date}T00:00:00.000Z`;
    const endOfDay = `${date}T23:59:59.999Z`;

    const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('profile_id', profileId)
        .gte('created_at', startOfDay)
        .lte('created_at', endOfDay)
        .eq('status', 'applied'); // Only completed ones?
    // FUNCTIONS.md decription: "その日に生成されたタスク（完了済みのみ）" -> Yes.

    if (error) {
        console.warn(`[Mock Mode] Failed to fetch tasks by date: ${error.message}. Returning empty list.`);
        return [];
    }

    return data as Task[];
}
