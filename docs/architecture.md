# 日報変換ツール アーキテクチャ定義書

## 1 全体構成
```
daily-report-converter/
├── src/
│   ├── cli/              # CLIインターフェース
│   ├── models/           # データモデル
│   ├── services/         # ビジネスロジック
│   ├── utils/            # ユーティリティ関数
│   └── ai/               # 生成AI連携
├── data/                 # 日報データ保存
│   ├── reports/          # 日報データ
│   ├── templates/        # 月報テンプレート
│   └── settings/         # ユーザー設定
├── tests/                # テストコード
└── docs/                 # ドキュメント
```

## 2 データモデル設計

### 日報データモデル
```typescript
interface DailyReport {
  date: string;               // YYYY/MM/DD形式
  workingHours: {
    start: string;            // HH:MM形式
    end: string;              // HH:MM形式
    duration: string;         // 稼働時間（時間単位）
  };
  workLocation: string;       // 勤務場所
  taskStatus: string;         // タスク状況
  completedTasks: string;     // 実施したタスク
  nextDayLocation: string;    // 翌日の勤務場所
  monthlyAccumulatedTime: string; // 月内累積稼働時間
  additionalNotes: string;    // その他連絡事項
  createdAt: string;          // 作成日時
  updatedAt: string;          // 更新日時
}
```

### 月報テンプレートモデル
```typescript
interface MonthlyReportTemplate {
  id: string;                 // テンプレートID
  name: string;               // テンプレート名
  format: string;             // 書式指定（マークダウンなどのテンプレート）
  aiPrompt: string;           // 生成AI用のプロンプト設定
  createdAt: string;          // 作成日時
  updatedAt: string;          // 更新日時
}
```