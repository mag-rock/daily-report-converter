/**
 * 日報編集コマンドの定義
 */
import { Command } from 'commander';
import { format } from 'date-fns';
import inquirer from 'inquirer';
import { getReportByDate, getReportById, updateReport, calculateTotalHours } from '../../services/data-store.js';
import { promptDailyReport } from '../prompts/daily-report-prompts.js';
import { DailyReport } from '../../models/daily-report.js';

export function editCommand(program: Command): void {
  program
    .command('edit')
    .alias('e')
    .description('既存の日報を編集します')
    .option('-d, --date <date>', '日付（YYYY-MM-DD形式）')
    .option('-i, --id <id>', '日報ID')
    .action(async (options) => {
      try {
        console.log('✏️ 日報を編集します');
        
        let report: DailyReport | null = null;
        
        // IDまたは日付で日報を検索
        if (options.id) {
          report = await getReportById(options.id);
        } else if (options.date) {
          report = await getReportByDate(options.date);
        } else {
          // 日付が指定されていない場合は、最新の日報から選択してもらう
          const reports = await getReports();
          
          // 日付でソート（新しい順）
          const sortedReports = [...reports].sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateB.getTime() - dateA.getTime();
          });
          
          // 最大10件の最新の日報リストを作成
          const recentReports = sortedReports.slice(0, 10);
          
          if (recentReports.length === 0) {
            console.log('❌ 編集可能な日報がありません');
            return;
          }
          
          const { selectedId } = await inquirer.prompt([
            {
              type: 'list',
              name: 'selectedId',
              message: '編集する日報を選択:',
              choices: recentReports.map(r => ({
                name: `${r.date} - ${r.workHours.start}〜${r.workHours.end} (${r.location})`,
                value: r.id
              }))
            }
          ]);
          
          report = await getReportById(selectedId);
        }
        
        if (!report) {
          console.log('❌ 指定された日報が見つかりませんでした');
          return;
        }
        
        console.log(`${report.date}の日報を編集します`);
        
        // 対話式編集
        const updatedInput = await promptDailyReport(report);
        
        // 更新データの作成
        const now = new Date();
        const formattedNow = format(now, 'yyyy-MM-dd HH:mm:ss');
        
        // 勤務時間の計算
        const totalHours = calculateTotalHours(updatedInput.workHours.start, updatedInput.workHours.end);
        
        const updatedReport: DailyReport = {
          ...report,
          date: updatedInput.date,
          updatedAt: formattedNow,
          workHours: {
            start: updatedInput.workHours.start,
            end: updatedInput.workHours.end,
            total: totalHours
          },
          location: updatedInput.location,
          taskStatus: updatedInput.taskStatus,
          tasks: updatedInput.tasks,
          nextDayLocation: updatedInput.nextDayLocation,
          notes: updatedInput.notes || ''
        };
        
        // 日報を更新
        await updateReport(updatedReport);
        
        console.log(`✅ ${updatedInput.date}の日報を更新しました`);
      } catch (error) {
        console.error('❌ エラーが発生しました:', error);
      }
    });
}

// getReportsを仮定（データストアから実際に取得する）
async function getReports(): Promise<DailyReport[]> {
  try {
    const allReports = await import('../../services/data-store.js').then(module => module.getReports());
    return allReports;
  } catch (error) {
    console.error('日報データの取得に失敗しました:', error);
    return [];
  }
}