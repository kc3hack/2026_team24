# Desire Trigger — 関数実装ガイド

> このファイルはantigravityが実装する際の仕様書です。
> 型定義は `types/index.ts` を参照してください。

---

## supabase/client.ts

```typescript
// Supabaseクライアントの初期化
// すべてのsupabase/*.tsからimportして使う

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

---

## supabase/profiles.ts

### `saveProfile`

```typescript
/**
 * 【いつ使う】
 * 初期セットアップ完了時（ホームへ進むボタンを押したとき）
 * 一度だけ呼ぶ。返ってきたprofile_idをAsyncStorageに保存する。
 *
 * 【引数】
 * data: OnboardingInput — セットアップ画面で入力した情報
 *   - name: string           例: "Kubo_J"
 *   - job_title: JobTitle    例: "Frontend"
 *   - job_title_other?: string  job_titleが"Other"の場合のみ
 *   - hobbies: string[]      例: ["音楽", "ゲーム"]
 *   - interests: string[]    例: ["AI", "セキュリティ"]
 *   - current_mode: CurrentMode  例: "成長期"（ユーザーには見せない）
 *   - notify_time: string    例: "21:00"
 *
 * 【返り値】
 * Promise<string> — 生成されたprofile_id（UUIDの文字列）
 *
 * 【使用例】
 * const profileId = await saveProfile(onboardingInput)
 * await AsyncStorage.setItem('profile_id', profileId)
 */
export async function saveProfile(data: OnboardingInput): Promise<string>
```

---

### `getProfile`

```typescript
/**
 * 【いつ使う】
 * - ホーム画面起動時（名前の表示）
 * - 設定モーダル起動時（現在の設定値の表示）
 * - Edge Function呼び出し時（job_title / hobbies / interestsをプロンプトに渡す）
 *
 * 【引数】
 * profileId: string — AsyncStorageから取得したprofile_id
 *
 * 【返り値】
 * Promise<Profile> — プロフィール情報全体
 *
 * 【使用例】
 * const profileId = await AsyncStorage.getItem('profile_id')
 * const profile = await getProfile(profileId!)
 * // → profile.nameでホーム画面に名前を表示
 */
export async function getProfile(profileId: string): Promise<Profile>
```

---

### `updateProfile`

```typescript
/**
 * 【いつ使う】
 * 設定モーダルで保存ボタンを押したとき
 *
 * 【引数】
 * profileId: string — AsyncStorageから取得したprofile_id
 * data: Partial<Profile> — 更新したい項目だけ渡す
 *   変更可能な項目: job_title / job_title_other / notify_time
 *
 * 【返り値】
 * Promise<void>
 *
 * 【使用例】
 * await updateProfile(profileId, { job_title: 'Backend', notify_time: '22:00' })
 */
export async function updateProfile(profileId: string, data: Partial<Profile>): Promise<void>
```

---

## supabase/questions.ts

### `fetchQuestions`

```typescript
/**
 * 【いつ使う】
 * 質問画面の起動時に一度だけ呼ぶ
 * questionsテーブルから全件取得してローカルstateに持つ
 *
 * 【引数】
 * なし
 *
 * 【返り値】
 * Promise<Question[]> — 質問の配列
 *   各Questionは以下を含む:
 *   - id: number
 *   - text: string             例: "今日、新しいことを学びましたか？"
 *   - metric_effects: Partial<Metrics>  例: { exploration: 1, vitality: -1 }
 *   - weight: number           例: 0.8
 *
 * 【使用例】
 * const questions = await fetchQuestions()
 * // → スワイプUIに渡して表示
 */
export async function fetchQuestions(): Promise<Question[]>
```

---

## supabase/diagnostics.ts

### `saveDiagnostic`

```typescript
/**
 * 【いつ使う】
 * 全5問のスワイプが完了した直後
 * calcParameters()で計算した結果をDBに保存する
 * 返ってきたdiagnostic_idをEdge Function呼び出しに使う
 *
 * 【引数】
 * profileId: string     — AsyncStorageから取得したprofile_id
 * metrics: Metrics      — calcParameters()の計算結果
 *   { exploration, immersion, organization, contribution, vitality }
 * answers: QuestionAnswer[] — スワイプの回答一覧
 *   [{ question_id, answer: boolean, strength: number }, ...]
 * dominantMetric: MetricKey — getDominantMetric()の計算結果
 *
 * 【返り値】
 * Promise<string> — 生成されたdiagnostic_id
 *
 * 【使用例】
 * const metrics = calcParameters(answers, questions, prevMetrics)
 * const dominant = getDominantMetric(metrics)
 * const diagnosticId = await saveDiagnostic(profileId, metrics, answers, dominant)
 * // → diagnosticIdをタイミング選択画面に渡す
 */
