import { resolve, join } from 'node:path'

export const basePath = resolve(__dirname, '../../../');

const getRelativePath = (pathStr = '') => {
  console.log(join(basePath, pathStr))
  return join(basePath, pathStr);
};

export const templatePath = getRelativePath('/utils/dsl/template');

export const outputPath = getRelativePath('/test/output');
