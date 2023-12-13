"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildCode = exports.buildReactCodeSync = exports.buildCodeSync = void 0;
const core_1 = require("../vue_dsl/core");
const node_path_1 = require("node:path");
const react_dsl_1 = require("../react_dsl");
const fs = require('fs-extra');
const buildCodeSync = async (options) => {
    const { outputPath, transformedData, imgFileMap } = options;
    const renderInfo = await (0, core_1.transformSchema)({
        transformedData,
        imgFileMap,
    }, {
        responsive: {
            width: 750,
            viewportWidth: 375,
        },
    });
    // console.log(renderInfo);
    renderInfo.panelDisplay.forEach((file) => {
        fs.outputFileSync((0, node_path_1.join)(outputPath, `${file.panelName}`), file.panelValue);
    });
};
exports.buildCodeSync = buildCodeSync;
const buildReactCodeSync = async (options) => {
    const panelDisplay = await (0, react_dsl_1.transformSchemaReact)(options, {
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
            let fileFolder = (0, node_path_1.join)(outputPath, `/${file.folder}`);
            fs.ensureDirSync(fileFolder);
            fs.outputFileSync(`${outputPath}/${file.folder}/${file.panelName}`, file.panelValue);
        }
        else {
            fs.outputFileSync((0, node_path_1.join)(outputPath, `/${file.panelName}`), file.panelValue);
        }
    });
};
exports.buildReactCodeSync = buildReactCodeSync;
const buildCode = (options) => {
    return new Promise((resolve, reject) => {
        try {
            const { lang = 'vue' } = options;
            if (lang === 'vue') {
                (0, exports.buildCodeSync)(options);
            }
            else {
                (0, exports.buildReactCodeSync)(options);
            }
        }
        catch (error) {
            reject(error);
        }
        resolve(true);
    });
};
exports.buildCode = buildCode;
