import { transformSchema } from '../vue_dsl/core';
import { join } from 'node:path';
import { transformSchemaReact } from '../react_dsl';
const fs = require('fs-extra');

export const buildCodeSync = async (options) => {
  const { outputPath, transformedData, imgFileMap } = options;
  const renderInfo = await transformSchema(
    {
      transformedData,
      imgFileMap,
    },
    {
      responsive: {
        width: 750,
        viewportWidth: 375,
      },
    }
  );
  // console.log(renderInfo);
  renderInfo.panelDisplay.forEach((file) => {
    fs.outputFileSync(join(outputPath, `${file.panelName}`), file.panelValue);
  });
};

export const buildReactCodeSync = async (options) => {
  const panelDisplay = await transformSchemaReact(options, {
    componentStyle: 'hooks',
    cssUnit: 'px',
    dsl: 'rax',
    globalCss: true,
    htmlFontSize: '16',
    inlineStyle: 'module',
    responseHeight: 1334,
    responseWidth: 750,
    useHooks: true,
    useTypescript: false,
  });
  const { outputPath } = options;
  // 先不删了，图片前置下载了，会把图片一起删掉。。
  // if (fs.pathExistsSync(outputPath)) {
  //   fs.removeSync(outputPath)
  // }
  // ttest
  fs.ensureDirSync(outputPath);
  panelDisplay.forEach((file) => {
    if (file.folder) {
      let fileFolder = join(outputPath, `/${file.folder}`);
      fs.ensureDirSync(fileFolder);
      fs.outputFileSync(
        `${outputPath}/${file.folder}/${file.panelName}`,
        file.panelValue
      );
    } else {
      fs.outputFileSync(
        join(outputPath, `/${file.panelName}`),
        file.panelValue
      );
    }
  });
};

export const buildCode = (options) => {
  return new Promise((resolve, reject) => {
    try {
      const { lang = 'vue' } = options;
      if (lang === 'vue') {
        buildCodeSync(options);
      } else {
        buildReactCodeSync(options);
      }
    } catch (error) {
      reject(error);
    }
    resolve(true);
  });
};
