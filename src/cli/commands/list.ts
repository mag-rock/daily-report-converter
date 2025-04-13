/**
 * 日報一覧表示コマンドの定義
 */
import { Command } from 'commander';
import { format, parse, isWithinInterval } from 'date-fns';
import { getReports } from '../../services/data-store.js';
import { DailyReport } from '../../models/daily-report.js';

export function listCommand(program: Command): void {
  program
    .command('list')
    .alias('ls')
    .description('日報一覧を表示します')
    .option('-m, --month <month>', '年月指定（YYYY-MM形式）')
    .option('-s, --start <date>', '開始日（YYYY-MM-DD形式）')
    .option('-e, --end <date>', '終了日（YYYY-MM-DD形式）')
    .option('-l, --location <location>', '勤務場所でフィルター')
    .option('-j, --json', 'JSON形式で出力', false)
    .action(async (options) => {
      try {
        console.log('📋 日報一覧を取得しています...');
        
        // 全ての日報を取得
        const reports = await getReports();
        
        // フィルターを適用
        let filteredReports = [...reports];
        
        // 年月でフィルター
        if (options.month) {
          const monthPattern = /^\d{4}-\d{2}$/;
          if (!monthPattern.test(options.month)) {
            console.error('❌ 年月は YYYY-MM 形式で指定してください');
            return;
          }
          
          filteredReports = filteredReports.filter(report => {
            const reportDate = report.date.substring(0, 7);
            return reportDate === options.month;
          });
        }
        
        // 日付範囲でフィルター
        if (options.start || options.end) {
          const datePattern = /^\d{4}-\d{2}-\d{2}$/;
          const start = options.start ? options.start : '1970-01-01';
          const end = options.end ? options.end : format(new Date(), 'yyyy-MM-dd');
          
          if ((options.start && !datePattern.test(options.start)) ||
              (options.end && !datePattern.test(options.end))) {
            console.error('❌ 日付は YYYY-MM-DD 形式で指定してください');
            return;
          }
          
          const startDate = parse(start, 'yyyy-MM-dd', new Date());
          const endDate = parse(end, 'yyyy-MM-dd', new Date());
          
          filteredReports = filteredReports.filter(report => {
            const reportDate = parse(report.date, 'yyyy-MM-dd', new Date());
            return isWithinInterval(reportDate, { start: startDate, end: endDate });
          });
        }
        
        // 勤務場所でフィルター
        if (options.location) {
          filteredReports = filteredReports.filter(report => 
            report.location.toLowerCase().includes(options.location.toLowerCase())
          );
        }
        
        // 日付でソート（新しい順）
        filteredReports.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateB.getTime() - dateA.getTime();
        });
        
        // 結果出力
        if (filteredReports.length === 0) {
          console.log('該当する日報はありません');
          return;
        }
        
        if (options.json) {
          // JSON形式で出力
          console.log(JSON.stringify(filteredReports, null, 2));
        } else {
          // テーブル形式で出力
          console.log('');
          console.log('日付       | 勤務時間      | 勤務場所 | タスク状況 | タスク概要');
          console.log('----------|-------------|--------|----------|----------');
          
          filteredReports.forEach((report: DailyReport) => {
            const taskSummary = report.tasks.length > 30 
              ? `${report.tasks.substring(0, 30)}...` 
              : report.tasks;
              
            console.log(
              `${report.date} | ${report.workHours.start}-${report.workHours.end} | ${report.location.padEnd(6)} | ${report.taskStatus.padEnd(8)} | ${taskSummary.replace(/\n/g, ' ')}`
            );
          });
          
          console.log('');
          console.log(`合計: ${filteredReports.length}件の日報`);
        }
      } catch (error) {
        console.error('❌ エラーが発生しました:', error);
      }
    });
}