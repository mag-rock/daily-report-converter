/**
 * 日報作成コマンドの定義
 */
import { Command } from 'commander';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { DailyReportInput, DailyReport } from '../../models/daily-report.js';
import { promptDailyReport } from '../prompts/daily-report-prompts.js';
import { saveReport, calculateTotalHours, initializeDb } from '../../services/data-store.js';

export function createCommand(program: Command): void {
  program
    .command('create')
    .alias('c')
    .description('新しい日報を作成します')
    .option('-d, --date <date>', '日付（YYYY-MM-DD形式）')
    .action(async (options) => {
      try {
        console.log('📝 新しい日報を作成します');
        
        // データベースの初期化
        await initializeDb();
        
        // デフォルト値の設定
        const defaultValues: Partial<DailyReport> = {};
        if (options.date) {
          defaultValues.date = options.date;
        }
        
        // 対話式入力
        const input: DailyReportInput = await promptDailyReport(defaultValues);
        
        // 日報データの作成
        const now = new Date();
        const formattedNow = format(now, 'yyyy-MM-dd HH:mm:ss');
        
        // 勤務時間の計算
        const totalHours = calculateTotalHours(input.workHours.start, input.workHours.end);
        
        const dailyReport: DailyReport = {
          id: uuidv4(),
          date: input.date,
          createdAt: formattedNow,
          updatedAt: formattedNow,
          workHours: {
            start: input.workHours.start,
            end: input.workHours.end,
            total: totalHours
          },
          location: input.location,
          taskStatus: input.taskStatus,
          tasks: input.tasks,
          nextDayLocation: input.nextDayLocation,
          monthlyTotalHours: '計算中...',  // 後で更新される値
          notes: input.notes || ''
        };
        
        // 日報を保存
        await saveReport(dailyReport);
        
        console.log(`✅ ${input.date}の日報を保存しました`);
      } catch (error) {
        console.error('❌ エラーが発生しました:', error);
      }
    });
}