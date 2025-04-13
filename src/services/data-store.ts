// @ts-ignore lowdbの型定義問題を回避するための宣言
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync, existsSync } from 'fs';
import { DailyReport } from '../models/daily-report.js';

// lowdbをany型として宣言（型定義問題の回避策）
// @ts-ignore
import { Low } from 'lowdb';
// @ts-ignore
import { JSONFile } from 'lowdb';

/**
 * アプリケーションのデータストア
 */
interface DataStore {
  reports: DailyReport[];
  settings: {
    defaultLocation: string;
    defaultWorkHours: {
      start: string;
      end: string;
    };
    templates: {
      id: string;
      name: string;
      content: string;
    }[];
  };
}

// データディレクトリのパス
const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '../../data');
const REPORTS_DIR = join(DATA_DIR, 'reports');
const SETTINGS_DIR = join(DATA_DIR, 'settings');
const TEMPLATES_DIR = join(DATA_DIR, 'templates');

// ディレクトリが存在しない場合は作成
[DATA_DIR, REPORTS_DIR, SETTINGS_DIR, TEMPLATES_DIR].forEach(dir => {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
});

// データベースファイルのパス
const DB_FILE = join(DATA_DIR, 'db.json');

// データベースのデフォルト値
const defaultData: DataStore = {
  reports: [],
  settings: {
    defaultLocation: 'リモート',
    defaultWorkHours: {
      start: '09:30',
      end: '18:30'
    },
    templates: []
  }
};

// データベースのインスタンスを作成
const adapter = new JSONFile<DataStore>(DB_FILE);
const db = new Low<DataStore>(adapter);

/**
 * データベースを初期化する
 */
export async function initializeDb(): Promise<void> {
  try {
    // データベースを読み込む
    await db.read();
    
    // データベースが存在しない場合はデフォルト値で作成
    if (db.data === null) {
      db.data = defaultData;
      await db.write();
    }
  } catch (error) {
    console.error('データベースの初期化に失敗しました:', error);
    throw error;
  }
}

/**
 * 日報を保存する
 */
export async function saveReport(report: DailyReport): Promise<void> {
  try {
    await db.read();
    
    if (!db.data) {
      throw new Error('データベースが初期化されていません');
    }
    
    // 既存の日報を検索
    const index = db.data.reports.findIndex(r => r.id === report.id);
    
    if (index !== -1) {
      // 既存の日報を更新
      db.data.reports[index] = report;
    } else {
      // 新しい日報を追加
      db.data.reports.push(report);
    }
    
    await db.write();
  } catch (error) {
    console.error('日報の保存に失敗しました:', error);
    throw error;
  }
}

/**
 * 日報を取得する
 */
export async function getReport(id: string): Promise<DailyReport | undefined> {
  try {
    await db.read();
    
    if (!db.data) {
      throw new Error('データベースが初期化されていません');
    }
    
    return db.data.reports.find(report => report.id === id);
  } catch (error) {
    console.error('日報の取得に失敗しました:', error);
    throw error;
  }
}

/**
 * 特定の日付の日報を取得する
 */
export async function getReportByDate(date: string): Promise<DailyReport | undefined> {
  try {
    await db.read();
    
    if (!db.data) {
      throw new Error('データベースが初期化されていません');
    }
    
    return db.data.reports.find(report => report.date === date);
  } catch (error) {
    console.error('日報の取得に失敗しました:', error);
    throw error;
  }
}

/**
 * 全ての日報を取得する
 */
export async function getAllReports(): Promise<DailyReport[]> {
  try {
    await db.read();
    
    if (!db.data) {
      throw new Error('データベースが初期化されていません');
    }
    
    return db.data.reports;
  } catch (error) {
    console.error('全日報の取得に失敗しました:', error);
    throw error;
  }
}

/**
 * 特定の期間の日報を取得する
 */
export async function getReportsByDateRange(startDate: string, endDate: string): Promise<DailyReport[]> {
  try {
    await db.read();
    
    if (!db.data) {
      throw new Error('データベースが初期化されていません');
    }
    
    return db.data.reports.filter(
      report => report.date >= startDate && report.date <= endDate
    );
  } catch (error) {
    console.error('期間内の日報の取得に失敗しました:', error);
    throw error;
  }
}

/**
 * 日報を削除する
 */
export async function deleteReport(id: string): Promise<boolean> {
  try {
    await db.read();
    
    if (!db.data) {
      throw new Error('データベースが初期化されていません');
    }
    
    const initialLength = db.data.reports.length;
    db.data.reports = db.data.reports.filter(report => report.id !== id);
    
    if (db.data.reports.length < initialLength) {
      await db.write();
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('日報の削除に失敗しました:', error);
    throw error;
  }
}

/**
 * 設定を取得する
 */
export async function getSettings() {
  try {
    await db.read();
    
    if (!db.data) {
      throw new Error('データベースが初期化されていません');
    }
    
    return db.data.settings;
  } catch (error) {
    console.error('設定の取得に失敗しました:', error);
    throw error;
  }
}

/**
 * 設定を更新する
 */
export async function updateSettings(newSettings: Partial<typeof defaultData.settings>): Promise<void> {
  try {
    await db.read();
    
    if (!db.data) {
      throw new Error('データベースが初期化されていません');
    }
    
    db.data.settings = { ...db.data.settings, ...newSettings };
    await db.write();
  } catch (error) {
    console.error('設定の更新に失敗しました:', error);
    throw error;
  }
}

export default {
  initializeDb,
  saveReport,
  getReport,
  getReportByDate,
  getAllReports,
  getReportsByDateRange,
  deleteReport,
  getSettings,
  updateSettings
};