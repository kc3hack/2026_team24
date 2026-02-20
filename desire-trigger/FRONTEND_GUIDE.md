# フロントエンド開発ガイド

このドキュメントは、デザイナーやフロントエンド開発者が安全に作業できる範囲を明確にするためのものです。

---

## 🟢 安全に変更できる領域（FE/デザイン/UX）

以下のファイルやコードは、UI/UX改善のために **自由に変更・実験できます**。

### 1. スタイリング（色・サイズ・レイアウト）

#### ✅ OK: Tailwind クラスの変更
```typescript
// components/ 内の全てのコンポーネント
<View className="bg-slate-900 p-4 rounded-lg">  // ← 色・余白・角丸などは自由に変更OK
<Text className="text-white text-xl font-bold">  // ← フォントサイズ・太さ・色は自由に変更OK
```

#### ✅ OK: StyleSheet による個別スタイル
```typescript
// app/welcome.tsx など
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG_DARK },  // ← レイアウト・色は変更OK
  brandTitle: {
    color: '#FFF',
    fontSize: 28,          // ← サイズ変更OK
    fontWeight: '900',     // ← 太さ変更OK
    letterSpacing: 4,      // ← 文字間隔変更OK
  },
});
```

#### ✅ OK: カラーテーマの変更
```typescript
// app/welcome.tsx
const BG_DARK = '#000208';      // ← 背景色変更OK
const THEME_CYAN = '#00E5FF';   // ← テーマカラー変更OK
const THEME_PURPLE = '#7C5CFF'; // ← アクセントカラー変更OK
```

### 2. アニメーション・エフェクト

#### ✅ OK: Reanimated の timing/easing パラメータ
```typescript
// app/welcome.tsx, components/ など
charge.value = withTiming(1, {
  duration: 1200,  // ← アニメーション時間は変更OK
  easing: Easing.bezier(0.25, 1, 0.5, 1)  // ← イージング変更OK
});

portalOpacity.value = withTiming(0, {
  duration: 400  // ← フェード時間変更OK
});
```

#### ✅ OK: アニメーション演出の追加
```typescript
// 新しいアニメーション効果を追加OK
const scaleAnim = useSharedValue(1);
const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: scaleAnim.value }]
}));
```

### 3. UI コンポーネント（components/）

#### ✅ 完全に変更OK なファイル
```
components/
├── home/
│   ├── ActionSummaryCard.tsx      // ← カードデザイン変更OK
│   ├── CurrentFocusCard.tsx       // ← カード内レイアウト変更OK
│   ├── ParameterRadar.tsx         // ← チャート見た目変更OK
│   └── AnalysisSummaryCard.tsx    // ← デザイン変更OK
├── history/
│   ├── StatusHeatmap.tsx          // ← カレンダー見た目変更OK
│   ├── DayDetail.tsx              // ← 詳細表示デザイン変更OK
│   └── MonthSelectorModal.tsx     // ← モーダルデザイン変更OK
├── action/
│   ├── ActionModal.tsx            // ← モーダル演出変更OK
│   ├── CountdownBar.tsx           // ← プログレスバーデザイン変更OK
│   └── TaskCard.tsx               // ← タスクカードデザイン変更OK
└── questions/
    ├── QuestionCard.tsx           // ← カードデザイン変更OK
    └── SwipeableCard.tsx          // ← スワイプ演出変更OK
```

#### ✅ OK: レイアウト変更
```typescript
// components/home/ActionSummaryCard.tsx
<View className="flex-row justify-between items-center mb-4">
  // ← flex方向・配置・余白などは自由に変更OK
  <Text>残り時間</Text>
  <Text>{timeLeft}</Text>
</View>
```

#### ✅ OK: アイコン・画像の変更
```typescript
// Feather, Ionicons などのアイコン変更OK
<Feather name="zap" size={24} color="#fb923c" />  // ← アイコン名・サイズ・色変更OK
```

### 4. 画面レイアウト（app/）

