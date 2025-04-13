import { format, parse, differenceInMinutes, addMonths, 
  startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { ja } from 'date-fns/locale/ja';

/**
 * 現在の日付を「YYYY-MM-DD」形式で取得する
 */
export function getCurrentDate(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

/**
 * 現在の時刻を「HH:mm」形式で取得する
 */
export function getCurrentTime(): string {
  return format(new Date(), 'HH:mm');
}

/**
 * 現在のタイムスタンプを「YYYY-MM-DD HH:mm:ss」形式で取得する
 */
export function getCurrentTimestamp(): string {
  return format(new Date(), 'yyyy-MM-dd HH:mm:ss');
}

/**
 * 日付文字列を「YYYY年MM月DD日」形式にフォーマットする
 */
export function formatDateJP(dateStr: string): string {
  try {
    const date = parse(dateStr, 'yyyy-MM-dd', new Date());
    return format(date, 'yyyy年MM月dd日', { locale: ja });
  } catch (error) {
    console.error('日付のフォーマットに失敗しました:', error);
    return dateStr;
  }
}

/**
 * 日付文字列を「YYYY年MM月」形式にフォーマットする
 */
export function formatMonthJP(dateStr: string): string {
  try {
    const date = parse(dateStr, 'yyyy-MM-dd', new Date());
    return format(date, 'yyyy年MM月', { locale: ja });
  } catch (error) {
    console.error('月のフォーマットに失敗しました:', error);
    return dateStr;
  }
}

/**
 * 曜日を日本語で返す
 */
export function getDayOfWeekJP(dateStr: string): string {
  try {
    const date = parse(dateStr, 'yyyy-MM-dd', new Date());
    return format(date, 'E', { locale: ja });
  } catch (error) {
    console.error('曜日の取得に失敗しました:', error);
    return '';
  }
}

/**
 * 時間文字列（HH:mm）から分に変換する
 */
export function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * 分から時間文字列（HH:mm）に変換する
 */
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

/**
 * 分から「○時間○分」形式に変換する
 */
export function minutesToHoursAndMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h${String(mins).padStart(2, '0')}m`;
}

/**
 * 開始時間と終了時間から総時間（分）を計算する
 */
export function calculateWorkMinutes(startTime: string, endTime: string): number {
  try {
    // 日付は便宜上現在の日付を使用
    const today = format(new Date(), 'yyyy-MM-dd');
    
    const start = parse(`${today} ${startTime}`, 'yyyy-MM-dd HH:mm', new Date());
    let end = parse(`${today} ${endTime}`, 'yyyy-MM-dd HH:mm', new Date());
    
    // 終了時間が開始時間より前の場合（深夜勤務など）、終了時間を翌日とみなす
    if (end < start) {
      end = new Date(end.getTime() + 24 * 60 * 60 * 1000);
    }
    
    return differenceInMinutes(end, start);
  } catch (error) {
    console.error('勤務時間の計算に失敗しました:', error);
    return 0;
  }
}

/**
 * 特定の月の日付範囲（YYYY-MM-DD）を取得する
 * @param yearMonth 「YYYY-MM」形式の年月
 */
export function getMonthDateRange(yearMonth: string): { start: string; end: string } {
  try {
    const date = parse(`${yearMonth}-01`, 'yyyy-MM-dd', new Date());
    const start = format(startOfMonth(date), 'yyyy-MM-dd');
    const end = format(endOfMonth(date), 'yyyy-MM-dd');
    
    return { start, end };
  } catch (error) {
    console.error('月の日付範囲の取得に失敗しました:', error);
    const now = new Date();
    const start = format(startOfMonth(now), 'yyyy-MM-dd');
    const end = format(endOfMonth(now), 'yyyy-MM-dd');
    
    return { start, end };
  }
}

/**
 * 前月の「YYYY-MM」を取得する
 */
export function getPreviousMonth(): string {
  const date = new Date();
  return format(addMonths(date, -1), 'yyyy-MM');
}

/**
 * 当月の「YYYY-MM」を取得する
 */
export function getCurrentMonth(): string {
  return format(new Date(), 'yyyy-MM');
}

/**
 * 月の全日付リストを取得する
 */
export function getAllDatesInMonth(yearMonth: string): string[] {
  try {
    const { start, end } = getMonthDateRange(yearMonth);
    const startDate = parse(start, 'yyyy-MM-dd', new Date());
    const endDate = parse(end, 'yyyy-MM-dd', new Date());
    
    return eachDayOfInterval({ start: startDate, end: endDate })
      .map(date => format(date, 'yyyy-MM-dd'));
  } catch (error) {
    console.error('月の日付リストの取得に失敗しました:', error);
    return [];
  }
}

export default {
  getCurrentDate,
  getCurrentTime,
  getCurrentTimestamp,
  formatDateJP,
  formatMonthJP,
  getDayOfWeekJP,
  timeToMinutes,
  minutesToTime,
  minutesToHoursAndMinutes,
  calculateWorkMinutes,
  getMonthDateRange,
  getPreviousMonth,
  getCurrentMonth,
  getAllDatesInMonth
};