import { HistoryLog, PrimaryMetric } from '../../types';

export const METRIC_COLORS: Record<PrimaryMetric, string> = {
    exploration: '#3B82F6', // Blue
    immersion: '#10B981',   // Emerald
    refactor: '#8B5CF6',    // Violet
    contribution: '#F97316', // Orange
    idle: '#06B6D4',        // Cyan
};

export const METRIC_LABELS: Record<PrimaryMetric, string> = {
    exploration: '探索',
    immersion: '没頭',
    refactor: '整理',
    contribution: '貢献',
    idle: '元気', // User mapped Cyan to "元気"
};

const getRandomMetric = (): PrimaryMetric => {
    const metrics: PrimaryMetric[] = ['exploration', 'immersion', 'refactor', 'contribution', 'idle'];
    return metrics[Math.floor(Math.random() * metrics.length)];
};

export const generateYearData = (): HistoryLog[] => {
    const data: HistoryLog[] = [];
    const today = new Date();

    for (let i = 0; i < 365; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);

        // Simulate some empty days (20% chance)
        if (Math.random() < 0.2) {
            continue;
        }

        const dateStr = d.toISOString().split('T')[0];

        data.push({
            date: dateStr,
            primaryMetric: getRandomMetric(),
            score: Math.floor(Math.random() * 100),
            metrics: {
                focus: Math.floor(Math.random() * 100),
                relax: Math.floor(Math.random() * 100),
                social: Math.floor(Math.random() * 100),
            },
            tasksCompleted: Math.floor(Math.random() * 5),
            taskList: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, index) => ({
                id: `task-${index}`,
                title: [
                    '認証機能の実装',
                    'DBスキーマの再構築',
                    'デザインシステムの更新',
                    '会議資料の作成',
                    'ナビゲーションのバグ修正',
                    '仕様書の作成'
                ][Math.floor(Math.random() * 6)],
                tag: ['Core', 'Deep', 'Quick'][Math.floor(Math.random() * 3)],
                time: '2h',
                color: ['Core', 'Deep', 'Quick'][Math.floor(Math.random() * 3)] as 'Core' | 'Deep' | 'Quick',
                isCompleted: true
            })),
        });
    }

    // Sort by date ascending
    return data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};
