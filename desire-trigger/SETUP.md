# セットアップガイド - DESIRE TRIGGER

このドキュメントは、他の開発者がローカル環境でアプリを動かすために必要な情報をまとめたものです。

---

## 🎉 重要なお知らせ

**Supabase は既にセットアップ済みです！**

- データベーススキーマ：設定済み
- 質問データ：投入済み
- Edge Functions：デプロイ済み
- Gemini API Key：設定済み

**あなたがすることは `.env` ファイルの作成だけです！**

---

## 📋 必要な情報・ツール

### 1. 開発環境

#### 必須ツール
```bash
# Node.js (v18以上推奨)
node --version  # v18.x.x 以上

# npm または yarn
npm --version   # 9.x.x 以上

# Expo CLI
npm install -g expo-cli

# Git
git --version
```

#### プラットフォーム別

**iOS（Mac のみ）**:
- Xcode (最新版)
- iOS Simulator

**Android**:
- Android Studio
- Android Emulator または実機

---

### 2. Supabase プロジェクト情報

#### 必要な環境変数

プロジェクトルートに `.env` ファイルを作成し、以下を記載：

```bash
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Gemini API (Edge Functions用)
# ※ これはSupabase Edge Functionsのシークレットとして設定
```

#### Supabase プロジェクトの設定

1. **プロジェクトURL**: `https://xxxxxxxxxxxxx.supabase.co`
2. **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
3. **Service Role Key**: （必要に応じて）

**取得方法**:
1. Supabase ダッシュボード → Settings → API
2. Project URL と anon key をコピー

---

### 3. データベーススキーマ（参考情報 - 既に設定済み）

**注意**: 以下は参考情報です。既にセットアップ済みなので、あなたが実行する必要はありません。

#### テーブル構成

```sql
-- ===========================
-- 1. profiles テーブル
-- ===========================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    job_title TEXT,
    hobbies TEXT[],
    interests TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================
-- 2. questions テーブル
-- ===========================
CREATE TABLE IF NOT EXISTS questions (
    id SERIAL PRIMARY KEY,
    text TEXT NOT NULL,
    metric_effects JSONB NOT NULL,  -- { "exploration": 1, "vitality": -0.5, ... }
    weight NUMERIC DEFAULT 1.0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================
-- 3. diagnostics テーブル
-- ===========================
CREATE TABLE IF NOT EXISTS diagnostics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    answers JSONB,  -- QuestionAnswer[]
    exploration NUMERIC,
    immersion NUMERIC,
    organization NUMERIC,
    contribution NUMERIC,
    vitality NUMERIC,
    dominant_metric TEXT,
    advice JSONB,  -- { exploration: "...", immersion: "...", ... }
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(profile_id, date)
);

-- ===========================
-- 4. tasks テーブル
-- ===========================
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    diagnostic_id UUID REFERENCES diagnostics(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    level TEXT CHECK (level IN ('quick', 'core', 'deep')),
    category TEXT,
    action_timing TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
    expires_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================
-- インデックス
-- ===========================
CREATE INDEX IF NOT EXISTS idx_diagnostics_profile_date ON diagnostics(profile_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_profile_status ON tasks(profile_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_diagnostic ON tasks(diagnostic_id);
```

---

### 4. 質問データの初期投入（参考情報 - 既に投入済み）

**注意**: 以下は参考情報です。既に投入済みなので、あなたが実行する必要はありません。

```sql
-- サンプル質問データ（5問）
INSERT INTO questions (text, metric_effects, weight) VALUES
(
    '今日は静かな場所でゆっくり過ごしたいと思っていませんか?',
    '{"exploration": -0.5, "immersion": 0, "organization": 0, "contribution": 0, "vitality": 1}'::jsonb,
    1.0
),
(
    '疲れを癒したい気分ですか?',
    '{"exploration": 0, "immersion": -0.5, "organization": 0, "contribution": 0, "vitality": 1}'::jsonb,
    1.0
),
(
    '今日は誰かに認められたい気持ちがありますか?',
    '{"exploration": 0, "immersion": 0, "organization": 0, "contribution": 1, "vitality": 0}'::jsonb,
    1.0
),
(
    '自分の頑張りを誰かに見てほしいと思っていませんか?',
    '{"exploration": 0, "immersion": 0, "organization": 0, "contribution": 1, "vitality": 0}'::jsonb,
    1.0
),
(
    '今日、誰かと話したい気持ちがありましたか?',
    '{"exploration": 0, "immersion": 0, "organization": 0, "contribution": 0.5, "vitality": 0.5}'::jsonb,
    1.0
);

-- さらに質問を追加する場合
-- INSERT INTO questions (text, metric_effects, weight) VALUES (...);
```

**注意**: 最低5問必要です（アプリが5問ランダムに選択するため）

---

### 5. Supabase Edge Functions のデプロイ（参考情報 - 既にデプロイ済み）

**注意**: 以下は参考情報です。既にデプロイ済みなので、あなたが実行する必要はありません。

#### シークレットの設定（設定済み）

```bash
# Supabase CLIをインストール
npm install -g supabase

# Supabaseにログイン
supabase login

# プロジェクトをリンク
supabase link --project-ref xxxxxxxxxxxxx

# Gemini API Keyをシークレットに設定
supabase secrets set GEMINI_API_KEY=AIzaSy...
```

#### Edge Functions のデプロイ

