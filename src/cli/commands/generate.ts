/**
 * 月報生成コマンドの定義
 */
import { Command } from 'commander';
import { format, parse, startOfMonth, endOfMonth } from 'date-fns';
import fs from 'fs/promises';
import path from 'path';
import inquirer from 'inquirer';
import { getReports } from '../../services/data-store.js';
import { DailyReport } from '../../models/daily-report.js';
import { promptTemplateSelect } from '../prompts/template-prompts.js';
import { getTemplates } from '../../services/data-store.js';
import { generateMonthlyReport } from '../../services/ai-service.js';

export function generateCommand(program: Command): void {
  program
    .command('generate')
    .alias('g')
    .description('月報を生成します')
    .option('-m, --month <month>', '年月（YYYY-MM形式）')
    .option('-o, --output <file>', '出力ファイル')
    .option('-t, --template <template>', 'テンプレート名')
    .action(async (options) => {
      try {
        console.log('🔄 月報生成を開始します...');
        
        // 年月の取得（指定がなければ今月）
        let targetMonth = options.month;
        if (!targetMonth) {
          const now = new Date();
          targetMonth = format(now, 'yyyy-MM');
        }
        
        // 年月の形式を検証
        const monthPattern = /^\d{4}-\d{2}$/;
        if (!monthPattern.test(targetMonth)) {
          console.error('❌ 年月は YYYY-MM 形式で指定してください');
          return;
        }
        
        // 対象期間の設定
        const targetDate = parse(targetMonth, 'yyyy-MM', new Date());
        const startDate = startOfMonth(targetDate);
        const endDate = endOfMonth(targetDate);
        
        // 出力ファイル名の設定
        let outputFile = options.output;
        if (!outputFile) {
          outputFile = `${targetMonth}_monthly_report.md`;
        }
        
        console.log(`📅 ${format(startDate, 'yyyy年MM月')}の月報を生成します`);
        
        // 対象月の日報を取得
        const allReports = await getReports();
        const monthlyReports = allReports.filter(report => {
          const reportDate = parse(report.date, 'yyyy-MM-dd', new Date());
          return reportDate >= startDate && reportDate <= endDate;
        });
        
        if (monthlyReports.length === 0) {
          console.log(`❌ ${targetMonth}の日報データがありません`);
          return;
        }
        
        console.log(`📝 ${monthlyReports.length}件の日報データが見つかりました`);
        
        // テンプレートの取得と選択
        let templateName = options.template;
        if (!templateName) {
          const templates = await getTemplates();
          
          if (templates.length === 0) {
            console.log('⚠️ テンプレートがありません。デフォルト形式で生成します。');
          } else {
            const { templateName: selectedTemplate } = await promptTemplateSelect(templates);
            templateName = selectedTemplate;
          }
        }
        
        console.log('🤖 AIによる月報生成中...');
        
        // 月報生成
        const monthlyReport = await generateMonthlyReport(monthlyReports, templateName);
        
        // 出力先の確認
        const { confirm } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirm',
            message: `月報を ${outputFile} に保存しますか？`,
            default: true
          }
        ]);
        
        if (confirm) {
          // ファイル保存
          await fs.writeFile(outputFile, monthlyReport);
          console.log(`✅ 月報を ${outputFile} に保存しました`);
        } else {
          // 保存せずに表示のみ
          console.log('\n===== 月報プレビュー =====\n');
          console.log(monthlyReport);
          console.log('\n========================\n');
        }
        
      } catch (error) {
        console.error('❌ エラーが発生しました:', error);
      }
    });
}