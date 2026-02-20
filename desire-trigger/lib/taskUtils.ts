import { Metrics, ActionTiming } from '../types';

/**
 * タイミング選択後、Edge Functionを叩く直前
 * vitalityスコアに基づいてタスクレベル構成を決定する
 * この結果をEdge Functionのtask_levelsパラメータに渡す
 */
export function getTaskLevels(metrics: Metrics): string {
    const { vitality, exploration, immersion } = metrics;

    if (vitality < 20) return 'quick/quick/quick';
    if (vitality <= 70) return 'quick/core/core';
    if (vitality > 70 && (exploration > 60 || immersion > 60)) return 'core/deep/deep';

    return 'quick/core/core'; // Default fallthrough
}

/**
 * 行動画面でタスクを表示するとき
 * expires_atが過ぎていたら表示しない判定に使う
 */
export function isTaskExpired(expiresAt: string): boolean {
    const now = new Date();
    const expires = new Date(expiresAt);
    return now > expires;
}

/**
 * 行動画面・ホームサマリーの残り時間表示
 * "18:32" のようなフォーマット済み文字列を返す
 */
export function getRemainingTime(expiresAt: string): string {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diffMs = expires.getTime() - now.getTime();

    if (diffMs <= 0) return "00:00";

    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    const h = String(diffHrs).padStart(2, '0');
    const m = String(diffMins).padStart(2, '0');

    return `${h}:${m}`;
}

/**
 * タイミング選択画面の起動時
 * 現在時刻によって選択肢のラベルと値を出し分ける
 */
export function getTimingOptions(
    currentHour: number
): { label: string; value: ActionTiming }[] {
    // 18時以降（夜）
    if (currentHour >= 18) {
        return [
            { label: "🌙 今からやる", value: "night" },
            { label: "☀️ 明日の朝やる", value: "morning" },
            { label: "🎲 おまかせ", value: "auto" }
        ];
    }
    // 12時未満（朝）
    else if (currentHour < 12) {
        return [
            { label: "☀️ 今からやる", value: "morning" },
            { label: "🌙 今夜やる", value: "night" },
            { label: "🎲 おまかせ", value: "auto" }
        ];
    }
    // 12〜18時（昼）
    else {
        return [
            { label: "🌞 今からやる", value: "auto" },
            { label: "🌙 今夜やる", value: "night" },
            { label: "🎲 おまかせ", value: "auto" }
        ];
    }
}
