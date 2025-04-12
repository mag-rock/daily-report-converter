# 日報変換ツール (Daily Report Converter)

効率的な日報入力と月報生成を支援するコマンドラインツールです。

## 機能概要

- 日報入力支援機能
- 日報データ管理機能
- 月報生成機能（生成AI連携）

## インストール方法

### 前提条件
- Node.js v18以上
- npm 8.3.1以上

### グローバルインストール（推奨）

```bash
npm install -g daily-report-converter
```

### ローカルインストール

```bash
git clone https://github.com/mag-rock/daily-report-converter.git
cd daily-report-converter
npm install
npm run build
npm link
```

## 使い方

### 基本的なコマンド

```bash
# ヘルプを表示
daily-report --help

# バージョンを表示
daily-report --version

# 日報の入力
daily-report add

# 過去の日報を一覧表示
daily-report list

# 特定の日報を表示
daily-report show <YYYY-MM-DD>

# 日報を編集
daily-report edit <YYYY-MM-DD>

# 月報を生成
daily-report monthly <YYYY-MM>
```

### 設定ファイル

設定ファイルは `~/.daily-report-converter/settings/user-settings.json` に保存されます。
初回起動時に自動的に作成されますが、必要に応じて手動で編集することもできます。

## 開発者向け情報

### 開発環境のセットアップ

```bash
# リポジトリのクローン
git clone https://github.com/mag-rock/daily-report-converter.git
cd daily-report-converter

# 依存関係のインストール
npm install

# 開発モードでの実行
npm run dev

# ビルド
npm run build

# テスト
npm test
```

### 主要な技術スタック

- TypeScript 5.x
- Commander.js (CLIフレームワーク)
- Inquirer.js (対話型インターフェース)
- date-fns (日付操作)
- lowdb (データストレージ)
- OpenAI SDK (生成AI連携)
- Jest (テストフレームワーク)

## ライセンス

ISC

## 貢献

バグ報告や機能リクエストはIssueを作成してください。
プルリクエストも歓迎しています。