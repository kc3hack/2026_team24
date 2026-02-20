# フロントエンド開発クイックリファレンス

開発中に素早く確認できるチートシート

---

## 🟢 変更OK → そのまま実装

| カテゴリ | 例 | ファイル |
|---------|-----|---------|
| 色 | `className="bg-blue-500"` | components/, app/ |
| サイズ | `className="text-2xl"` | components/, app/ |
| 余白 | `className="p-4 m-2"` | components/, app/ |
| 角丸 | `className="rounded-lg"` | components/, app/ |
| フォント | `fontWeight: '700'` | components/, app/ |
| アニメーション速度 | `duration: 1200` | components/, app/ |
| イージング | `easing: Easing.out()` | components/, app/ |
| アイコン | `<Feather name="star">` | components/, app/ |
| レイアウト順序 | コンポーネントの並び替え | app/(tabs)/ |
| モックデータ | 数値の変更 | constants/mockData.ts |

---

## 🔴 変更NG → 必ず拒否

| ファイルパス | 理由 |
|-------------|------|
| `supabase/functions/**/*.ts` | AI連携・プロンプト設計 |
| `supabase/diagnostics.ts` | DB操作・SQLクエリ |
| `supabase/tasks.ts` | DB操作・SQLクエリ |
| `supabase/profiles.ts` | DB操作・SQLクエリ |
| `types.ts` | DB連携・型の整合性 |
| `lib/calcStreak.ts` | ビジネスロジック |
| `lib/scoreCalculator.ts` | ビジネスロジック |
| `lib/dateUtils.ts` | ビジネスロジック |
| `store/dataModeStore.ts` | 状態管理・AsyncStorage同期 |

---

## ⚠️ 変更前に確認 → ユーザーに聞く

| パターン | 例 |
|---------|-----|
| `reduce/map/filter` | データ変換処理 |
| `Object.entries()` | 最大値・最小値の特定 |
| `useEffect` | データ取得タイミング |
| `useFocusEffect` | 画面フォーカス時の処理 |
| `AsyncStorage.setItem` | ローカルストレージ保存 |
| 条件分岐による表示 | `if (score > 80)` など |

---

## 📁 ファイル分類

### ✅ 自由に変更OK

```
components/
├── home/
│   ├── ActionSummaryCard.tsx
│   ├── CurrentFocusCard.tsx
│   ├── ParameterRadar.tsx
│   └── AnalysisSummaryCard.tsx
├── history/
│   ├── StatusHeatmap.tsx
│   ├── DayDetail.tsx
│   └── MonthSelectorModal.tsx
├── action/
│   ├── ActionModal.tsx
│   ├── CountdownBar.tsx
│   └── TaskCard.tsx
└── questions/
    ├── QuestionCard.tsx
    └── SwipeableCard.tsx

app/
├── (tabs)/
│   ├── home.tsx
│   ├── action.tsx
│   ├── history.tsx
│   └── settings.tsx
├── welcome.tsx
├── setup.tsx
└── questions.tsx

constants/
└── mockData.ts  (値のみ)
```

### ❌ 変更禁止

```
supabase/
├── functions/
│   ├── generate-tasks/index.ts
│   └── generate-advice/index.ts
├── diagnostics.ts
├── tasks.ts
└── profiles.ts

lib/
├── calcStreak.ts
├── scoreCalculator.ts
└── dateUtils.ts

store/
└── dataModeStore.ts

types.ts
```

---

## 🎨 よくある変更パターン

### パターン1: 色変更

```typescript
// ❌ 前
<View className="bg-slate-800">

// ✅ 後
<View className="bg-slate-900">
```

### パターン2: サイズ変更

```typescript
// ❌ 前
<Text className="text-lg font-bold">

// ✅ 後
<Text className="text-xl font-bold">
```

### パターン3: 余白調整

```typescript
// ❌ 前
<View className="p-4 mb-2">

// ✅ 後
<View className="p-6 mb-4">
```

### パターン4: 角丸変更

```typescript
// ❌ 前
<View className="rounded-lg">

// ✅ 後
<View className="rounded-2xl">
```

