"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.outputPath = exports.templatePath = exports.basePath = void 0;
const node_path_1 = require("node:path");
exports.basePath = (0, node_path_1.resolve)(__dirname, '../../../');
const getRelativePath = (pathStr = '') => {
    console.log((0, node_path_1.join)(exports.basePath, pathStr));
    return (0, node_path_1.join)(exports.basePath, pathStr);
};
exports.templatePath = getRelativePath('/utils/dsl/template');
exports.outputPath = getRelativePath('/test/output');
