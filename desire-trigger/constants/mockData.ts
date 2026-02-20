/**
 * Consolidated Mock Data - 全てのモックデータを一元管理
 *
 * このファイルは data_mode === 'mock' のときに全画面が参照します
 */

import { Task, HistoryLog, PrimaryMetric, Diagnostic, MetricKey, DayDetail, DBTask, ParameterScores } from '../types';

// ===========================
// ユーザー情報
// ===========================

export const MOCK_USER = {
    name: "田中エンジニア",
    current_mode: "exploration" as const,
    streak: 23,
};

// ===========================
// 質問データ (5問)
// ===========================

export type MockQuestion = {
    id: number;
    text: string;
    category: string;
};

export const MOCK_QUESTIONS: MockQuestion[] = [
    { id: 1, text: "今日は静かな場所でゆっくり過ごしたいと思っていませんか?", category: "回復" },
    { id: 2, text: "疲れを癒したい気分ですか?", category: "回復" },
    { id: 3, text: "今日は誰かに認められたい気持ちがありますか?", category: "承認" },
    { id: 4, text: "自分の頑張りを誰かに見てほしいと思っていませんか?", category: "承認" },
    { id: 5, text: "今日、誰かと話したい気持ちがありましたか?", category: "孤独解消" },
];

// ===========================
// パラメータスコア
// ===========================

export const MOCK_PARAMETER_SCORES: ParameterScores = {
    exploration: 72,
    immersion: 45,
    organization: 68,
    contribution: 55,
    vitality: 80,
};

// ===========================
// アドバイス
// ===========================

export const MOCK_ADVICE = {
    exploration: "好奇心が旺盛な状態です！新しい技術記事を読んだり、ハンズオンチュートリアルに挑戦してみましょう。ただし深追いしすぎず、気になったものをメモに残して後で整理すると効果的です。",
    immersion: "集中力がやや低下気味かもしれません。ポモドーロタイマーを使って25分集中・5分休憩を繰り返すと、徐々にフロー状態に入りやすくなります。環境音楽も試してみてください。",
    organization: "思考の整理が進んでいますね。この調子でタスクの優先順位付けや、週次の振り返りを続けましょう。Notionやマインドマップツールを活用すると更に捗ります。",
    contribution: "チームへの貢献意識がありますね。PRレビューやドキュメント更新、後輩へのアドバイスなど、小さなことから始めてみましょう。感謝されることでモチベーションも上がります。",
    vitality: "エネルギーが充実しています！この調子で適度な運動と良質な睡眠を継続しましょう。朝散歩や軽いストレッチを習慣化すると、更にパフォーマンスが向上します。",
};

// ===========================
// タスクデータ (3タスク - QUICK/CORE/DEEP)
// ===========================

const today = new Date();
const todayStr = today.toISOString().split('T')[0];
const todayCreatedAt = new Date(today);
todayCreatedAt.setHours(8, 15, 0, 0);
const todayDeadline = new Date(todayCreatedAt.getTime() + 24 * 60 * 60 * 1000);

export const MOCK_TASKS: Task[] = [
    {
        id: 'mock-task-1',
        user_id: 'mock-user',
        diagnostic_id: 'mock-diag-today',
        title: '技術記事を読む',
        description: '探索スコアが高いので、気になる技術記事を1〜2本読んでキャッチアップしましょう。',
        mode: 'EXPLORATION',
        duration: 5,
        difficulty: 'QUICK',
        timing_tag: '移動中',
        action_timing: 'auto',
        buff_metric: 'exploration',
        buff_delta: 5,
        buffValue: 5,
        buff_expires_at: todayDeadline.toISOString(),
        task_expires_at: todayDeadline.toISOString(),
        expiresAt: todayDeadline.toISOString(),
        deadline: todayDeadline.toISOString(),
        status: 'pending',
        completed_at: null,
        created_at: todayCreatedAt.toISOString(),
        isCompleted: false,
    },
    {
        id: 'mock-task-2',
        user_id: 'mock-user',
        diagnostic_id: 'mock-diag-today',
        title: 'コードレビュー',
        description: '貢献スコアを上げるため、チームメイトのPRを1〜2件レビューしてフィードバックしましょう。',
        mode: 'CONTRIBUTION',
        duration: 20,
        difficulty: 'CORE',
        timing_tag: '業務中',
        action_timing: 'auto',
        buff_metric: 'contribution',
        buff_delta: 10,
        buffValue: 10,
        buff_expires_at: todayDeadline.toISOString(),
        task_expires_at: todayDeadline.toISOString(),
        expiresAt: todayDeadline.toISOString(),
        deadline: todayDeadline.toISOString(),
        status: 'pending',
        completed_at: null,
        created_at: todayCreatedAt.toISOString(),
        isCompleted: false,
    },
    {
        id: 'mock-task-3',
        user_id: 'mock-user',
        diagnostic_id: 'mock-diag-today',
        title: 'リファクタリング',
        description: '整理スコアが高いので、気になっていたコードを整理してクリーンにしましょう。',
        mode: 'ORGANIZATION',
        duration: 45,
        difficulty: 'DEEP',
        timing_tag: '業務後',
        action_timing: 'night',
        buff_metric: 'organization',
        buff_delta: 15,
        buffValue: 15,
        buff_expires_at: todayDeadline.toISOString(),
        task_expires_at: todayDeadline.toISOString(),
        expiresAt: todayDeadline.toISOString(),
        deadline: todayDeadline.toISOString(),
        status: 'pending',
        completed_at: null,
        created_at: todayCreatedAt.toISOString(),
        isCompleted: false,
    },
];

export interface TaskSet {
    date: string;
    tasks: Task[];
}

export const MOCK_TASK_SETS: TaskSet[] = [
    { date: todayStr, tasks: MOCK_TASKS },
];

