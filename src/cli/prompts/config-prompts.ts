/**
 * 設定変更用の対話式プロンプト定義
 */
import inquirer from 'inquirer';

/**
 * 基本設定項目の入力プロンプト
 */
export async function promptBasicConfig(defaultValues?: any) {
  return inquirer.prompt([
    {
      type: 'input',
      name: 'userName',
      message: 'ユーザー名:',
      default: defaultValues?.userName || ''
    },
    {
      type: 'input',
      name: 'defaultLocation',
      message: 'デフォルト勤務場所:',
      default: defaultValues?.defaultLocation || 'オフィス'
    },
    {
      type: 'input',
      name: 'defaultStartTime',
      message: 'デフォルト勤務開始時間 (HH:MM):',
      default: defaultValues?.defaultStartTime || '09:00',
      validate: (input: string) => {
        const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
        if (!regex.test(input)) {
          return '時間は HH:MM 形式で入力してください';
        }
        return true;
      }
    },
    {
      type: 'input',
      name: 'defaultEndTime',
      message: 'デフォルト勤務終了時間 (HH:MM):',
      default: defaultValues?.defaultEndTime || '18:00',
      validate: (input: string) => {
        const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
        if (!regex.test(input)) {
          return '時間は HH:MM 形式で入力してください';
        }
        return true;
      }
    }
  ]);
}

/**
 * OpenAI API設定用のプロンプト
 */
export async function promptApiConfig(defaultValues?: any) {
  return inquirer.prompt([
    {
      type: 'password',
      name: 'apiKey',
      message: 'OpenAI APIキー:',
      default: defaultValues?.apiKey || '',
      mask: '*'
    },
    {
      type: 'list',
      name: 'model',
      message: 'AIモデルの選択:',
      choices: [
        'gpt-4o',
        'gpt-4-turbo',
        'gpt-4',
        'gpt-3.5-turbo'
      ],
      default: defaultValues?.model || 'gpt-4o'
    }
  ]);
}