export async function saveDiagnostic(
  profileId: string,
  metrics: Metrics,
  answers: QuestionAnswer[],
  dominantMetric: MetricKey
): Promise<string>
```

---

### `getTodayDiagnostic`

```typescript
/**
 * 【いつ使う】
 * ホーム画面起動時に「今日すでに診断済みか」を判定するため
 * nullなら未診断→発射ボタン表示、あれば診断済み→サマリー表示
 *
 * 【引数】
 * profileId: string
 *
 * 【返り値】
 * Promise<Diagnostic | null> — 今日の診断があればDiagnostic、なければnull
 *
 * 【使用例】
 * const todayDiag = await getTodayDiagnostic(profileId)
 * if (!todayDiag) {
 *   // 未診断 → 「今日の質問に答えよう！」表示
 * } else {
 *   // 診断済み → サマリー表示
 * }
 */
export async function getTodayDiagnostic(profileId: string): Promise<Diagnostic | null>
```

---

### `getLatestDiagnostic`

```typescript
/**
 * 【いつ使う】
 * - ホーム画面の分析サマリー（dominant_metricの表示）
 * - 分析画面のレーダーチャート
 *
 * 【引数】
 * profileId: string
 *
 * 【返り値】
 * Promise<Diagnostic | null> — 最新の診断結果、一度も診断していなければnull
 *
 * 【使用例】
 * const latest = await getLatestDiagnostic(profileId)
 * // → latest.immersionでレーダーチャートを描画
 */
export async function getLatestDiagnostic(profileId: string): Promise<Diagnostic | null>
```

---

### `getDiagnosticHistory`

```typescript
/**
 * 【いつ使う】
 * 分析画面の推移グラフ表示時
 * 全履歴を取得して各指標の折れ線グラフを描画する
 *
 * 【引数】
 * profileId: string
 *
 * 【返り値】
 * Promise<Diagnostic[]> — 日付昇順の診断履歴配列
 *
 * 【使用例】
 * const history = await getDiagnosticHistory(profileId)
 * // → history.map(d => d.vitality) で元気の推移グラフを描画
 */
export async function getDiagnosticHistory(profileId: string): Promise<Diagnostic[]>
```

---

### `getCalendarData`

```typescript
/**
 * 【いつ使う】
 * 履歴画面のカレンダー表示時
 * 月単位で取得してマスの色を決める
 * 月をまたぐときだけ再取得する（毎回取得しない）
 *
 * 【引数】
 * profileId: string
 * year: number   例: 2026
 * month: number  例: 2（1〜12）
 *
 * 【返り値】
 * Promise<{ date: string; dominant_metric: MetricKey }[]>
 * 例: [{ date: "2026-02-18", dominant_metric: "immersion" }, ...]
 *
 * 【色の対応】
 * exploration  → 青 #3B82F6
 * immersion    → 緑 #10B981
 * organization → 紫 #8B5CF6
 * contribution → オレンジ #F97316
 * vitality     → シアン #06B6D4
 * null（未回答）→ グレー
 *
 * 【使用例】
 * const calData = await getCalendarData(profileId, 2026, 2)
 * // → calData.find(d => d.date === "2026-02-18")?.dominant_metric でその日の色を決定
 */
export async function getCalendarData(
  profileId: string,
  year: number,
  month: number
): Promise<{ date: string; dominant_metric: MetricKey }[]>
```

---

### `getDiagnosticByDate`

```typescript
/**
 * 【いつ使う】
 * 履歴画面でカレンダーのマスをタップしたとき
 * その日のレーダーチャートを表示するため
 *
 * 【引数】
 * profileId: string
 * date: string  例: "2026-02-18"
 *
 * 【返り値】
 * Promise<Diagnostic | null> — その日の診断、なければnull
 *
 * 【使用例】
 * const diag = await getDiagnosticByDate(profileId, "2026-02-18")
 * // → diag.explorationなどでレーダーチャートを描画
 */
