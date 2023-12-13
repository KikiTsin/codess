"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const consts_1 = require("./consts");
const _ = __importStar(require("lodash"));
const exportBlock_1 = __importDefault(require("./exportBlock"));
// const exportPage from './exportPage';
const exportCreateApp_1 = __importDefault(require("./exportCreateApp"));
const exportGlobalCss_1 = __importDefault(require("./exportGlobalCss"));
async function default_1(schema, option) {
    // get blocks json
    const blocks = [];
    const pages = [];
    // 参数设置
    option.scale = 750 / ((option.responsive && option.responsive.width) || 750);
    option.componentsMap = (0, utils_1.transComponentsMap)(option.componentsMap);
    option.blockInPage = schema.componentName === 'Page';
    option.pageGlobalCss = schema.css || '';
    const dslConfig = Object.assign({
        scale: option.scale,
        globalCss: true,
        cssUnit: 'px',
        inlineStyle: consts_1.CSS_TYPE.MODULE_CLASS,
        componentStyle: consts_1.COMPONENT_TYPE.HOOKS,
        htmlFontSize: 16,
    }, _.get(schema, 'imgcook.dslConfig'));
    dslConfig.useHooks = dslConfig.componentStyle === consts_1.COMPONENT_TYPE.HOOKS;
    dslConfig.useTypescript = dslConfig.jsx === 'typescript';
    option.dslConfig = dslConfig;
    schema.css = schema.css || (option.useTailwind ? '' : consts_1.defaultGlobalCss);
    // 初始化全局参数
    (0, consts_1.initConfig)(dslConfig);
    // 可选 className name  style
    // inlineStyle = inlineStyle !== 'className';
    const { inlineStyle } = dslConfig;
    // clear schema
    (0, utils_1.initSchema)(schema);
    const isProject = dslConfig.outputStyle == consts_1.OUTPUT_TYPE.PROJECT;
    if (isProject) {
        // 导出完整项目时，使根节点为Page
        schema.componentName = 'Page';
    }
    // 记录所有blocks
    (0, utils_1.traverse)(schema, (json) => {
        switch (json.componentName.toLowerCase()) {
            case 'block':
                blocks.push(json);
                break;
            case 'page':
                pages.push(json);
                break;
        }
    });
    // 提取全局样式
    if ([consts_1.CSS_TYPE.IMPORT_CLASS].includes(inlineStyle)) {
        (0, utils_1.traverse)(schema, (json) => {
            let classnames = json.classnames || [];
            let style = json.props.style;
            const enableGlobalCss = dslConfig.globalCss && schema.css;
            // 计算全局样式类名
            if (enableGlobalCss) {
                const cssResults = (0, utils_1.getGlobalClassNames)(style, schema.css);
                if (cssResults.names.length > 0) {
                    classnames = [...classnames, ...cssResults.names];
                }
                json.props.style = cssResults.style;
                json.classnames = classnames || [];
            }
        });
    }
    // 提取公用样式
    if ([consts_1.CSS_TYPE.IMPORT_CLASS, consts_1.CSS_TYPE.MODULE_CLASS].includes(inlineStyle)) {
        blocks.forEach((block) => {
            (0, utils_1.commonStyle)(block);
        });
    }
    // 精简默认样式
    (0, utils_1.simpleStyle)(schema);
    if (option.useTailwind) {
        (0, utils_1.tailwindStyle)(schema);
    }
    // 提取全局样式，类名数组存于 json.classString , 剩余样式覆盖 style
    (0, utils_1.traverse)(schema, (json) => {
        let classnames = json.classnames || [];
        let tailwindClassnames = json.tailwindClassnames || [];
        const className = (json.props && json.props.className) || '';
        let classString = '';
        const style = json.props.style;
        // inline 内联 (不需要提取同名)
        if (inlineStyle === consts_1.CSS_TYPE.INLINE_CSS) {
            className && (classString = `className="${className}"`);
            json.props.codeStyle = style; // 内联样式
        }
        else if (inlineStyle === consts_1.CSS_TYPE.MODULE_STYLE) {
            className &&
                (classString = ` style={${(0, utils_1.genStyleCode)('styles', className)}}`);
        }
        else if (inlineStyle == consts_1.CSS_TYPE.MODULE_CLASS) {
            classnames.push(className);
            classnames = classnames.filter((name) => name !== '');
            classnames = classnames.map((name) => (0, utils_1.genStyleCode)('styles', name));
            if (classnames.length > 1 || tailwindClassnames.length > 0) {
                let symbol = classnames.length > 0 ? '`' : "'";
                classString = ` className={${symbol}${classnames
                    .map((name) => `\$\{${name}\}`)
                    .join(' ')
                    .trim()} ${tailwindClassnames.join(' ')}${symbol}}`;
            }
            else if (classnames.length == 1) {
                classString = ` className={${classnames[0].trim()}}`;
            }
        }
        else if (inlineStyle == consts_1.CSS_TYPE.IMPORT_CLASS) {
            classnames.push(className);
            classnames = classnames.filter((name) => name !== '');
            if (classnames.length >= 1) {
                classString = ` className="${classnames.join(' ')}"`;
            }
        }
        json.props.style = style;
        json.classString = classString;
    });
    option.blocksCount = blocks.length;
    option.pagesCount = pages.length;
    // export module code
    let panelDisplay = [];
    if (blocks.length > 0) {
        for (const block of blocks) {
            const result = await (0, exportBlock_1.default)(block, option);
            panelDisplay = panelDisplay.concat(result);
        }
    }
    // export Page code
    if (schema.componentName === 'Page') {
        const result = await (0, exportBlock_1.default)(schema, option);
        panelDisplay = panelDisplay.concat(result);
    }
    if (isProject) {
        // 依赖 package.json
        const dependencies = {};
        for (let item of panelDisplay) {
            if (item.panelDependencies && item.panelDependencies.length > 0) {
                for (let pack of item.panelDependencies) {
                    dependencies[pack.package] = pack.version || '*';
                }
            }
        }
        // 项目模式生成文件放到src中
        panelDisplay = panelDisplay.map((item) => {
            item.folder = 'src/' + item.folder;
            return item;
        });
        // 项目文件
        panelDisplay = panelDisplay.concat(await (0, exportCreateApp_1.default)(schema, { ...option, dependencies }));
    }
    // 全局样式
    panelDisplay = panelDisplay.concat(await (0, exportGlobalCss_1.default)(schema, { ...option, folder: isProject ? 'src' : '' }));
    return {
        panelDisplay,
        noTemplate: true,
    };
}
exports.default = default_1;