#### ✅ OK: 画面内のレイアウト調整
```typescript
// app/(tabs)/home.tsx
<ScrollView contentContainerStyle={{ padding: 24 }}>  // ← 余白変更OK
  <View className="mb-8">  // ← マージン変更OK
    {/* コンポーネント配置順序変更OK */}
  </View>
</ScrollView>
```

#### ✅ OK: ヘッダー・フッターのデザイン
```typescript
// app/(tabs)/_layout.tsx
tabBarIcon: ({ color, size }) => (
  <Feather name="home" size={size} color={color} />  // ← アイコン変更OK
),
tabBarLabel: 'ホーム',  // ← ラベル変更OK
```

### 5. モックデータ（表示確認用）

#### ✅ OK: モックデータの調整
```typescript
// constants/mockData.ts
export const MOCK_USER = {
  name: "田中エンジニア",  // ← テスト用名前変更OK
  streak: 23,              // ← テスト用数値変更OK
};

export const MOCK_PARAMETER_SCORES = {
  exploration: 72,  // ← UI確認用のスコア変更OK
  vitality: 80,     // ← デザイン検証用の値変更OK
};
```

---

## 🔴 変更禁止の領域（バックエンド/ロジック）

以下のファイルや領域は、**バックエンド知識が必要**なため、変更しないでください。

### 1. Supabase Edge Functions（絶対触らない）

```
supabase/functions/
├── generate-tasks/index.ts     // ❌ AI連携ロジック - 変更禁止
└── generate-advice/index.ts    // ❌ AI連携ロジック - 変更禁止
```

**理由**: Gemini API呼び出し、プロンプト設計、DB保存ロジックが含まれる

### 2. データベース操作（supabase/）

```
supabase/
├── diagnostics.ts      // ❌ 診断データのCRUD - 変更禁止
├── tasks.ts            // ❌ タスクデータのCRUD - 変更禁止
└── profiles.ts         // ❌ プロフィールデータのCRUD - 変更禁止
```

**理由**: データの整合性、SQL クエリ、エラーハンドリングが必要

### 3. 型定義（types.ts）

```typescript
// types.ts
export interface Diagnostic {
  id: string;
  profile_id: string;
  date: string;
  exploration: number;    // ❌ フィールド名変更禁止
  immersion: number;      // ❌ フィールド追加・削除禁止
  // ...
}
```

**理由**: バックエンドと厳密に連携している。変更するとDB操作が壊れる

### 4. ビジネスロジック関数（lib/）

```
lib/
├── calcStreak.ts           // ❌ ストリーク計算ロジック - 変更禁止
├── scoreCalculator.ts      // ❌ スコア計算ロジック - 変更禁止
└── dateUtils.ts            // ❌ 日付操作ロジック - 変更禁止
```

**理由**: 計算ロジックの変更は、データの信頼性に影響する

### 5. 状態管理（store/）

```
store/
└── dataModeStore.ts    // ❌ MOCK/LIVE切り替えロジック - 変更禁止
```

**理由**: AsyncStorage との同期、初期化順序が重要

---

## ⚠️ 注意が必要な領域（相談推奨）

以下は、デザイン変更が **データロジックに影響する可能性がある** ため、変更前に相談してください。

### 1. データの表示ロジック

#### ⚠️ 相談: データ変換処理
```typescript
// components/history/DayDetail.tsx
const topMetricEntry = Object.entries(metrics).reduce(
  (max, [key, value]) => value > max.value ? { key, value } : max
);
// ↑ 最高値の特定ロジック - 変更する場合は相談
```

#### ⚠️ 相談: 条件分岐による表示切り替え
```typescript
// components/home/ActionSummaryCard.tsx
if (h > 0) {
  setTimeLeft(`${h}時間 ${m}分`);
} else {
  setTimeLeft(`${m}分`);
}
// ↑ 時間表示ロジック - 変更する場合は相談
```

### 2. データの取得タイミング

