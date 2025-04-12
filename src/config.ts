import path from 'path';
import os from 'os';

/**
 * アプリケーション設定
 */
export const APP_CONFIG = {
  // アプリケーション名
  name: 'daily-report-converter',
  
  // データ保存ディレクトリ
  dataDir: path.join(os.homedir(), '.daily-report-converter'),
  
  // 各種データ保存先
  paths: {
    reports: path.join(os.homedir(), '.daily-report-converter', 'reports'),
    settings: path.join(os.homedir(), '.daily-report-converter', 'settings'),
    templates: path.join(os.homedir(), '.daily-report-converter', 'templates'),
  },
  
  // 日報のデフォルト設定
  defaults: {
    workHours: {
      start: '9:30',
      end: '18:30',
    },
    workLocations: [
      'リモート',
      '大門',
      '新橋',
      'その他',
    ],
    taskStatuses: [
      '順調',
      '遅延',
      'その他',
    ],
  },
  
  // 日報フォーマット
  reportFormat: {
    daily: [
      '【日報】{date}',
      '①勤務時間:{startTime}-{endTime}({workHours})',
      '②勤務場所:{location}',
      '③タスク状況:{taskStatus}',
      '④実施したタスク:{tasks}',
      '⑤翌日の勤務場所:{nextDayLocation}',
      '⑥月内の累積稼働時間：{monthlyTotalHours}',
      '⑦その他連絡事項：{notes}',
    ].join('\\n'),
  },
};

/**
 * AIサービス設定（OpenAI API）
 */
export const AI_CONFIG = {
  provider: 'openai',
  apiKeyEnvVar: 'OPENAI_API_KEY',
  defaultModel: 'gpt-4o',
  temperature: 0.3,
  maxTokens: 2000,
};