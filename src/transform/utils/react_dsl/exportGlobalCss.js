"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { CSS_TYPE, prettierCssOpt } = require('./consts');
function exportGlobalCss(schema, option) {
    return new Promise(async (resolve) => {
        const { prettier, dslConfig, _, folder = '' } = option;
        // 只有一个模块时，生成到当前模块
        if (dslConfig.globalCss && dslConfig.inlineStyle !== CSS_TYPE.INLINE_CSS) {
            resolve([
                {
                    panelName: `global.css`,
                    panelValue: prettier.format(schema.css || '', prettierCssOpt),
                    panelType: 'css',
                    folder: folder,
                },
            ]);
        }
        else {
            resolve([]);
        }
    });
}
exports.default = exportGlobalCss;
