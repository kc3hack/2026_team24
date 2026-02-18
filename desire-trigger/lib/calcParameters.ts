import { QuestionAnswer, Question, Metrics, MetricKey } from '../types';

/**
 * 全5問のスワイプ完了直後
 * 回答とSYNC STRENGTHからパラメータを計算する
 * この結果をレーダーチャートに表示してDBに保存する
 */
export function calcParameters(
    answers: QuestionAnswer[],
    questions: Question[],
    currentMetrics: Metrics
): Metrics {
    // Create a copy of current metrics to modify
    const newMetrics: Metrics = { ...currentMetrics };

    answers.forEach((ans) => {
        const question = questions.find((q) => q.id === ans.question_id);
        if (!question) return;

        const { metric_effects, weight } = question;
        const strength = ans.strength; // 0〜100

        // Iterate over each effect in metric_effects
        Object.entries(metric_effects).forEach(([key, effect]) => {
            const metricKey = key as MetricKey;
            const effectValue = effect as number;

            let delta = 0;
            if (ans.answer) {
                // YES: strength * weight * effect
                delta = strength * weight * effectValue;
            } else {
                // NO: -strength * weight * effect
                // Note: If effect is positive (e.g. exploration +1), 
                // answering NO means exploration decreases (?) or stays same?
                // FUNCTIONS.md says: newValue = currentValue + (-strength * weight * effect)
                // implying NO decreases the metric if effect is positive.
                delta = -strength * weight * effectValue;
            }

            // Update metric value
            newMetrics[metricKey] += delta;

            // Clamp to 0-100
            newMetrics[metricKey] = Math.max(0, Math.min(100, Math.round(newMetrics[metricKey])));
        });
    });

    return newMetrics;
}

/**
 * calcParameters()の直後
 * 5指標の中で最大値のキーを返す
 * カレンダーの色とホームのサマリー表示に使う
 */
export function getDominantMetric(metrics: Metrics): MetricKey {
    let maxKey: MetricKey = 'exploration';
    let maxValue = -1;

    const keys: MetricKey[] = ['exploration', 'immersion', 'organization', 'contribution', 'vitality'];

    keys.forEach((key) => {
        if (metrics[key] > maxValue) {
            maxValue = metrics[key];
            maxKey = key;
        }
    });

    return maxKey;
}

/**
 * 分析画面の各指標詳細モーダル
 * 指標名と値に応じてAdviceテキストとタグを返す
 * DBもAIも使わずローカルの定型文で完結する
 */
export function getParameterComment(
    key: MetricKey,
    value: number
): { advice: string; tags: string[] } {
    // Simple logic based on ranges
    // 0-33: Low
    // 34-66: Normal
    // 67-100: High

    if (value >= 67) {
        // High
        switch (key) {
            case 'exploration':
                return { advice: "好奇心が旺盛です！新しい技術や分野に挑戦するのに最適なタイミングです。", tags: ["#NewTech", "#Learning"] };
            case 'immersion':
                return { advice: "素晴らしい集中力！ゾーンに入っています。疲れに気づきにくいので、ポモドーロタイマー等を活用して。", tags: ["#DeepWork", "#Flow"] };
            case 'organization':
                return { advice: "思考が整理されています。ドキュメント作成や設計タスクが捗るでしょう。", tags: ["#Refactor", "#Docs"] };
            case 'contribution':
                return { advice: "チームへの貢献意欲が高い状態です。コードレビューやペアプロを積極的に行いましょう。", tags: ["#Review", "#Team"] };
            case 'vitality':
                return { advice: "エネルギーに満ち溢れています！高負荷なタスクや運動にも挑戦できるでしょう。", tags: ["#Active", "#Health"] };
        }
    } else if (value >= 34) {
        // Normal
        switch (key) {
            case 'exploration':
                return { advice: "安定した好奇心を保っています。興味のある記事を少し深掘りしてみるのも良いでしょう。", tags: ["#Reading", "#Balance"] };
            case 'immersion':
                return { advice: "適度な集中力です。短時間の集中作業と休憩を繰り返すと効率が良いでしょう。", tags: ["#Task", "#Focus"] };
            case 'organization':
                return { advice: "整理整頓は順調です。タスクの優先順位を見直すのに良い時間です。", tags: ["#Todo", "#Sort"] };
            case 'contribution':
                return { advice: "周囲との連携が取れています。困っている人がいれば声をかけてみましょう。", tags: ["#Sync", "#Support"] };
            case 'vitality':
                return { advice: "体調は安定しています。無理せずマイペースに進めましょう。", tags: ["#Steady", "#Relax"] };
        }
    } else {
        // Low
        switch (key) {
            case 'exploration':
                return { advice: "少し保守的になっているかもしれません。無理に新しいことをせず、慣れた作業で自信を取り戻しましょう。", tags: ["#Routine", "#Comfort"] };
            case 'immersion':
                return { advice: "集中力が低下気味です。環境を変えたり、軽い運動をしてリフレッシュしましょう。", tags: ["#Refresh", "#Walk"] };
            case 'organization':
                return { advice: "頭の中が散らかっているかも。まずは机の周りを片付けるか、TODOを書き出してみましょう。", tags: ["#Clean", "#Note"] };
            case 'contribution':
                return { advice: "自分のことで手一杯かもしれません。まずは自分のタスクを終わらせることに集中しましょう。", tags: ["#Self", "#Focus"] };
            case 'vitality':
                return { advice: "エネルギー切れのサインです。今日は早めに仕事を切り上げて、しっかりと睡眠を取りましょう。", tags: ["#Sleep", "#Rest"] };
        }
    }

    return { advice: "データなし", tags: [] };
}