```bash
# generate-tasks をデプロイ
supabase functions deploy generate-tasks

# generate-advice をデプロイ
supabase functions deploy generate-advice
```

**確認方法**:
- Supabase ダッシュボード → Edge Functions
- 両方のFunctionがデプロイされていることを確認

---

### 6. Gemini API キーの取得（参考情報 - 既に設定済み）

**注意**: 以下は参考情報です。既に設定済みなので、あなたが実行する必要はありません。

**使用モデル**: `gemini-2.5-flash-lite`

---

## 🚀 セットアップ手順（3ステップで完了！）

### ステップ 1: リポジトリのクローン

```bash
git clone <repository-url>
cd desire-trigger
```

---

### ステップ 2: 依存関係のインストール

```bash
npm install
# または
yarn install
```

---

### ステップ 3: 環境変数の設定（これだけ！）

`.env` ファイルを作成:

```bash
# .env
EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**注意**: これらの値は別途安全な方法で共有されます。

**重要**: `.env` ファイルは `.gitignore` に含まれているため、コミットされません。

---

### これで完了！アプリを起動しましょう

```bash
# Expo開発サーバーを起動
npx expo start

# iOS Simulatorで起動
npx expo start --ios

# Android Emulatorで起動
npx expo start --android
```

---

## 🧪 動作確認

### 1. モックモードで確認

アプリ起動後:
1. 歯車ボタン（右下）をタップ
2. MOCK モードに切り替え
3. モックデータで動作確認

### 2. ライブモードで確認

1. LIVE モードに切り替え
2. プロフィール作成
3. 質問に回答
4. タスク生成を確認

---

## 📦 必要なファイル一覧

他の人に渡すべきファイル:

### ✅ 必須
- **コードベース全体** (Gitリポジトリ)
- **環境変数テンプレート** (`.env.example`)
- **データベーススキーマSQL** (上記SQL)
- **セットアップガイド** (このファイル)

### ⚠️ 秘密情報（個別に共有）
- **Supabase URL**
- **Supabase Anon Key**
- **Gemini API Key**

---

## 🔒 秘密情報の共有方法

### 推奨: 環境変数テンプレートを使用

#### `.env.example` を作成

```bash
# .env.example（Gitにコミット可能）
EXPO_PUBLIC_SUPABASE_URL=<your-supabase-url>
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

#### 実際の値は別途共有

- 1Password / Bitwarden などのパスワードマネージャー
- 暗号化されたメッセージ（Signal, Telegramなど）
- チーム内の秘密管理ツール（Doppler, AWS Secrets Managerなど）

**絶対にやってはいけないこと**:
- ❌ `.env` をGitにコミット
- ❌ 秘密情報をSlack/Discord/メールで平文送信
- ❌ スクリーンショットで共有

---

## 📝 チェックリスト

セットアップ完了前に確認:

### 環境構築
- [ ] Node.js v18以上がインストール済み
- [ ] Expo CLI がインストール済み
- [ ] iOS Simulator または Android Emulator が動作する

### 環境変数設定
- [ ] `.env` ファイルを作成
- [ ] `.env` ファイルに Supabase URL を設定
- [ ] `.env` ファイルに Supabase Anon Key を設定

### アプリ動作確認
- [ ] `npm install` が成功
- [ ] `npx expo start` が成功
- [ ] モックモードで動作確認
- [ ] ライブモードで質問に回答できる
- [ ] タスクが生成される

---

## ❓ トラブルシューティング

### Q1: `npx expo start` でエラーが出る

```bash
# キャッシュクリア
npx expo start -c

# node_modules再インストール
rm -rf node_modules
npm install
```

### Q2: Supabase接続エラー

- `.env` ファイルが正しく設定されているか確認
- EXPO_PUBLIC_ プレフィックスが付いているか確認
- Supabase URL が https:// で始まっているか確認

### Q3: Edge Function エラー

```bash
# ログを確認
supabase functions logs generate-tasks
supabase functions logs generate-advice

# 再デプロイ
supabase functions deploy generate-tasks --no-verify-jwt
supabase functions deploy generate-advice --no-verify-jwt
```

### Q4: 質問が表示されない

- データベースに質問が投入されているか確認:
  ```sql
  SELECT COUNT(*) FROM questions;  -- 5以上必要
  ```

### Q5: タスクが生成されない

- Gemini API Key が正しく設定されているか確認:
  ```bash
  supabase secrets list
  ```
- Edge Functions のログでエラーを確認

---

## 🎯 最小限のセットアップ（モックモードのみ）

**Supabase設定なしで動作確認したい場合**:

1. コードをクローン
2. `npm install`
3. `npx expo start`
4. アプリ起動後、歯車ボタンで **MOCK モード** に切り替え
5. モックデータで動作確認

**制限事項**:
- プロフィール作成不可
- 質問回答不可
- タスク生成不可
- UIの確認のみ可能

---

## 📧 サポート

セットアップで困ったら:

1. このドキュメントのトラブルシューティングを確認
2. Expo公式ドキュメント: https://docs.expo.dev/
3. Supabase公式ドキュメント: https://supabase.com/docs
4. チームメンバーに相談

---

## 🔄 更新履歴

- 2026-02-20: 初版作成
- Gemini モデルを gemini-2.0-flash に変更
- パラメータ計算の型変換バグを修正

---

これで、他の開発者がローカル環境でアプリを動かせます！
