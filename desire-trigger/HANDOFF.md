# プロジェクト引き継ぎガイド

このドキュメントは、プロジェクトを他の人に引き継ぐ際に必要な情報をまとめたものです。

---

## 🎉 重要なお知らせ

**Supabase は既にセットアップ済みです！**

- データベース・Edge Functions・API Key：全て設定済み
- 新しい開発者は `.env` ファイルの作成だけで動きます

---

## 📦 渡すべきもの

### 1. コードベース

```bash
# Gitリポジトリとして共有
git clone <repository-url>
```

**含まれるもの**:
- ソースコード全体
- 設定ファイル（package.json, tsconfig.json, app.json等）
- ドキュメント（README.md, SETUP.md, FRONTEND_GUIDE.md等）
- `.env.example`（環境変数のテンプレート）

**含まれないもの（.gitignoreで除外）**:
- `.env`（実際の秘密情報）
- `node_modules/`
- ビルド成果物

---

### 2. 秘密情報（個別に安全な方法で共有）

#### Supabase認証情報

```
Supabase Project URL: https://xxxxxxxxxxxxx.supabase.co
Supabase Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**取得場所**: Supabase Dashboard → Settings → API

#### Gemini API Key

```
Gemini API Key: AIzaSy...
```

**取得場所**: [Google AI Studio](https://aistudio.google.com/) → Get API Key

---

### 3. ドキュメント

| ファイル | 用途 |
|---------|------|
| `SETUP.md` | セットアップ手順 |
| `FRONTEND_GUIDE.md` | フロントエンド開発ガイド |
| `QUICK_REFERENCE.md` | クイックリファレンス |
| `FUNCTIONS.md` | 関数リファレンス |
| `.claude/FRONTEND_DEV_PROMPT.md` | AI開発アシスタント用プロンプト |

---

## 🔐 秘密情報の共有方法

### ❌ やってはいけない方法

- Slack/Discord/メールで平文送信
- スクリーンショットで共有
- Google Docsなどの共有ドキュメント
- `.env` をGitにコミット

### ✅ 推奨する方法

#### 方法1: パスワードマネージャー

- **1Password**: Shared Vault で共有
- **Bitwarden**: Organization で共有
- **LastPass**: Shared Folder で共有

#### 方法2: 暗号化メッセージ

- **Signal**: 暗号化されたDMで送信
- **Telegram**: Secret Chat で送信

#### 方法3: セキュアな一時共有サービス

- **One-Time Secret**: https://onetimesecret.com/
  - URLを開くと自動削除される
  - パスワード設定可能

---

## 📋 引き継ぎチェックリスト

### 開発者に渡す情報

- [ ] Gitリポジトリのアクセス権
- [ ] Supabase Project URL（.env用）
- [ ] Supabase Anon Key（.env用）
- [ ] セットアップドキュメント（SETUP.md）

**注意**: Supabase のセットアップは既に完了しているため、新しい開発者はこれらの情報を `.env` ファイルに記入するだけです。

### ドキュメント確認

- [ ] SETUP.md が最新
- [ ] .env.example が存在
- [ ] README.md にプロジェクト概要が記載されている
- [ ] FRONTEND_GUIDE.md が最新

---

## 🗂️ データベース情報

### テーブル一覧

| テーブル | 用途 | 初期データ |
|---------|------|-----------|
| `profiles` | ユーザープロフィール | なし |
| `questions` | 診断質問 | **5問以上必要** |
| `diagnostics` | 診断結果 | なし |
| `tasks` | 生成タスク | なし |

### 質問データの確認方法

```sql
-- Supabase Dashboard → SQL Editor
SELECT COUNT(*) FROM questions;  -- 5以上であること
SELECT * FROM questions ORDER BY id;
```

---

## 🚀 Edge Functions

### デプロイ済みFunction

1. **generate-tasks**
   - タスク生成
   - Gemini 2.0 Flash 使用

2. **generate-advice**
   - アドバイス生成
   - Gemini 2.0 Flash 使用

### シークレット設定

```bash
# 必須シークレット
GEMINI_API_KEY