export async function getDiagnosticByDate(profileId: string, date: string): Promise<Diagnostic | null>
```

---

## supabase/tasks.ts

### `fetchTodayTasks`

```typescript
/**
 * 【いつ使う】
 * - 行動画面起動時（タスクカード3枚の表示）
 * - ホーム画面の行動サマリー（完了数/3と残り時間の表示）
 * expires_atが現在時刻より未来のタスクだけ返す
 *
 * 【引数】
 * profileId: string
 *
 * 【返り値】
 * Promise<Task[]> — 有効期限内のタスク（最大3件）
 *   各Taskは以下を含む:
 *   - id, title, description, level, category
 *   - action_timing, status, expires_at, created_at
 *
 * 【使用例】
 * const tasks = await fetchTodayTasks(profileId)
 * const completedCount = tasks.filter(t => t.status === 'applied').length
 * // → `${completedCount}/3` でホームサマリーに表示
 */
export async function fetchTodayTasks(profileId: string): Promise<Task[]>
```

---

### `completeTask`

```typescript
/**
 * 【いつ使う】
 * 行動画面のタスク詳細モーダルで長押し実行ボタンを押したとき
 * statusをappliedに更新してcompleted_atを記録する
 *
 * 【引数】
 * taskId: string — 完了したタスクのid
 *
 * 【返り値】
 * Promise<void>
 *
 * 【使用例】
 * await completeTask(task.id)
 * // → UIでカードをApplied表示にして薄くする
 */
export async function completeTask(taskId: string): Promise<void>
```

---

### `fetchTasksByDate`

```typescript
/**
 * 【いつ使う】
 * 履歴画面でカレンダーのマスをタップしたとき
 * その日の完了タスク一覧を表示するため
 *
 * 【引数】
 * profileId: string
 * date: string  例: "2026-02-18"
 *
 * 【返り値】
 * Promise<Task[]> — その日に生成されたタスク（完了済みのみ）
 *
 * 【使用例】
 * const tasks = await fetchTasksByDate(profileId, "2026-02-18")
 * // → tasks.map(t => t.title) で達成タスク一覧を表示
 */
export async function fetchTasksByDate(profileId: string, date: string): Promise<Task[]>
```

---

## lib/calcParameters.ts

### `calcParameters`

```typescript
/**
 * 【いつ使う】
 * 全5問のスワイプ完了直後
 * 回答とSYNC STRENGTHからパラメータを計算する
 * この結果をレーダーチャートに表示してDBに保存する
 *
 * 【引数】
 * answers: QuestionAnswer[]  — スワイプの回答一覧
 *   [{ question_id, answer: boolean, strength: number(0〜100) }]
 * questions: Question[]      — fetchQuestions()で取得した質問一覧
 *   metric_effectsとweightが入っている
 * currentMetrics: Metrics    — 前回の診断結果（初回はすべて50）
 *
 * 【計算式】
 * answer=true(YES):  newValue = currentValue + (strength * weight * effect)
 * answer=false(NO):  newValue = currentValue + (-strength * weight * effect)
 * クランプ: Math.max(0, Math.min(100, newValue))
 *
 * 【返り値】
 * Metrics — 計算後の5指標
 *
 * 【使用例】
 * const newMetrics = calcParameters(answers, questions, prevMetrics)
 * // → レーダーチャートに表示
 * // → saveDiagnostic()に渡す
 */
export function calcParameters(
  answers: QuestionAnswer[],
  questions: Question[],
  currentMetrics: Metrics
): Metrics
```

---

### `getDominantMetric`

```typescript
/**
 * 【いつ使う】
 * calcParameters()の直後
 * 5指標の中で最大値のキーを返す
 * カレンダーの色とホームのサマリー表示に使う
 *
 * 【引数】
 * metrics: Metrics
 *
 * 【返り値】
 * MetricKey — 最大値の指標名
 *
 * 【使用例】
 * const dominant = getDominantMetric(newMetrics)
 * // → "immersion" → 緑の日としてカレンダーに記録
 */
export function getDominantMetric(metrics: Metrics): MetricKey
```

---

### `getParameterComment`

```typescript
/**
 * 【いつ使う】
 * 分析画面の各指標詳細モーダル
 * 指標名と値に応じてAdviceテキストとタグを返す
 * DBもAIも使わずローカルの定型文で完結する
 *
 * 【引数】
 * key: MetricKey    — 指標名（例: 'immersion'）
 * value: number     — 指標の値（0〜100）
 *
 * 【返り値】
 * { advice: string; tags: string[] }
 * 例: {
 *   advice: "素晴らしい集中力！ゾーンに入っています。疲れに気づきにくいので、ポモドーロタイマー等を活用して。",
 *   tags: ["#Output", "#Flow"]
 * }
 *
 * 【値の範囲と文言の目安】
 * 0〜33:  低い状態のアドバイス
 * 34〜66: 普通状態のアドバイス
 * 67〜100: 高い状態のアドバイス
 *
 * 【使用例】
 * const { advice, tags } = getParameterComment('immersion', 90)
 * // → 分析詳細モーダルのAdviceカードに表示
 */