#### ⚠️ 相談: useEffect, useFocusEffect
```typescript
// app/(tabs)/home.tsx
useFocusEffect(
  useCallback(() => {
    loadTodayTasks();  // ← データ再取得タイミング - 変更する場合は相談
  }, [])
);
```

### 3. フォーム・入力値の処理

#### ⚠️ 相談: 回答値の保存
```typescript
// app/questions.tsx
const handleAnswer = async (direction: 'yes' | 'no', value: number) => {
  // ← 回答データの保存ロジック - 変更する場合は相談
};
```

---

## 📋 チェックリスト

変更前に以下を確認してください：

### ✅ 安全な変更
- [ ] Tailwind クラス名の変更のみ
- [ ] StyleSheet の色・サイズ・余白の変更のみ
- [ ] アニメーションの duration/easing の調整のみ
- [ ] アイコン・画像の差し替えのみ
- [ ] レイアウトの並び順・余白の調整のみ
- [ ] モックデータの数値変更のみ（UI確認用）

### 🔴 危険な変更（相談必須）
- [ ] 型定義（interface/type）の変更
- [ ] データベース操作（supabase/*.ts）の変更
- [ ] ビジネスロジック（lib/*.ts）の変更
- [ ] 状態管理（store/*.ts）の変更
- [ ] Edge Functions（supabase/functions/）の変更
- [ ] データ取得タイミング（useEffect/useFocusEffect）の変更
- [ ] 条件分岐によるデータ表示の変更

---

## 🛠️ 推奨ワークフロー

### 1. デザイン変更したいとき

```bash
# 1. モックモードに切り替え（安全に実験できる）
# アプリ起動 → 歯車ボタン → MOCK モードに切り替え

# 2. 変更したいコンポーネントを特定
# components/ 内のファイルを探す

# 3. スタイル変更
# - className の変更
# - StyleSheet の変更
# - アニメーションパラメータの変更

# 4. 動作確認
# モックデータで表示確認

# 5. ライブモードでも確認
# 歯車ボタン → LIVE モードに切り替えて実データで確認
```

### 2. 新しいコンポーネントを追加したいとき

```typescript
// components/home/NewCard.tsx
import React from 'react';
import { View, Text } from 'react-native';

// ✅ OK: 新しいUIコンポーネントの追加
export default function NewCard({ data }: { data: any }) {
  return (
    <View className="bg-slate-800 p-4 rounded-lg">
      <Text className="text-white text-lg font-bold">
        {data.title}
      </Text>
    </View>
  );
}
```

**注意**: `data` の型や取得方法は相談してください

### 3. 既存の画面レイアウトを変更したいとき

```typescript
// app/(tabs)/home.tsx

// ✅ OK: コンポーネントの並び順変更
<ScrollView>
  <ActionSummaryCard />      // ← 順序入れ替えOK
  <CurrentFocusCard />       // ← 順序入れ替えOK
  <ParameterRadar />         // ← 順序入れ替えOK
</ScrollView>

// ✅ OK: 余白・レイアウト調整
<View className="mb-8 px-4">  // ← クラス変更OK
  <ActionSummaryCard />
</View>
```

---

## 🔍 困ったときのFAQ

### Q1: この値を変えていい？
**A**: 以下を確認してください：
- `className` や `style` の値 → ✅ OK
- コンポーネントの props として渡される値 → ⚠️ 相談
- `supabase/` や `lib/` から来る値 → 🔴 NG

### Q2: アニメーションが遅い/速い
**A**: `duration` を変更してください（✅ OK）
```typescript
withTiming(1, { duration: 1200 })  // ← この数値を変更OK
```

### Q3: 色を変えたい
**A**: 以下の方法で変更できます（✅ OK）
```typescript
// 方法1: Tailwind クラス
<View className="bg-blue-500">  // ← 色変更OK

// 方法2: StyleSheet
backgroundColor: '#3B82F6',  // ← 色変更OK

// 方法3: テーマカラー変数
const THEME_CYAN = '#00E5FF';  // ← 変数の値変更OK
```

### Q4: データが表示されない
**A**: 以下を確認してください：
1. モックモードになっていますか？（歯車ボタンで確認）
2. ライブモードの場合、診断を完了していますか？
3. エラーが出ていませんか？（ターミナルやアプリログを確認）

→ 解決しない場合は相談してください

### Q5: 新しい画面を追加したい
**A**: 以下の手順で追加できます（✅ OK）
```typescript
// app/(tabs)/new-screen.tsx を作成
export default function NewScreen() {
  return (
    <View className="flex-1 bg-slate-900">
      <Text className="text-white">新しい画面</Text>
    </View>
  );
}

// app/(tabs)/_layout.tsx にタブを追加
<Tabs.Screen
  name="new-screen"
  options={{
    tabBarIcon: ({ color }) => <Feather name="star" size={24} color={color} />,
    tabBarLabel: '新機能',
  }}
/>
```

**注意**: データが必要な場合は相談してください

---

## 📞 質問・相談が必要なケース

以下の場合は **必ず相談** してください：

1. **データの構造を変更したい**
   - 例: 新しいパラメータを追加したい
   - 例: スコアの計算方法を変えたい

2. **データの取得・保存を変更したい**
   - 例: タスクの取得タイミングを変えたい
   - 例: 回答の保存方法を変えたい

3. **バックエンドとの連携を変更したい**
   - 例: AI生成タスクのプロンプトを変えたい
   - 例: 診断結果の保存方法を変えたい

4. **エラーが出て解決できない**
   - TypeScript のエラー
   - ランタイムエラー
   - データが表示されない

5. **パフォーマンスに影響しそうな変更**
   - 例: 大量のデータをループ処理したい
   - 例: 複雑な計算を追加したい

---

## 🎨 おすすめの変更例

### 例1: カードの角丸を変更
```typescript
// components/home/ActionSummaryCard.tsx
<View className="bg-slate-800 rounded-lg">  // ← rounded-lg を rounded-2xl に変更OK
```

### 例2: フォントサイズを大きく
```typescript
// app/(tabs)/home.tsx
<Text className="text-2xl font-bold">  // ← text-2xl を text-3xl に変更OK
```

### 例3: カラーテーマを変更
```typescript
// app/welcome.tsx
const THEME_CYAN = '#00E5FF';   // ← '#00FFAA' などに変更OK
const THEME_PURPLE = '#7C5CFF'; // ← '#FF5C7C' などに変更OK
```

### 例4: アニメーションを滑らかに
```typescript
// app/welcome.tsx
charge.value = withTiming(1, {
  duration: 1200,  // ← 1500 に変更してゆっくりにOK
  easing: Easing.out(Easing.quad)  // ← イージング変更OK
});
```

### 例5: 余白を調整
```typescript
// app/(tabs)/home.tsx
<ScrollView contentContainerStyle={{ padding: 24 }}>  // ← 24 を 32 に変更OK
```

---

## ✅ まとめ

### 変更OK
- 🎨 **スタイル**: 色・サイズ・余白・フォント
- 🎬 **アニメーション**: duration・easing・タイミング
- 🧩 **レイアウト**: 並び順・配置・余白
- 🖼️ **UI要素**: アイコン・画像・テキスト
- 📊 **モックデータ**: テスト用の数値

### 変更NG
- 🗄️ **データベース**: supabase/*.ts
- 🤖 **AI連携**: supabase/functions/
- 📐 **型定義**: types.ts
- 🧮 **ロジック**: lib/*.ts
- 💾 **状態管理**: store/*.ts

### 相談推奨
- 🔄 **データ変換**: reduce/map/filter によるデータ加工
- ⏱️ **取得タイミング**: useEffect/useFocusEffect
- 📝 **入力処理**: フォーム・回答の保存

---

このガイドに沿って作業すれば、安全にUI/UXを改善できます！
困ったときはいつでも相談してください 👍
