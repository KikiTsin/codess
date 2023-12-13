import { join } from 'node:path';
import * as vscode from 'vscode';
const rootPath = vscode.workspace.rootPath as string;
// const rootPath = process.cwd();
export const pathConfig = {
  d2cStatic: join(rootPath, '/public/d2cJSON'),
  public: join(rootPath, '/public'),
  root: rootPath,
};
