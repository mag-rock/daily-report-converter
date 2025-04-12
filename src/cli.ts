#!/usr/bin/env node

import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ESMでの__dirnameの代替手段
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// package.jsonを読み込む
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const version = packageJson.version;

const program = new Command();

program
  .name('daily-report')
  .description('日報入力・月報生成支援ツール')
  .version(version);

// コマンドのサブモジュールをここでインポートします（実装後）
// import { registerDailyReportCommand } from './cli/daily-report.js';
// import { registerMonthlyReportCommand } from './cli/monthly-report.js';

// コマンド登録
// registerDailyReportCommand(program);
// registerMonthlyReportCommand(program);

program.parse(process.argv);

// コマンドが指定されていない場合はヘルプを表示
if (!process.argv.slice(2).length) {
  program.outputHelp();
}