/**
 * 日報入力用の対話式プロンプト定義
 */
import inquirer from 'inquirer';
import { format } from 'date-fns';
import { DailyReportInput, DailyReport } from '../../models/daily-report.js';

/**
 * 日報入力用のプロンプト
 * @param defaultValues 初期値（編集時に使用）
 * @returns 入力された日報データ
 */
export async function promptDailyReport(
  defaultValues?: Partial<DailyReport>
): Promise<DailyReportInput> {
  const today = new Date();
  const defaultDate = defaultValues?.date || format(today, 'yyyy-MM-dd');
  
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'date',
      message: '日付 (YYYY-MM-DD):',
      default: defaultDate,
      validate: (input: string) => {
        // 日付形式の検証
        const regex = /^\d{4}-\d{2}-\d{2}$/;
        if (!regex.test(input)) {
          return '日付は YYYY-MM-DD 形式で入力してください';
        }
        return true;
      }
    },
    {
      type: 'input',
      name: 'workHours.start',
      message: '勤務開始時間 (HH:MM):',
      default: defaultValues?.workHours?.start || '09:00',
      validate: (input: string) => {
        // 時間形式の検証
        const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
        if (!regex.test(input)) {
          return '時間は HH:MM 形式で入力してください';
        }
        return true;
      }
    },
    {
      type: 'input',
      name: 'workHours.end',
      message: '勤務終了時間 (HH:MM):',
      default: defaultValues?.workHours?.end || '18:00',
      validate: (input: string) => {
        // 時間形式の検証
        const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
        if (!regex.test(input)) {
          return '時間は HH:MM 形式で入力してください';
        }
        return true;
      }
    },
    {
      type: 'list',
      name: 'location',
      message: '勤務場所:',
      choices: ['オフィス', 'リモート', '客先', 'その他'],
      default: defaultValues?.location || 'オフィス'
    },
    {
      type: 'list',
      name: 'taskStatus',
      message: 'タスク状況:',
      choices: ['順調', '遅延', '停滞', 'ブロック中'],
      default: defaultValues?.taskStatus || '順調'
    },
    {
      type: 'editor',
      name: 'tasks',
      message: '実施タスク:',
      default: defaultValues?.tasks || '',
    },
    {
      type: 'list',
      name: 'nextDayLocation',
      message: '翌日の勤務場所:',
      choices: ['オフィス', 'リモート', '客先', '不明', 'その他'],
      default: defaultValues?.nextDayLocation || 'オフィス'
    },
    {
      type: 'editor',
      name: 'notes',
      message: '連絡事項・特記事項:',
      default: defaultValues?.notes || '',
    }
  ]);

  return answers as DailyReportInput;
}