export function getParameterComment(
  key: MetricKey,
  value: number
): { advice: string; tags: string[] }
```

---

## lib/taskUtils.ts

### `getTaskLevels`

```typescript
/**
 * 【いつ使う】
 * タイミング選択後、Edge Functionを叩く直前
 * vitalityスコアに基づいてタスクレベル構成を決定する
 * この結果をEdge Functionのtask_levelsパラメータに渡す
 *
 * 【引数】
 * metrics: Metrics
 *
 * 【返り値】
 * 'quick/quick/quick' | 'quick/core/core' | 'core/deep/deep'
 *
 * 【ロジック】
 * vitality < 20              → 'quick/quick/quick'（疲弊: 負荷を下げる）
 * vitality 20〜70            → 'quick/core/core'（普通: 適度な負荷）
 * vitality > 70 &&
 *   (exploration or immersion > 60) → 'core/deep/deep'（元気: 高負荷OK）
 * それ以外                   → 'quick/core/core'（デフォルト）
 *
 * 【使用例】
 * const taskLevels = getTaskLevels(metrics)
 * await generateTasks({ ..., task_levels: taskLevels })
 */
export function getTaskLevels(metrics: Metrics): string
```

---

### `isTaskExpired`

```typescript
/**
 * 【いつ使う】
 * 行動画面でタスクを表示するとき
 * expires_atが過ぎていたら表示しない判定に使う
 * （fetchTodayTasksでもDB側でフィルタするが、表示直前にも確認する）
 *
 * 【引数】
 * expiresAt: ISODateString — タスクのexpires_at
 *
 * 【返り値】
 * boolean — trueなら期限切れ
 *
 * 【使用例】
 * if (isTaskExpired(task.expires_at)) {
 *   // 履歴扱いにする
 * }
 */
export function isTaskExpired(expiresAt: ISODateString): boolean
```

---

### `getRemainingTime`

```typescript
/**
 * 【いつ使う】
 * 行動画面・ホームサマリーの残り時間表示
 * "残り 18:32" のようなフォーマット済み文字列を返す
 *
 * 【引数】
 * expiresAt: ISODateString
 *
 * 【返り値】
 * string — 例: "18:32"、期限切れなら "00:00"
 *
 * 【使用例】
 * const remaining = getRemainingTime(task.expires_at)
 * // → `残り ${remaining}` でUIに表示
 */
export function getRemainingTime(expiresAt: ISODateString): string
```

---

## lib/calcStreak.ts

### `calcStreak`

```typescript
/**
 * 【いつ使う】
 * プロフィール画面のストリーク表示
 * 今日から遡って連続して診断している日数を返す
 *
 * 【引数】
 * diagnostics: Diagnostic[] — getDiagnosticHistory()で取得した全履歴
 *
 * 【返り値】
 * number — 連続日数（例: 12）
 *
 * 【ロジック】
 * 今日から1日ずつ遡って診断があれば+1
 * 空白日があった時点でストップ
 *
 * 【使用例】
 * const history = await getDiagnosticHistory(profileId)
 * const streak = calcStreak(history)
 * // → プロフィール画面に "12 ストリーク" と表示
 */
export function calcStreak(diagnostics: Diagnostic[]): number
```

---

## lib/initUser.ts

### `initUser`

```typescript
/**
 * 【いつ使う】
 * タイトル画面の起動時に一番最初に呼ぶ
 * AsyncStorageにprofile_idがあるかを確認して画面遷移先を決める
 * アプリ全体の起点となる関数
 *
 * 【引数】
 * なし
 *
 * 【返り値】
 * Promise<{ isFirstTime: boolean; profileId: string | null }>
 * - isFirstTime: true  → 初回 → セットアップ画面へ遷移
 * - isFirstTime: false → 2回目以降 → ホーム画面へ遷移
 * - profileId: AsyncStorageに保存されているprofile_id（初回はnull）
 *
 * 【使用例】
 * const { isFirstTime, profileId } = await initUser()
 * if (isFirstTime) {
 *   router.replace('/setup')
 * } else {
 *   router.replace('/home')
 * }
 */
