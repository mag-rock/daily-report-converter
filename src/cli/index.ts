/**
 * CLIコマンド関連のインデックス
 * コマンドラインインターフェイスの実装
 */

import { Command } from 'commander';
import { createCommand } from './commands/create.js';
import { listCommand } from './commands/list.js';
import { editCommand } from './commands/edit.js';
import { generateCommand } from './commands/generate.js';
import { configCommand } from './commands/config.js';
import { templateCommand } from './commands/template.js';

/**
 * CLIコマンドを登録する
 * @param program Commander.jsのインスタンス
 */
export function registerCommands(program: Command): void {
  // 各コマンドを登録
  createCommand(program);
  listCommand(program);
  editCommand(program);
  generateCommand(program);
  configCommand(program);
  templateCommand(program);
}