# 確認方法
supabase secrets list
```

---

## 📱 アプリの仕様

### 技術スタック

- **フレームワーク**: React Native + Expo
- **言語**: TypeScript
- **バックエンド**: Supabase
- **AI**: Gemini 2.0 Flash
- **状態管理**: Zustand
- **アニメーション**: React Native Reanimated
- **スタイリング**: NativeWind (Tailwind CSS)

### 主要機能

1. **プロフィール作成**（setup.tsx）
2. **診断質問**（question/*.tsx）
3. **パラメータ分析**（result-flow.tsx）
4. **タスク生成**（Edge Function）
5. **履歴表示**（history.tsx）
6. **モックモード**（開発・デモ用）

---

## 🎯 開発モード

### MOCKモード

- **用途**: UI確認・デモ・開発
- **データ**: `constants/mockData.ts`
- **切り替え**: 歯車ボタン → MOCK/LIVE トグル

### LIVEモード

- **用途**: 本番動作確認
- **データ**: Supabase
- **必須**: 環境変数が正しく設定されている

---

## 🔄 デプロイフロー

### Edge Functionsの更新

```bash
# 1. Supabase CLIでログイン
supabase login

# 2. プロジェクトにリンク
supabase link --project-ref xxxxxxxxxxxxx

# 3. Functionをデプロイ
supabase functions deploy generate-tasks
supabase functions deploy generate-advice
```

### アプリのビルド

```bash
# iOS
eas build --platform ios

# Android
eas build --platform android
```

---

## 🐛 既知の問題と対処法

### 問題1: パラメータ計算で貢献が0になる

**原因**: question_id の型不一致

**対処**: 2026-02-20 に修正済み
- `lib/calcParameters.ts`: 型変換処理を追加
- `app/question/complete.tsx`: 型変換処理を追加

### 問題2: モックモードに勝手に切り替わる

**原因**: `dataModeStore.ts` のデフォルト値が 'mock' だった

**対処**: 2026-02-20 に修正済み
- `store/dataModeStore.ts`: デフォルトを 'live' に変更

---

## 📞 サポート体制

### ドキュメント

1. `SETUP.md` - セットアップ手順
2. `FRONTEND_GUIDE.md` - フロントエンド開発ガイド
3. `QUICK_REFERENCE.md` - クイックリファレンス

### 外部リソース

- **Expo**: https://docs.expo.dev/
- **Supabase**: https://supabase.com/docs
- **React Native**: https://reactnative.dev/docs
- **NativeWind**: https://www.nativewind.dev/

---

## ✅ 引き継ぎ完了確認

引き継ぎ先の開発者が以下を確認できたら完了:

- [ ] コードをクローンできた
- [ ] `.env` ファイルを作成し、環境変数を設定できた
- [ ] `npm install` が成功した
- [ ] `npx expo start` が成功した
- [ ] モックモードで動作確認できた
- [ ] ライブモードで質問に回答できた
- [ ] タスクが生成された
- [ ] ドキュメントを読んで理解できた

---

## 📝 引き継ぎテンプレート

以下のテンプレートを使って引き継ぎメッセージを作成してください。

```
件名: DESIRE TRIGGER プロジェクト引き継ぎ

こんにちは、

DESIRE TRIGGERプロジェクトの引き継ぎ資料をお送りします。

【リポジトリ】
<repository-url>

【ドキュメント】
- SETUP.md: セットアップ手順（必読）
- FRONTEND_GUIDE.md: フロントエンド開発ガイド
- QUICK_REFERENCE.md: クイックリファレンス

【秘密情報】
Supabase URL, Anon Key, Gemini API Key は
<安全な共有方法>で別途お送りします。

【次のステップ】
1. リポジトリをクローン
2. SETUP.md を読む
3. 環境変数を設定
4. アプリを起動
5. 動作確認

質問があればいつでもご連絡ください。

よろしくお願いします。
```

---

これで、スムーズにプロジェクトを引き継げます！
