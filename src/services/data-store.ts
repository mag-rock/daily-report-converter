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
    userName: string;
    defaultLocation: string;
    defaultStartTime: string;
    defaultEndTime: string;
    api: {
      apiKey: string;
      model: string;
    };
    templates: Array<{
      id: string;
      name: string;
      type: string;
      content: string;
      isDefault: boolean;
    }>;
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
    userName: '',
    defaultLocation: 'オフィス',
    defaultStartTime: '09:00',
    defaultEndTime: '18:00',
    api: {
      apiKey: '',
      model: 'gpt-4o'
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
 * 日報を更新する (saveReportのエイリアス)
 */
export async function updateReport(report: DailyReport): Promise<void> {
  return saveReport(report);
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
 * IDから日報を取得する (getReportのエイリアス)
 */
export async function getReportById(id: string): Promise<DailyReport | null> {
  const report = await getReport(id);
  return report || null;
}

/**
 * 特定の日付の日報を取得する
 */
export async function getReportByDate(date: string): Promise<DailyReport | null> {
  try {
    await db.read();
    
    if (!db.data) {
      throw new Error('データベースが初期化されていません');
    }
    
    const report = db.data.reports.find(report => report.date === date);
    return report || null;
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
 * 全ての日報を取得する (getAllReportsのエイリアス)
 */
export async function getReports(): Promise<DailyReport[]> {
  return getAllReports();
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
 * configコマンド用の設定取得関数
 */
export async function getConfig() {
  return getSettings();
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

/**
 * configコマンド用の設定保存関数
 */
export async function saveConfig(config: any): Promise<void> {
  return updateSettings(config);
}

/**
 * テンプレート関連の関数
 */
export interface Template {
  id: string;
  name: string;
  type: string;
  content: string;
  isDefault: boolean;
}

/**
 * テンプレート一覧を取得する
 */
export async function getTemplates(): Promise<Template[]> {
  try {
    await db.read();
    
    if (!db.data) {
      throw new Error('データベースが初期化されていません');
    }
    
    return db.data.settings.templates;
  } catch (error) {
    console.error('テンプレートの取得に失敗しました:', error);
    return [];
  }
}

/**
 * 名前からテンプレートを取得する
 */
export async function getTemplateByName(name: string): Promise<Template | null> {
  try {
    const templates = await getTemplates();
    const template = templates.find(t => t.name === name);
    return template || null;
  } catch (error) {
    console.error('テンプレートの取得に失敗しました:', error);
    return null;
  }
}

/**
 * テンプレートを保存する
 */
export async function saveTemplate(template: Template): Promise<void> {
  try {
    await db.read();
    
    if (!db.data) {
      throw new Error('データベースが初期化されていません');
    }
    
    // デフォルトテンプレートの処理
    if (template.isDefault) {
      // 他のデフォルト設定を解除
      db.data.settings.templates = db.data.settings.templates.map(t => ({
        ...t,
        isDefault: t.id === template.id ? true : false
      }));
    }
    
    // 既存テンプレートを検索
    const index = db.data.settings.templates.findIndex(t => t.id === template.id);
    
    if (index !== -1) {
      // 既存テンプレートを更新
      db.data.settings.templates[index] = template;
    } else {
      // 新規テンプレートを追加
      db.data.settings.templates.push(template);
    }
    
    await db.write();
  } catch (error) {
    console.error('テンプレートの保存に失敗しました:', error);
    throw error;
  }
}

/**
 * テンプレートを削除する
 */
export async function deleteTemplate(id: string): Promise<boolean> {
  try {
    await db.read();
    
    if (!db.data) {
      throw new Error('データベースが初期化されていません');
    }
    
    const initialLength = db.data.settings.templates.length;
    db.data.settings.templates = db.data.settings.templates.filter(t => t.id !== id);
    
    if (db.data.settings.templates.length < initialLength) {
      await db.write();
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('テンプレートの削除に失敗しました:', error);
    throw error;
  }
}

/**
 * 勤務時間の計算
 * @param startTime 開始時間 (HH:MM形式)
 * @param endTime 終了時間 (HH:MM形式)
 * @returns 合計時間 (例: "8h00m")
 */
export function calculateTotalHours(startTime: string, endTime: string): string {
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  
  let totalMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);
  
  // 負の値の場合は翌日までの時間と仮定
  if (totalMinutes < 0) {
    totalMinutes += 24 * 60;
  }
  
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  return `${hours}h${minutes.toString().padStart(2, '0')}m`;
}

export default {
  initializeDb,
  saveReport,
  updateReport,
  getReport,
  getReportById,
  getReportByDate,
  getAllReports,
  getReports,
  getReportsByDateRange,
  deleteReport,
  getSettings,
  getConfig,
  updateSettings,
  saveConfig,
  getTemplates,
  getTemplateByName,
  saveTemplate,
  deleteTemplate,
  calculateTotalHours
};