export async function initUser(): Promise<{ isFirstTime: boolean; profileId: string | null }>
```

---

## lib/taskUtils.ts への追加

### `getTimingOptions`

```typescript
/**
 * 【いつ使う】
 * タイミング選択画面の起動時
 * 現在時刻によって選択肢のラベルと値を出し分ける
 *
 * 【引数】
 * currentHour: number — 現在時刻の時（0〜23）
 *
 * 【返り値】
 * { label: string; value: ActionTiming }[]
 *
 * 【時間帯ごとの選択肢】
 * 18時以降（夜）:
 *   [{ label: "🌙 今からやる", value: "night" },
 *    { label: "☀️ 明日の朝やる", value: "morning" },
 *    { label: "🎲 おまかせ", value: "auto" }]
 * 12時未満（朝）:
 *   [{ label: "☀️ 今からやる", value: "morning" },
 *    { label: "🌙 今夜やる", value: "night" },
 *    { label: "🎲 おまかせ", value: "auto" }]
 * 12〜18時（昼）:
 *   [{ label: "🌞 今からやる", value: "auto" },
 *    { label: "🌙 今夜やる", value: "night" },
 *    { label: "🎲 おまかせ", value: "auto" }]
 *
 * 【使用例】
 * const hour = new Date().getHours()
 * const options = getTimingOptions(hour)
 * // → チップUIのボタンリストとして表示
 */
export function getTimingOptions(
  currentHour: number
): { label: string; value: ActionTiming }[]
```

---

## supabase/generateTasks.ts

### `callGenerateTasks`

```typescript
/**
 * 【いつ使う】
 * タイミング選択後、レーダーチャート表示と同時にバックグラウンドで呼ぶ
 * SupabaseのEdge Functionをフロントから呼び出すラッパー関数
 * レーダーチャートを見ている間にAI生成が完了するイメージ
 *
 * 【引数】
 * request: GenerateTasksRequest
 *   - profile_id: string
 *   - diagnostic_id: string       saveDiagnostic()の返り値
 *   - timing: ActionTiming        タイミング選択画面でユーザーが選んだ値
 *   - task_levels: string         getTaskLevels()の返り値
 *   - profile: {
 *       job_title: string
 *       hobbies: string[]
 *       interests: string[]
 *     }
 *   - metrics: Metrics            calcParameters()の計算結果
 *
 * 【返り値】
 * Promise<{ success: boolean; task_ids: string[] }>
 *
 * 【使用例】
 * const taskLevels = getTaskLevels(metrics)
 * const result = await callGenerateTasks({
 *   profile_id: profileId,
 *   diagnostic_id: diagnosticId,
 *   timing: selectedTiming,
 *   task_levels: taskLevels,
 *   profile: { job_title, hobbies, interests },
 *   metrics,
 * })
 * // → result.successがtrueならfetchTodayTasks()を呼んでタスク表示
 */
export async function callGenerateTasks(
  request: GenerateTasksRequest
): Promise<{ success: boolean; task_ids: string[] }>
```

---

## hooks/useNotification.ts

### `scheduleNotification`

```typescript
/**
 * 【いつ使う】
 * - 初期セットアップ完了時（初回設定）
 * - 設定モーダルで通知時間を変更したとき
 * Expo Notificationsで毎日指定時刻に通知をスケジュールする
 *
 * 【引数】
 * time: string — "21:00" 形式
 *
 * 【返り値】
 * Promise<void>
 *
 * 【使用例】
 * await scheduleNotification("21:00")
 * // → 毎日21:00に「今日の診断の時間です⏰」が届く
 */
export async function scheduleNotification(time: string): Promise<void>
```

---

### `scheduleReminderNotification`

```typescript
/**
 * 【いつ使う】
 * タスクが生成された後（未完了タスクがある状態になったとき）
 * 翌朝8:00に「昨日のタスクが未完了です」通知をセットする
 * 設定モーダルでReminderがONの場合のみ実行する
 *
 * 【引数】
 * なし（翌朝8:00固定）
 *
 * 【返り値】
 * Promise<void>
 *
 * 【使用例】
 * // Edge Function完了後（タスク生成後）に呼ぶ
 * await scheduleReminderNotification()
 */
export async function scheduleReminderNotification(): Promise<void>
```
