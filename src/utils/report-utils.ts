import { v4 as uuidv4 } from 'uuid';
import { 
  getCurrentDate, 
  getCurrentTimestamp, 
  calculateWorkMinutes, 
  minutesToHoursAndMinutes 
} from './date-utils.js';
import { DailyReport, DailyReportInput } from '../models/daily-report.js';
import dataStore from '../services/data-store.js';

/**
 * 日報IDを生成する（日付をベースにしたUUID）
 */
export function generateReportId(date: string): string {
  // 日付をベースにしたIDを生成（日付+UUIDの先頭8文字）
  const uuid = uuidv4().split('-')[0];
  return `${date.replace(/-/g, '')}-${uuid}`;
}

/**
 * 入力データから日報オブジェクトを作成する
 */
export async function createDailyReport(input: DailyReportInput): Promise<DailyReport> {
  const now = getCurrentTimestamp();
  const workMinutes = calculateWorkMinutes(input.workHours.start, input.workHours.end);
  const totalWorkHours = minutesToHoursAndMinutes(workMinutes);
  
  // 既存の月の総労働時間を取得し、更新する（将来実装）
  const monthlyTotalHours = "0h00m"; // 暫定的に0に設定
  
  const report: DailyReport = {
    id: generateReportId(input.date),
    date: input.date,
    createdAt: now,
    updatedAt: now,
    workHours: {
      start: input.workHours.start,
      end: input.workHours.end,
      total: totalWorkHours
    },
    location: input.location,
    taskStatus: input.taskStatus,
    tasks: input.tasks,
    nextDayLocation: input.nextDayLocation,
    monthlyTotalHours: monthlyTotalHours,
    notes: input.notes || ''
  };
  
  return report;
}

/**
 * 日報データを検証する
 */
export function validateDailyReport(report: Partial<DailyReport>): string[] {
  const errors: string[] = [];
  
  // 必須フィールドの検証
  if (!report.date) {
    errors.push('日付が指定されていません');
  }
  
  if (!report.workHours?.start) {
    errors.push('開始時間が指定されていません');
  }
  
  if (!report.workHours?.end) {
    errors.push('終了時間が指定されていません');
  }
  
  if (!report.location) {
    errors.push('勤務場所が指定されていません');
  }
  
  if (!report.taskStatus) {
    errors.push('タスク状況が指定されていません');
  }
  
  if (!report.tasks) {
    errors.push('実施タスクが指定されていません');
  }
  
  if (!report.nextDayLocation) {
    errors.push('翌日の勤務場所が指定されていません');
  }
  
  // 時間フォーマット検証
  const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;
  
  if (report.workHours?.start && !timePattern.test(report.workHours.start)) {
    errors.push('開始時間のフォーマットが不正です（HH:MM）');
  }
  
  if (report.workHours?.end && !timePattern.test(report.workHours.end)) {
    errors.push('終了時間のフォーマットが不正です（HH:MM）');
  }
  
  // 日付フォーマット検証
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  
  if (report.date && !datePattern.test(report.date)) {
    errors.push('日付のフォーマットが不正です（YYYY-MM-DD）');
  }
  
  return errors;
}

/**
 * 月次の総労働時間を計算する
 */
export async function calculateMonthlyTotalHours(yearMonth: string): Promise<string> {
  try {
    // 月の日付範囲を取得
    const year = parseInt(yearMonth.split('-')[0]);
    const month = parseInt(yearMonth.split('-')[1]);
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    
    // 指定した月の日報を取得
    const reports = await dataStore.getReportsByDateRange(startDate, endDate);
    
    // 総労働時間（分）を計算
    let totalMinutes = 0;
    
    reports.forEach(report => {
      const startTime = report.workHours.start;
      const endTime = report.workHours.end;
      
      const minutes = calculateWorkMinutes(startTime, endTime);
      totalMinutes += minutes;
    });
    
    // 時間形式に変換して返す
    return minutesToHoursAndMinutes(totalMinutes);
  } catch (error) {
    console.error('月間総労働時間の計算に失敗しました:', error);
    return '0h00m';
  }
}

/**
 * 今日の日報が既に存在するか確認する
 */
export async function isTodayReportExists(): Promise<boolean> {
  const today = getCurrentDate();
  const report = await dataStore.getReportByDate(today);
  return !!report;
}

export default {
  generateReportId,
  createDailyReport,
  validateDailyReport,
  calculateMonthlyTotalHours,
  isTodayReportExists
};