// ===========================
// 診断履歴データ (過去30日分、連続23日のストリーク)
// ===========================

/**
 * リアルな変動のあるパラメータデータを生成
 * - vitality: 最初低くて徐々に回復（50 → 85）
 * - exploration: 波打つ（60 → 80 → 65 → 75）
 * - immersion: 徐々に上昇（40 → 70）
 * - organization: 安定（65前後）
 * - contribution: 緩やかに上昇（50 → 65）
 */
export const generateMockDiagnostics = (): Diagnostic[] => {
    const diagnostics: Diagnostic[] = [];
    const baseDate = new Date();

    // 30日分のデータを生成（連続23日 + 7日の空き）
    for (let i = 0; i < 30; i++) {
        const date = new Date(baseDate);
        date.setDate(date.getDate() - (29 - i)); // 30日前から今日まで
        const dateStr = date.toISOString().split('T')[0];

        // 最初の7日は空き（ストリークが途切れている）
        if (i < 7) {
            continue;
        }

        // 進行度（0〜1）
        const progress = (i - 7) / 22; // 23日間の進行度

        // リアルな変動を追加
        const vitalityBase = 50 + progress * 35; // 50 → 85
        const explorationBase = 60 + Math.sin(progress * Math.PI * 3) * 15; // 波打つ
        const immersionBase = 40 + progress * 30; // 40 → 70
        const organizationBase = 65 + Math.sin(progress * Math.PI * 2) * 8; // 65前後で安定
        const contributionBase = 50 + progress * 15; // 50 → 65

        // 少しランダム性を追加（±3）
        const rand = () => (Math.random() - 0.5) * 6;

        const exploration = Math.max(0, Math.min(100, explorationBase + rand()));
        const immersion = Math.max(0, Math.min(100, immersionBase + rand()));
        const organization = Math.max(0, Math.min(100, organizationBase + rand()));
        const contribution = Math.max(0, Math.min(100, contributionBase + rand()));
        const vitality = Math.max(0, Math.min(100, vitalityBase + rand()));

        // 最高値のメトリックを特定
        const metrics = { exploration, immersion, organization, contribution, vitality };
        const dominant_metric = (Object.entries(metrics).reduce((max, [key, value]) =>
            value > max.value ? { key: key as MetricKey, value } : max,
            { key: 'exploration' as MetricKey, value: -Infinity }
        )).key;

        diagnostics.push({
            id: `mock-diag-${i}`,
            profile_id: 'mock-profile',
            date: dateStr,
            answers: [],
            exploration,
            immersion,
            organization,
            contribution,
            vitality,
            dominant_metric,
            advice: MOCK_ADVICE,
            created_at: date.toISOString(),
        });
    }

    return diagnostics.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const MOCK_DIAGNOSTICS_HISTORY = generateMockDiagnostics();

// ===========================
// カレンダーデータ (当月分、全日埋める)
// ===========================

export const MOCK_CALENDAR_DATA: HistoryLog[] = MOCK_DIAGNOSTICS_HISTORY.map((diag) => {
    const metricToJapanese: Record<MetricKey, string> = {
        exploration: '探索',
        immersion: '没頭',
        organization: '整理',
        contribution: '貢献',
        vitality: '元気',
    };

    return {
        date: diag.date,
        dominantMetric: metricToJapanese[diag.dominant_metric],
        hasQuestions: true,
        hasTasks: true,
        score: Math.round(Math.max(
            diag.exploration,
            diag.immersion,
            diag.organization,
            diag.contribution,
            diag.vitality
        )),
    };
});

// ===========================
// Trend Analysis用データ
// ===========================

export const MOCK_TREND_DATA = MOCK_DIAGNOSTICS_HISTORY.map((diag) => ({
    date: diag.date,
    exploration: Math.round(diag.exploration),
    immersion: Math.round(diag.immersion),
    organization: Math.round(diag.organization),
    contribution: Math.round(diag.contribution),
    vitality: Math.round(diag.vitality),
}));

// ===========================
// 日付詳細データ（完了タスク付き）
// ===========================

export const generateMockDayDetail = (date: string): DayDetail | null => {
    const diagnostic = MOCK_DIAGNOSTICS_HISTORY.find(d => d.date === date);

    if (!diagnostic) return null;

    // 各日2〜3件の完了タスクを生成
    const completedCount = Math.floor(Math.random() * 2) + 2; // 2-3個
    const completedTasks: DBTask[] = [];

    const taskTitles = [
        '技術記事を読む',
        'コードレビュー',
        'リファクタリング',
        '新機能の実装',
        'ドキュメント更新',
        'テストコード作成',
        '朝散歩',
        '瞑想',
        'チーム定例MTG',
        'ペアプログラミング',
    ];

    const levels: ('quick' | 'core' | 'deep')[] = ['quick', 'core', 'deep'];
    const categories = ['探索系', '集中系', '実行系', '貢献系', '休息系'];

    for (let i = 0; i < completedCount; i++) {
        const level = levels[Math.floor(Math.random() * levels.length)];
        const category = categories[Math.floor(Math.random() * categories.length)];

        completedTasks.push({
            id: `mock-task-${date}-${i}`,
            profile_id: 'mock-profile',
            diagnostic_id: diagnostic.id,
            title: taskTitles[Math.floor(Math.random() * taskTitles.length)],
            description: 'モックタスクの説明',
            level: level,
            category: category,
            action_timing: 'auto',
            status: 'completed',
            expires_at: diagnostic.created_at,
            completed_at: diagnostic.created_at,
            created_at: diagnostic.created_at,
        });
    }

    return {
        diagnostic,
        completedTasks,
    };
};

// ===========================
// 履歴データ関連
// ===========================

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
    idle: '元気',
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