### パターン5: アニメーション速度

```typescript
// ❌ 前
withTiming(1, { duration: 1200 })

// ✅ 後
withTiming(1, { duration: 800 })  // 速く
withTiming(1, { duration: 1800 }) // 遅く
```

### パターン6: テーマカラー

```typescript
// app/welcome.tsx
const THEME_CYAN = '#00E5FF';   // ✅ 変更OK
const THEME_PURPLE = '#7C5CFF'; // ✅ 変更OK
const THEME_GREEN = '#39FF14';  // ✅ 変更OK
```

---

## 🚨 危険なコードの見分け方

### 🔴 これが含まれていたら要注意

```typescript
// データベース操作
supabase.from('tasks').select()
supabase.from('diagnostics').insert()

// 型定義
export interface Diagnostic {
export type MetricKey =

// ビジネスロジック
function calculateScore(
function calcStreak(

// 状態管理
AsyncStorage.setItem('data_mode'

// Edge Function
Deno.env.get('GEMINI_API_KEY'
```

### ✅ これなら安全

```typescript
// スタイル
className="bg-blue-500 p-4"
style={{ backgroundColor: '#3B82F6' }}

// アニメーション
withTiming(1, { duration: 1000 })
useSharedValue(0)

// レイアウト
<View className="flex-row">
<ScrollView>

// アイコン
<Feather name="star" size={24} />
```

---

## 📋 実装フローチャート

```
変更依頼を受ける
    ↓
変更するファイルは？
    ↓
┌───────────────────────────────┐
│                               │
components/ or app/          supabase/ or lib/ or store/
    ↓                             ↓
変更内容は？                    ❌ 変更拒否
    ↓                         「バックエンド開発者に相談」
┌───────────────┐
│               │
スタイル・       データ処理
アニメーション     含む？
    ↓               ↓
✅ すぐ実装      ⚠️ ユーザー確認
                    ↓
                  OK?
                    ↓
              ┌─────┴─────┐
             YES           NO
              ↓             ↓
          ✅ 実装      別案を提案
```

---

## 🛠️ トラブルシューティング

### Q: TypeScript エラーが出た

```typescript
// 型エラーの場合
// ❌ 型定義を変更する（types.ts） → NG
// ✅ コンポーネント内で型アサーション → OK
const metric = data.metric as MetricKey;
```

### Q: データが表示されない

```
1. モックモードになっているか確認
   歯車ボタン → MOCKモードに切り替え

2. ライブモードの場合
   - 診断を完了しているか？
   - タスクを生成しているか？

3. エラーログを確認
   ターミナルやアプリログをチェック
```

### Q: アニメーションが動かない

```typescript
// useSharedValue を使っているか確認
const opacity = useSharedValue(1); // ✅

// useAnimatedStyle を使っているか確認
const animStyle = useAnimatedStyle(() => ({
  opacity: opacity.value
})); // ✅
```

---

## 📞 質問テンプレート

### バックエンド開発者に聞くとき

```
【変更したいこと】
（例）履歴画面のスコア計算方法を変更したい

【理由】
（例）最高値ではなく平均値を表示したい

【影響範囲】
（例）DayDetail.tsx のデータ変換ロジック

【質問】
この変更はフロントエンド側で対応可能ですか？
それともバックエンドロジックの変更が必要ですか？
```

---

## ✅ チェックリスト

変更前に確認：

- [ ] 変更するファイルは components/ か app/ か？
- [ ] スタイル・レイアウト・アニメーションのみか？
- [ ] データ取得・保存ロジックは触っていないか？
- [ ] 型定義は変更していないか？
- [ ] モックモードで動作確認できるか？

すべて ✅ なら実装OK！

---

## 🎯 まとめ

| 👍 変更OK | 👎 変更NG |
|----------|----------|
| 色・サイズ・余白 | データベース操作 |
| アニメーション速度 | AI連携ロジック |
| レイアウト順序 | 型定義 |
| アイコン・画像 | ビジネスロジック |
| モックデータ | 状態管理 |

**迷ったら → 質問する**

---

このチートシートを手元に置いて、安全に開発を進めましょう！
