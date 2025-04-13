/**
 * テンプレート管理コマンドの定義
 */
import { Command } from 'commander';
import inquirer from 'inquirer';
import { v4 as uuidv4 } from 'uuid';
import { getTemplates, getTemplateByName, saveTemplate, deleteTemplate } from '../../services/data-store.js';
import { promptTemplateEdit } from '../prompts/template-prompts.js';

export function templateCommand(program: Command): void {
  program
    .command('template')
    .alias('t')
    .description('テンプレートの管理')
    .option('-l, --list', 'テンプレート一覧を表示', false)
    .option('-c, --create', '新規テンプレートを作成', false)
    .option('-e, --edit <name>', '指定したテンプレートを編集')
    .option('-d, --delete <name>', '指定したテンプレートを削除')
    .option('-s, --show <name>', '指定したテンプレートを表示')
    .action(async (options) => {
      try {
        // テンプレート一覧の表示
        if (options.list || (!options.create && !options.edit && !options.delete && !options.show)) {
          const templates = await getTemplates();
          
          console.log('📋 テンプレート一覧:');
          
          if (templates.length === 0) {
            console.log('テンプレートがありません');
            return;
          }
          
          templates.forEach((template, index) => {
            const defaultMark = template.isDefault ? '【デフォルト】' : '';
            console.log(`${index + 1}. ${template.name} (${template.type}) ${defaultMark}`);
          });
          
          return;
        }
        
        // テンプレートの新規作成
        if (options.create) {
          console.log('📝 新規テンプレートを作成します');
          
          // テンプレート情報の入力
          const templateData = await promptTemplateEdit();
          
          // テンプレートIDの生成
          const template = {
            id: uuidv4(),
            ...templateData,
          };
          
          // テンプレートの保存
          await saveTemplate(template);
          
          console.log(`✅ テンプレート "${template.name}" を作成しました`);
          return;
        }
        
        // テンプレートの編集
        if (options.edit) {
          const templateName = options.edit;
          
          // テンプレートの取得
          const template = await getTemplateByName(templateName);
          
          if (!template) {
            console.log(`❌ テンプレート "${templateName}" が見つかりません`);
            return;
          }
          
          console.log(`✏️ テンプレート "${templateName}" を編集します`);
          
          // テンプレート情報の入力
          const updatedData = await promptTemplateEdit(template);
          
          // テンプレートの更新
          const updatedTemplate = {
            ...template,
            ...updatedData,
          };
          
          await saveTemplate(updatedTemplate);
          
          console.log(`✅ テンプレート "${updatedTemplate.name}" を更新しました`);
          return;
        }
        
        // テンプレートの削除
        if (options.delete) {
          const templateName = options.delete;
          
          // テンプレートの取得
          const template = await getTemplateByName(templateName);
          
          if (!template) {
            console.log(`❌ テンプレート "${templateName}" が見つかりません`);
            return;
          }
          
          // 削除確認
          const { confirm } = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'confirm',
              message: `テンプレート "${templateName}" を削除してよろしいですか？`,
              default: false
            }
          ]);
          
          if (!confirm) {
            console.log('削除をキャンセルしました');
            return;
          }
          
          // テンプレートの削除
          await deleteTemplate(template.id);
          
          console.log(`✅ テンプレート "${templateName}" を削除しました`);
          return;
        }
        
        // テンプレートの表示
        if (options.show) {
          const templateName = options.show;
          
          // テンプレートの取得
          const template = await getTemplateByName(templateName);
          
          if (!template) {
            console.log(`❌ テンプレート "${templateName}" が見つかりません`);
            return;
          }
          
          console.log(`📄 テンプレート "${template.name}" (${template.type}):`);
          console.log('----------');
          console.log(template.content);
          console.log('----------');
          
          if (template.isDefault) {
            console.log('このテンプレートはデフォルトに設定されています');
          }
          
          return;
        }
        
      } catch (error) {
        console.error('❌ エラーが発生しました:', error);
      }
    });
}