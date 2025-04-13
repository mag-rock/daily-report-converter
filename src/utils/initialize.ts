import dataStore from '../services/data-store.js';
import { mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

/**
 * アプリケーションの初期化処理
 */
export async function initializeApp(): Promise<void> {
  console.log('🚀 日報変換ツールを初期化しています...');
  
  try {
    // 必要なディレクトリの作成確認
    ensureDirectories();
    
    // データベースの初期化
    await dataStore.initializeDb();
    
    console.log('✅ 初期化が完了しました');
  } catch (error) {
    console.error('❌ 初期化に失敗しました:', error);
    throw error;
  }
}

/**
 * 必要なディレクトリを確保する
 */
function ensureDirectories(): void {
  try {
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const baseDir = join(__dirname, '../../');
    const dirs = [
      join(baseDir, 'data'),
      join(baseDir, 'data/reports'),
      join(baseDir, 'data/settings'),
      join(baseDir, 'data/templates')
    ];
    
    dirs.forEach(dir => {
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
        console.log(`📁 ディレクトリを作成しました: ${dir}`);
      }
    });
  } catch (error) {
    console.error('ディレクトリ作成に失敗しました:', error);
    throw error;
  }
}

export default {
  initializeApp
};