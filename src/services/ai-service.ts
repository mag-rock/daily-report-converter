/**
 * AI関連のサービス機能
 * OpenAI APIを使用して月報生成などを行う
 */
import { DailyReport } from '../models/daily-report.js';
import { getConfig, getTemplateByName } from './data-store.js';
import { format, parse } from 'date-fns';
import OpenAI from 'openai';

/**
 * OpenAI APIクライアントを初期化する
 */
async function initOpenAI(): Promise<OpenAI | null> {
  try {
    const config = await getConfig();
    
    if (!config?.api?.apiKey) {
      console.error('⚠️ OpenAI APIキーが設定されていません');
      return null;
    }
    
    return new OpenAI({
      apiKey: config.api.apiKey
    });
  } catch (error) {
    console.error('OpenAI APIクライアントの初期化に失敗しました:', error);
    return null;
  }
}

/**
 * 日報から月報を生成する
 * @param reports 対象月の日報データ
 * @param templateName テンプレート名（指定がなければデフォルトテンプレート）
 * @returns 生成された月報
 */
export async function generateMonthlyReport(reports: DailyReport[], templateName?: string): Promise<string> {
  try {
    if (reports.length === 0) {
      throw new Error('日報データがありません');
    }
    
    // 日報を日付順に並べ替え
    const sortedReports = [...reports].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });
    
    // 対象月を特定
    const firstReport = sortedReports[0];
    const firstDate = parse(firstReport.date, 'yyyy-MM-dd', new Date());
    const targetMonth = format(firstDate, 'yyyy年MM月');
    
    // テンプレートの取得
    let template = null;
    if (templateName) {
      template = await getTemplateByName(templateName);
    } else {
      // デフォルトテンプレートを検索
      const templates = await import('./data-store.js').then(module => module.getTemplates());
      template = templates.find(t => t.isDefault) || null;
    }
    
    // OpenAI APIクライアントの初期化
    const openai = await initOpenAI();
    
    if (!openai) {
      console.log('❌ OpenAI APIの初期化に失敗しました。APIキーを設定してください。');
      return `# ${targetMonth}の月報 (テンプレート出力)\n\n` + generateBasicMonthlyReport(sortedReports, template?.content);
    }
    
    // APIリクエストの準備
    const config = await getConfig();
    const model = config?.api?.model || 'gpt-4o';
    
    // 日報データをテキスト形式に変換
    const reportsText = sortedReports.map(report => {
      return `日付: ${report.date}\n` +
             `勤務時間: ${report.workHours.start}〜${report.workHours.end} (${report.workHours.total})\n` +
             `勤務場所: ${report.location}\n` +
             `タスク状況: ${report.taskStatus}\n` +
             `実施タスク:\n${report.tasks}\n` +
             `特記事項: ${report.notes || 'なし'}\n`;
    }).join('\n---\n\n');
    
    // プロンプトの作成
    let prompt = `以下の日報データから${targetMonth}の月報を生成してください。`;
    
    if (template?.content) {
      prompt += `\n\n以下のテンプレートに基づいて生成してください：\n\n${template.content}`;
    } else {
      prompt += `\n\n次の形式で生成してください：
# {{month}}の業務報告

## 業務サマリー
（主要なタスクと進捗の要約）

## 実施タスク
（タスク詳細のリスト）

## 課題と解決策
（遭遇した課題と対応策）

## 次月の計画
（来月の計画）`;
    }
    
    console.log('🤖 AIによる月報生成中...');
    
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: '与えられた日報データから月報を作成してください。簡潔かつ組織的に情報をまとめてください。'
        },
        {
          role: 'user',
          content: `${prompt}\n\n日報データ:\n\n${reportsText}`
        }
      ],
      temperature: 0.7,
      max_tokens: 2048
    });
    
    const generatedReport = completion.choices[0].message.content;
    
    if (!generatedReport) {
      throw new Error('AIによる月報生成に失敗しました');
    }
    
    return generatedReport;
    
  } catch (error) {
    console.error('月報生成に失敗しました:', error);
    
    // エラー時はシンプルな月報を生成
    const sortedReports = [...reports].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });
    
    const firstReport = sortedReports[0];
    const firstDate = parse(firstReport.date, 'yyyy-MM-dd', new Date());
    const targetMonth = format(firstDate, 'yyyy年MM月');
    
    return `# ${targetMonth}の月報 (エラーにより簡易生成)\n\n` + 
           generateBasicMonthlyReport(sortedReports);
  }
}

/**
 * シンプルな月報を生成する（APIエラー時のフォールバック）
 */
function generateBasicMonthlyReport(reports: DailyReport[], template?: string): string {
  // 日報を日付順に並べ替え
  const sortedReports = [...reports].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateA.getTime() - dateB.getTime();
  });
  
  // 対象月を特定
  const firstReport = sortedReports[0];
  const firstDate = parse(firstReport.date, 'yyyy-MM-dd', new Date());
  const targetMonth = format(firstDate, 'yyyy年MM月');
  
  // 勤務時間の集計
  const totalWorkHours = sortedReports.reduce((total, report) => {
    // 形式: "8h30m" から分に変換
    const hourMatch = report.workHours.total.match(/(\d+)h/);
    const minuteMatch = report.workHours.total.match(/(\d+)m/);
    
    const hours = hourMatch ? parseInt(hourMatch[1]) : 0;
    const minutes = minuteMatch ? parseInt(minuteMatch[1]) : 0;
    
    return total + (hours * 60) + minutes;
  }, 0);
  
  const totalHours = Math.floor(totalWorkHours / 60);
  const totalMinutes = totalWorkHours % 60;
  
  // テンプレートがあれば使用、なければ基本フォーマット
  if (template) {
    // テンプレート変数の置換
    return template
      .replace(/{{month}}/g, targetMonth)
      .replace(/{{total_days}}/g, reports.length.toString())
      .replace(/{{total_hours}}/g, `${totalHours}時間${totalMinutes}分`);
  }
  
  // 基本フォーマットでの出力
  let report = `# ${targetMonth}の業務報告\n\n`;
  
  report += `## 業務サマリー\n`;
  report += `- 勤務日数: ${reports.length}日\n`;
  report += `- 合計勤務時間: ${totalHours}時間${totalMinutes}分\n\n`;
  
  report += `## 日次業務報告\n\n`;
  
  // 日報ごとの要約
  sortedReports.forEach(dailyReport => {
    report += `### ${dailyReport.date} (${dailyReport.location})\n`;
    report += `- 勤務時間: ${dailyReport.workHours.start}〜${dailyReport.workHours.end} (${dailyReport.workHours.total})\n`;
    report += `- タスク状況: ${dailyReport.taskStatus}\n`;
    report += `- 実施タスク:\n`;
    
    // タスクを箇条書きに変換
    const tasks = dailyReport.tasks.split('\n').filter(line => line.trim().length > 0);
    tasks.forEach(task => {
      report += `  - ${task.trim()}\n`;
    });
    
    if (dailyReport.notes) {
      report += `- 特記事項: ${dailyReport.notes}\n`;
    }
    
    report += `\n`;
  });
  
  return report;
}

export default {
  generateMonthlyReport
};