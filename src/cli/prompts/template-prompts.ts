/**
 * テンプレート管理用の対話式プロンプト定義
 */
import inquirer from 'inquirer';

/**
 * テンプレート作成・編集用のプロンプト
 */
export async function promptTemplateEdit(defaultValues?: any) {
  return inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'テンプレート名:',
      default: defaultValues?.name || '',
      validate: (input: string) => {
        if (!input.trim()) {
          return 'テンプレート名を入力してください';
        }
        return true;
      }
    },
    {
      type: 'list',
      name: 'type',
      message: 'テンプレートタイプ:',
      choices: ['月報', '週報', 'その他'],
      default: defaultValues?.type || '月報'
    },
    {
      type: 'editor',
      name: 'content',
      message: 'テンプレート内容:\n（変数は {{variable_name}} の形式で挿入できます）',
      default: defaultValues?.content || '',
      validate: (input: string) => {
        if (!input.trim()) {
          return 'テンプレート内容を入力してください';
        }
        return true;
      }
    },
    {
      type: 'confirm',
      name: 'isDefault',
      message: 'このテンプレートをデフォルトにしますか？',
      default: defaultValues?.isDefault || false
    }
  ]);
}

/**
 * テンプレート選択用のプロンプト
 */
export async function promptTemplateSelect(templates: Array<{ name: string, type: string }>) {
  return inquirer.prompt([
    {
      type: 'list',
      name: 'templateName',
      message: '使用するテンプレートを選択:',
      choices: templates.map(t => ({ name: `${t.name} (${t.type})`, value: t.name })),
      when: templates.length > 0
    }
  ]);
}