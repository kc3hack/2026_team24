import { DBQuestion, QuestionAnswer, ParameterScores, MetricKey } from '../types';

/**
 * 質問の回答からパラメータスコアを計算
 *
 * 計算式:
 * 各パラメータ = Σ(swipeValue × weight × metric_effect)
 * - yesなら+方向、noなら-方向
 * - 最終的に0-100にクランプ・正規化
 */
export function calculateParameters(answers: QuestionAnswer[], questions: DBQuestion[]): ParameterScores {
    // デバッグ用：入力値を出力
    console.log('=== calculateParameters START ===');
    console.log('Answers:', JSON.stringify(answers, null, 2));
    console.log('Questions count:', questions.length);

    // 初期値
    const scores: ParameterScores = {
        exploration: 50,
        immersion: 50,
        organization: 50,
        contribution: 50,
        vitality: 50,
    };

    // 各回答を処理
    answers.forEach((answer, index) => {
        // 型チェック用ログ
        console.log(`Answer ${index} question_id type:`, typeof answer.question_id, 'value:', answer.question_id);

        // 🔧 型変換対応：question_id が文字列の場合も数値の場合も対応
        const questionIdNumber = typeof answer.question_id === 'string'
            ? parseInt(answer.question_id, 10)
            : answer.question_id;

        const question = questions.find(q => {
            console.log(`  Comparing question id=${q.id} (${typeof q.id}) with answer question_id=${questionIdNumber} (normalized)`);
            return q.id === questionIdNumber;
        });

        if (!question) {
            console.log(`⚠️ Answer ${index}: Question not found for question_id=${answer.question_id} (type: ${typeof answer.question_id})`);
            console.log(`  Available question IDs:`, questions.map(q => `${q.id} (${typeof q.id})`));
            return;
        }

        console.log(`✅ Answer ${index}: Found question id=${question.id}, text="${question.text}"`);

        const { metric_effects, weight } = question;
        const { direction, swipe_value } = answer;

        console.log(`  - metric_effects:`, metric_effects);
        console.log(`  - weight:`, weight);
        console.log(`  - direction:`, direction);
        console.log(`  - swipe_value:`, swipe_value);

        // スワイプ値を0-1の範囲に正規化
        const normalizedSwipe = swipe_value / 100;

        // 各メトリックへの影響を計算
        Object.entries(metric_effects).forEach(([metric, effect]) => {
            const metricKey = metric as MetricKey;

            // yesなら+、noなら-
            const directionMultiplier = direction === 'yes' ? 1 : -1;

            // 影響値を計算（-50 〜 +50の範囲）
            const impact = normalizedSwipe * weight * effect * directionMultiplier * 50;

            console.log(`    ${metricKey}: ${scores[metricKey]} + ${impact.toFixed(2)} = ${(scores[metricKey] + impact).toFixed(2)}`);

            // スコアに加算
            scores[metricKey] += impact;
        });
    });

    console.log('Scores before clamp:', scores);

    // 0-100にクランプし、小数点第1位まで保持
    const clampedScores: ParameterScores = {
        exploration: Math.round(Math.max(0, Math.min(100, scores.exploration)) * 10) / 10,
        immersion: Math.round(Math.max(0, Math.min(100, scores.immersion)) * 10) / 10,
        organization: Math.round(Math.max(0, Math.min(100, scores.organization)) * 10) / 10,
        contribution: Math.round(Math.max(0, Math.min(100, scores.contribution)) * 10) / 10,
        vitality: Math.round(Math.max(0, Math.min(100, scores.vitality)) * 10) / 10,
    };

    // デバッグ用：計算結果を出力
    console.log('=== FINAL Parameters (小数点第1位まで) ===');
    console.log('Parameters:', clampedScores);
    console.log('=== calculateParameters END ===');

    return clampedScores;
}
