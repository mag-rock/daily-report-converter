/**
 * 設定変更コマンドの定義
 */
import { Command } from 'commander';
import { promptBasicConfig, promptApiConfig } from '../prompts/config-prompts.js';
import { getConfig, saveConfig } from '../../services/data-store.js';

export function configCommand(program: Command): void {
  program
    .command('config')
    .description('アプリケーション設定の変更')
    .option('-l, --list', '現在の設定を表示', false)
    .option('-b, --basic', '基本設定の変更', false)
    .option('-a, --api', 'API設定の変更', false)
    .option('--reset', '設定をリセット', false)
    .action(async (options) => {
      try {
        // 現在の設定を取得
        let currentConfig = await getConfig();
        
        // 設定のリセット
        if (options.reset) {
          const defaultConfig = {
            userName: '',
            defaultLocation: 'オフィス',
            defaultStartTime: '09:00',
            defaultEndTime: '18:00',
            api: {
              apiKey: '',
              model: 'gpt-4o'
            }
          };
          
          await saveConfig(defaultConfig);
          console.log('✅ 設定をリセットしました');
          return;
        }
        
        // 現在の設定を表示
        if (options.list || (!options.basic && !options.api)) {
          console.log('📝 現在の設定:');
          
          // APIキーは表示しない
          const displayConfig = { ...currentConfig };
          if (displayConfig.api?.apiKey) {
            displayConfig.api = { ...displayConfig.api, apiKey: '********' };
          }
          
          console.log(JSON.stringify(displayConfig, null, 2));
          return;
        }
        
        // 基本設定の変更
        if (options.basic) {
          console.log('⚙️ 基本設定の変更');
          const basicConfig = await promptBasicConfig(currentConfig);
          
          // 設定を更新して保存
          currentConfig = {
            ...currentConfig,
            ...basicConfig
          };
          
          await saveConfig(currentConfig);
          console.log('✅ 基本設定を保存しました');
        }
        
        // API設定の変更
        if (options.api) {
          console.log('🔑 API設定の変更');
          const apiConfig = await promptApiConfig(currentConfig.api);
          
          // 設定を更新して保存
          currentConfig = {
            ...currentConfig,
            api: apiConfig
          };
          
          await saveConfig(currentConfig);
          console.log('✅ API設定を保存しました');
        }
        
      } catch (error) {
        console.error('❌ エラーが発生しました:', error);
      }
    });
}