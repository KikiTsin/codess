"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultGlobalCss = exports.notRenderChildrenComps = exports.compExcludeClassnames = exports.initConfig = exports.DSL_CONFIG = exports.OUTPUT_TYPE = exports.COMPONENT_TYPE = exports.CSS_TYPE = exports.prettierHtmlOpt = exports.prettierLessOpt = exports.prettierScssOpt = exports.prettierJsonOpt = exports.prettierCssOpt = exports.prettierJsOpt = void 0;
exports.prettierJsOpt = {
    parser: 'babel',
    printWidth: 120,
    singleQuote: true,
};
exports.prettierCssOpt = {
    parser: 'css',
};
exports.prettierJsonOpt = {
    parser: 'json',
};
exports.prettierScssOpt = {
    parser: 'scss',
    tabWidth: 2,
    printWidth: 120,
    singleQuote: true,
};
exports.prettierLessOpt = {
    parser: 'less',
    tabWidth: 2,
    printWidth: 120,
    singleQuote: true,
};
exports.prettierHtmlOpt = {
    parser: 'html',
    printWidth: 120,
    singleQuote: true,
};
exports.CSS_TYPE = {
    MODULE_CLASS: 'module',
    MODULE_STYLE: 'module_style',
    IMPORT_CLASS: 'import',
    INLINE_CSS: 'inline',
};
exports.COMPONENT_TYPE = {
    HOOKS: 'hooks',
    COMPONENT: 'component',
};
exports.OUTPUT_TYPE = {
    PROJECT: 'project',
    COMPONENT: 'component',
};
// 记录全局参数配置，初始化时直接修改
exports.DSL_CONFIG = {
    responseWidth: 750,
    scale: 1,
    globalCss: true,
    cssUnit: 'px',
    componentStyle: 'hooks',
    inlineStyle: 'module',
    outputStyle: 'component',
    cssStyle: 'camelCase',
    htmlFontSize: 16,
};
const initConfig = (cfg) => {
    exports.DSL_CONFIG = Object.assign(exports.DSL_CONFIG, cfg);
};
exports.initConfig = initConfig;
exports.compExcludeClassnames = [
];
exports.notRenderChildrenComps = [
    'ImageUpload',
    'Radio',
    'Switch',
    'SearchBar',
    'NumberKeyboard',
];
exports.defaultGlobalCss = `/**
 * 全局样式 global.css
 */
.flex-row {
	display: flex;
	flex-direction: row;
}

.flex-col {
	display: flex;
	flex-direction: column;
}

.justify-start {
	display: flex;
	justify-content: flex-start;
}

.justify-center {
	display: flex;
	justify-content: center;
}

.justify-end {
	display: flex;
	justify-content: flex-end;
}

.justify-between {
	display: flex;
	justify-content: space-between;
}

.items-start {
	display: flex;
	align-items: flex-start;
}

.items-center {
	display: flex;
	align-items: center;
}

.items-end {
	display: flex;
	align-items: flex-end;
}

`;
