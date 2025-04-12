/**
 * 日報のデータモデル
 */

/**
 * 日報データのインターフェース
 */
export interface DailyReport {
  // 基本情報
  id: string;
  date: string;
  createdAt: string;
  updatedAt: string;
  
  // 勤務情報
  workHours: {
    start: string;
    end: string;
    total: string; // 例: "8h00m"
  };
  location: string;
  taskStatus: string;
  
  // タスク情報
  tasks: string;
  
  // 追加情報
  nextDayLocation: string;
  monthlyTotalHours: string; // 例: "120h30m"
  notes: string;
}

/**
 * 日報作成用の入力インターフェース
 * 必須項目のみを含む
 */
export interface DailyReportInput {
  date: string;
  workHours: {
    start: string;
    end: string;
  };
  location: string;
  taskStatus: string;
  tasks: string;
  nextDayLocation: string;
  notes?: string;
}

/**
 * 日報更新用のインターフェース
 * すべてのフィールドがオプショナル
 */
export interface DailyReportUpdate {
  date?: string;
  workHours?: {
    start?: string;
    end?: string;
  };
  location?: string;
  taskStatus?: string;
  tasks?: string;
  nextDayLocation?: string;
  notes?: string;
}