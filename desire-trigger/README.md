# DESIRE TRIGGER

ITエンジニアのメンタルコーチングアプリ - 日々の状態を診断し、最適なタスクを提案

---

## 📱 概要

**DESIRE TRIGGER** は、ITエンジニアのメンタルヘルスをサポートするReact Nativeアプリです。

### 主要機能

1. **診断システム**: 5つのパラメータ（探索・没頭・整理・貢献・元気）を測定
2. **AI タスク生成**: Gemini 2.0 Flash による個別最適化タスク
3. **履歴追跡**: カレンダーヒートマップで継続を可視化
4. **モックモード**: 開発・デモ用のモックデータ

---

## 🚀 クイックスタート（3ステップで完了！）

**重要**: Supabase は既にセットアップ済みです。`.env` ファイルの作成だけで動きます！

### 1. 環境構築

```bash
# リポジトリをクローン
git clone <repository-url>
cd desire-trigger

# 依存関係をインストール
npm install

# 環境変数を設定（これだけ！）
cp .env.example .env
# .env ファイルに Supabase URL と Anon Key を記入
```

### 2. アプリ起動

```bash
# 開発サーバーを起動
npx expo start

# iOS Simulator
npx expo start --ios

# Android Emulator
npx expo start --android
```

### 3. モックモードで動作確認

1. アプリ起動後、歯車ボタン（右下）をタップ
2. MOCK モードに切り替え
3. モックデータで動作確認

---

## 📚 ドキュメント

| ファイル | 説明 |
|---------|------|
| **[SETUP.md](./SETUP.md)** | 詳細なセットアップ手順（必読） |
| **[HANDOFF.md](./HANDOFF.md)** | プロジェクト引き継ぎガイド |
| **[FRONTEND_GUIDE.md](./FRONTEND_GUIDE.md)** | フロントエンド開発ガイド（変更OK/NG） |
| **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** | クイックリファレンス（チートシート） |
| **[FUNCTIONS.md](./FUNCTIONS.md)** | 関数リファレンス |

---

## 🏗️ 技術スタック

### フロントエンド
- **フレームワーク**: React Native + Expo
- **言語**: TypeScript
- **スタイリング**: NativeWind (Tailwind CSS)
- **アニメーション**: React Native Reanimated
- **状態管理**: Zustand

### バックエンド
- **BaaS**: Supabase
  - PostgreSQL Database
  - Edge Functions (Deno)
  - Authentication
- **AI**: Gemini 2.0 Flash

---

## 📂 プロジェクト構成

```
desire-trigger/
├── app/                    # 画面（Expo Router）
│   ├── (tabs)/            # タブナビゲーション
│   │   ├── index.tsx      # ホーム画面
│   │   ├── action.tsx     # タスク画面
│   │   ├── history.tsx    # 履歴画面
│   │   └── settings.tsx   # 設定画面
│   ├── question/          # 診断質問
│   ├── welcome.tsx        # ウェルカム画面
│   └── setup.tsx          # プロフィール作成
├── components/            # UIコンポーネント
│   ├── home/             # ホーム画面用
│   ├── action/           # タスク画面用
│   ├── history/          # 履歴画面用
│   └── questions/        # 質問画面用
├── supabase/             # Supabase操作
│   ├── functions/        # Edge Functions
│   │   ├── generate-tasks/
│   │   └── generate-advice/
│   ├── diagnostics.ts    # 診断CRUD
│   ├── tasks.ts          # タスクCRUD
│   └── profiles.ts       # プロフィールCRUD
├── lib/                  # ユーティリティ
│   ├── calcParameters.ts # パラメータ計算
│   └── calcStreak.ts     # ストリーク計算
├── store/                # 状態管理
├── types/                # 型定義
└── constants/            # 定数・モックデータ
```

---

## 🔑 必要な環境変数

```.env
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**取得方法**: [SETUP.md](./SETUP.md#2-supabase-プロジェクト情報) を参照

---

## 🗄️ データベース

### テーブル

- **profiles**: ユーザープロフィール
- **questions**: 診断質問（最低5問必要）
- **diagnostics**: 診断結果
- **tasks**: 生成タスク

### セットアップ

詳細は [SETUP.md](./SETUP.md#3-データベーススキーマ) を参照

---

## 🤖 Edge Functions

### generate-tasks
- **用途**: AIによるタスク生成
- **モデル**: Gemini 2.5 Flash Lite
- **入力**: パラメータスコア、プロフィール、タイミング
- **出力**: 3つの最適化タスク

### generate-advice
- **用途**: パラメータ別アドバイス生成
- **モデル**: Gemini 2.5 Flash Lite
- **入力**: 質問回答、パラメータスコア
- **出力**: 5つのパラメータ別アドバイス

---

## 🎯 開発モード

### MOCKモード
- **用途**: UI確認・デモ・開発
- **データ**: `constants/mockData.ts`
- **設定**: 歯車ボタン → MOCK/LIVE トグル
- **特徴**: Supabase不要で動作

### LIVEモード
- **用途**: 本番動作確認
- **データ**: Supabase
- **要件**: 環境変数が正しく設定されている

---

## 🐛 既知の問題と対処

### パラメータ計算で貢献が0になる
**状態**: ✅ 修正済み（2026-02-20）
- `lib/calcParameters.ts`: 型変換処理を追加
- `app/question/complete.tsx`: 型変換処理を追加

### モックモードに勝手に切り替わる
**状態**: ✅ 修正済み（2026-02-20）
- `store/dataModeStore.ts`: デフォルトを 'live' に変更

---

## 👥 開発者向け

### フロントエンド開発
- [FRONTEND_GUIDE.md](./FRONTEND_GUIDE.md) - 変更OK/NG の詳細ガイド
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - クイックリファレンス

### 新しい開発者の参加
- [SETUP.md](./SETUP.md) - セットアップ手順
- [HANDOFF.md](./HANDOFF.md) - 引き継ぎガイド

---

## 📦 ビルド・デプロイ

### Edge Functions

```bash
# Supabase CLIでログイン
supabase login

# プロジェクトにリンク
supabase link --project-ref xxxxxxxxxxxxx

# Functionをデプロイ
supabase functions deploy generate-tasks
supabase functions deploy generate-advice
```

### アプリビルド

```bash
# iOS
eas build --platform ios

# Android
eas build --platform android
```

---

## 🤝 貢献

### コード規約
- TypeScript strict mode
- Tailwind CSS (NativeWind) でスタイリング
- コンポーネントは300行以下に保つ
- 詳細は [FRONTEND_GUIDE.md](./FRONTEND_GUIDE.md) 参照

### ブランチ戦略
- `main`: 本番ブランチ
- `develop`: 開発ブランチ
- `feature/*`: 機能追加
- `fix/*`: バグ修正

---

## 📄 ライセンス

（ライセンス情報を記載）

---

## 📞 サポート

### ドキュメント
- [Expo](https://docs.expo.dev/)
- [Supabase](https://supabase.com/docs)
- [React Native](https://reactnative.dev/docs)
- [NativeWind](https://www.nativewind.dev/)

### 質問・バグ報告
- Issues: （GitHubリポジトリのIssues URL）
- Contact: （連絡先メールアドレス）

---

**Built with ❤️ by 2026_team24**
