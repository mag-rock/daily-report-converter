import fs from 'fs/promises';
import path from 'path';
import { APP_CONFIG } from '../config.js';

/**
 * アプリケーションのデータディレクトリを初期化する
 * 初回起動時に必要なディレクトリ構造を作成する
 */
export async function initializeDataDirectories(): Promise<void> {
  const directories = [
    APP_CONFIG.dataDir,
    APP_CONFIG.paths.reports,
    APP_CONFIG.paths.settings,
    APP_CONFIG.paths.templates
  ];

  try {
    // データディレクトリを作成
    for (const dir of directories) {
      try {
        await fs.mkdir(dir, { recursive: true });
        console.log(`ディレクトリを作成しました: ${dir}`);
      } catch (error) {
        // ディレクトリがすでに存在する場合は無視
        if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
          throw error;
        }
      }
    }

    // デフォルト設定ファイルの作成
    const settingsFilePath = path.join(APP_CONFIG.paths.settings, 'user-settings.json');
    
    try {
      // 設定ファイルが存在するか確認
      await fs.access(settingsFilePath);
      console.log('設定ファイルはすでに存在します。');
    } catch (error) {
      // 設定ファイルが存在しない場合は作成
      const defaultSettings = {
        workHours: APP_CONFIG.defaults.workHours,
        workLocations: APP_CONFIG.defaults.workLocations,
        taskStatuses: APP_CONFIG.defaults.taskStatuses,
        createdAt: new Date().toISOString()
      };

      await fs.writeFile(
        settingsFilePath, 
        JSON.stringify(defaultSettings, null, 2), 
        'utf8'
      );
      console.log('デフォルト設定ファイルを作成しました。');
    }

    console.log('初期化が完了しました。');
  } catch (error) {
    console.error('初期化中にエラーが発生しました:', error);
    throw error;
  }
}