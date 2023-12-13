"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleField = exports.findText = exports.importString = exports.addAnimation = exports.transAnimation = exports.getText = exports.parseDataSource = exports.existImport = exports.parseLifeCycles = exports.replaceState = exports.parseState = exports.parseLoop = exports.generateScss = exports.generateCssString = exports.generateCSS = exports.parseCamelToLine = exports.parseCondition = exports.parseProps = exports.toJsString = exports.parseFunction = exports.parseStyle = exports.parseNumberValue = exports.genStyleCode = exports.genStyleClass = exports.traverseBrother = exports.traverse = exports.initSchema = exports.simpleStyle = exports.commonStyle = exports.tailwindStyle = exports.resetCounter = exports.toUpperCaseStart = exports.toString = exports.transComponentsMap = exports.isEmptyObj = exports.line2Hump = exports.isExpression = exports.getGlobalClassNames = exports.getCssRules = void 0;
const find = require('lodash/find');
const unset = require('lodash/unset');
const set = require('lodash/set');
const get = require('lodash/get');
const camelCase = require('lodash/camelCase');
const kebabCase = require('lodash/kebabCase');
const snakeCase = require('lodash/snakeCase');
const cssParser = require('css/lib/parse');
const consts_1 = require("./consts");
const tailwindClassNames_1 = __importDefault(require("../tailwindClassNames"));
// 从 css 解析样式规则饿
const getCssRules = (text) => {
    if (!cssParser) {
        return [];
    }
    const globalCssResult = cssParser(text, { source: 'global.css' });
    let rules = globalCssResult.stylesheet.rules;
    rules = rules.filter((item) => item.type === 'rule');
    rules = rules.map((item) => {
        let style = {};
        for (let dec of item.declarations) {
            const property = camelCase(dec.property);
            style[property] = dec.value;
        }
        return {
            selectors: item.selectors[0],
            style: style,
        };
    });
    return rules;
};
exports.getCssRules = getCssRules;
//  提取全局样式
const getGlobalClassNames = (cssObject, globalCssString) => {
    let names = [];
    if (!(globalCssString && cssParser)) {
        // 没有全局样式名
        return {
            names,
            style: cssObject,
        };
    }
    // 解析全局 css 规则
    const rules = (0, exports.getCssRules)(globalCssString);
    for (let rule of rules) {
        // 按顺序提取样式
        // 仅提取 . 选择符
        const isMatch = find([cssObject], rule.style) && rule.selectors.startsWith('.');
        if (isMatch) {
            for (let key in rule.style) {
                unset(cssObject, key);
            }
            names.push(rule.selectors.replace('.', ''));
        }
    }
    return {
        names,
        style: cssObject,
    };
};
exports.getGlobalClassNames = getGlobalClassNames;
const isExpression = (value) => {
    return /^\{\{.*\}\}$/.test(value);
};
exports.isExpression = isExpression;
// eg: hello_world => HelloWorld
const line2Hump = (str) => {
    str = str.replace(/[_|-](\w)/g, (all, letter) => {
        return letter.toUpperCase();
    });
    str = str.charAt(0).toUpperCase() + str.slice(1);
    return str;
};
exports.line2Hump = line2Hump;
const isEmptyObj = (o) => {
    if (o !== null && Object.prototype.toString.call(o) === '[object Object]') {
        return !Object.keys(o).length;
    }
    return false;
};
exports.isEmptyObj = isEmptyObj;
const transComponentsMap = (compsMap) => {
    if (!compsMap || !Array.isArray(compsMap.list)) {
        return [];
    }
    let list = compsMap.list;
    for (let list_item of compsMap.list) {
        if (list_item.children && Array.isArray(list_item.children)) {
            list = list.concat(list_item.children);
        }
    }
    return list.reduce((obj, comp) => {
        const componentName = comp.name;
        if (!obj[componentName]) {
            if (comp.dependence) {
                try {
                    let dependence = typeof comp.dependence === 'string'
                        ? JSON.parse(comp.dependence)
                        : comp.dependence;
                    if (dependence) {
                        comp.packageName = dependence.package;
                    }
                    if (!comp.dependenceVersion) {
                        comp.dependenceVersion = '*';
                    }
                    comp.exportName = dependence.export_name;
                    comp.subName = dependence.sub_name;
                    if (/^\d/.test(comp.dependenceVersion)) {
                        comp.dependenceVersion = '^' + comp.dependenceVersion;
                    }
                }
                catch (e) {
                    console.log(e);
                }
            }
            obj[componentName] = comp;
        }
        return obj;
    }, {});
};
exports.transComponentsMap = transComponentsMap;
const toString = (value) => {
    if ({}.toString.call(value) === '[object Function]') {
        return value.toString();
    }
    if (typeof value === 'string') {
        return value;
    }
    if (typeof value === 'object') {
        return JSON.stringify(value, (key, value) => {
            if (typeof value === 'function') {
                return value.toString();
            }
            else {
                return value;
            }
        });
    }
    return String(value);
};
exports.toString = toString;
const toUpperCaseStart = (value) => {
    return value.charAt(0).toUpperCase() + value.slice(1);
};
exports.toUpperCaseStart = toUpperCaseStart;
// 计数器
let counter = {};
const getCounter = (key) => {
    counter[key] = (counter[key] || 0) + 1;
    return counter[key];
};
const resetCounter = (key) => {
    counter[key] = 0;
};
exports.resetCounter = resetCounter;
// 是否所有样式相同
function isAllEqual(array) {
    if (array.length > 0) {
        return !array.some(function (value, index) {
            return value !== array[0];
        });
    }
    else {
        return true;
    }
}
// 获得相同样式
function getMaxSameStyles(array) {
    if (array.length < 2) {
        return {};
    }
    let maxStyle = {};
    const keys = Object.keys(array[0]);
    for (let key of keys) {
        if (isAllEqual(array.map((item) => item[key]))) {
            maxStyle[key] = array[0][key];
        }
    }
    return maxStyle;
}
function getKebabCase(str) {
    let temp = str.replace(/[A-Z]/g, function (i) {
        return '-' + i.toLowerCase();
    });
    if (temp.slice(0, 1) === '-') {
        temp = temp.slice(1); //如果首字母是大写，执行replace时会多一个_，需要去掉
    }
    return temp;
}
const tailwindcssMap = {
    padding: 'p',
    paddingTop: 'pt',
    paddingLeft: 'pl',
    paddingRight: 'pr',
    paddingBottom: 'pb',
    margin: 'm',
    marginTop: 'mt',
    marginLeft: 'ml',
    marginRight: 'mr',
    marginBottom: 'mb',
};
function convertPaddingMargin(node, key = 'margin') {
    let style = node.props.style;
    const arr = Object.keys(style).filter((item) => item.startsWith(key));
    if (style[key] || arr.length <= 2) {
        // margin: [ marginTop ]
        for (let item of arr) {
            let prefix = tailwindcssMap[item];
            if (prefix) {
                node.tailwindClassnames = node.tailwindClassnames || [];
                // padding: 5px;
                // p-[5px]
                let num = style[item].replace(/[^\d]/gi, '');
                // todo 后续可以支持px rem转化
                const unit = 'px';
                node.tailwindClassnames.push(`${prefix}-[${num}${unit}]`);
                unset(node, `props.style.${item}`);
            }
        }
    }
}
function convertStyle2Tailwind(node, tailwindMap) {
    // 处理padding-* margin-*
    convertPaddingMargin(node);
    convertPaddingMargin(node, 'padding');
    // 处理layout flexbox & grid
    for (let style in node.props.style) {
        let style_str = `${getKebabCase(style)}: ${node.props.style[style]}`;
        if (tailwindMap[style_str]) {
            node.tailwindClassnames = node.tailwindClassnames || [];
            node.tailwindClassnames.push(tailwindMap[style_str]);
            unset(node, `props.style.${style}`);
        }
    }
    if (Object.keys(node.props.style).length === 0) {
        unset(node, 'props.className');
    }
}
const tailwindStyle = (schema) => {
    (0, exports.traverseBrother)(schema, function (nodes) {
        for (let node of nodes) {
            convertStyle2Tailwind(node, tailwindClassNames_1.default);
        }
    });
};
exports.tailwindStyle = tailwindStyle;
const commonStyle = (schema) => {
    (0, exports.traverseBrother)(schema, function (nodes) {
        const sameStyle = getMaxSameStyles(nodes
            .filter((item) => item.props && item.props.style)
            .map((item) => item.props.style));
        if (Object.keys(sameStyle).length > 3) {
            const commonClassName = (0, exports.genStyleClass)('common_' + nodes[0].props.className, consts_1.DSL_CONFIG.cssStyle);
            set(schema, `commonStyles.${commonClassName}`, (0, exports.parseStyle)(sameStyle));
            for (let node of nodes) {
                for (let key of Object.keys(sameStyle)) {
                    unset(node, `props.style.${key}`);
                }
                node.classnames = node.classnames || [];
                node.classnames.push(commonClassName);
            }
        }
    });
};
exports.commonStyle = commonStyle;
// 精简样式
const simpleStyle = (schema) => {
    function getMaxRepeatItem(array) {
        let a = {};
        let max = 0;
        let maxele = null;
        for (let i = 0; i < array.length; i++) {
            a[array[i]] == undefined ? (a[array[i]] = 1) : a[array[i]]++;
            if (a[array[i]] > max) {
                maxele = array[i];
                max = a[array[i]];
            }
        }
        return maxele;
    }
    // 统计出现字体最多的，放到根节点
    let fontFamilys = [];
    (0, exports.traverse)(schema, (node) => {
        const ft = get(node, 'props.style.fontFamily');
        if (ft) {
            fontFamilys.push(ft);
        }
    });
    const rootFont = get(schema, 'props.style.fontFamily') || getMaxRepeatItem(fontFamilys);
    if (rootFont) {
        (0, exports.traverse)(schema, (node) => {
            const ft = get(node, 'props.style.fontFamily');
            if (ft == rootFont) {
                unset(node, 'props.style.fontFamily');
            }
        });
        set(schema, 'props.style.fontFamily', rootFont);
    }
    // 删除 font-weight 400 或者 normal
    (0, exports.traverse)(schema, (node) => {
        const removeStyle = (node, styleName, values) => {
            const fw = get(node, `props.style.${styleName}`);
            if (values.includes(String(fw) || '')) {
                unset(node, `props.style.${styleName}`);
            }
        };
        removeStyle(node, 'fontWeight', ['400', 400, 'normal']);
        removeStyle(node, 'flexDirection', ['row']);
        removeStyle(node, 'textDecoration', ['none']);
    });
    return schema;
};
exports.simpleStyle = simpleStyle;
/**
 * 处理schema一些常见问题
 * @param schema
 * 1. 清理 class 空格
 * 2. 关键节点命名兜底
 */
const initSchema = (schema) => {
    //  重置计数器
    (0, exports.resetCounter)('page');
    (0, exports.resetCounter)('block');
    (0, exports.resetCounter)('component');
    // 清理 class 空格
    (0, exports.traverse)(schema, (node) => {
        if (node && node.props && node.props.className) {
            node.props.className = String(node.props.className).trim();
        }
        node.componentName = node.componentName || 'div';
    });
    // 样式名处理：指定命名风格
    (0, exports.traverse)(schema, (json) => {
        if (json.props && json.props.className) {
            json.props.className = (0, exports.genStyleClass)(json.props.className, consts_1.DSL_CONFIG.cssStyle);
        }
    });
    // 关键节点命名兜底
    (0, exports.traverse)(schema, (json) => {
        json.componentName = json.componentName || '';
        switch (json.componentName.toLowerCase()) {
            case 'page':
                json.fileName = (0, exports.line2Hump)(json.fileName || `page_${getCounter('page')}`);
                break;
            case 'block':
                json.fileName = (0, exports.line2Hump)(json.fileName || `block_${getCounter('block')}`);
                break;
            case 'component':
                json.fileName = (0, exports.line2Hump)(json.fileName || `component_${getCounter('component')}`);
                break;
            default:
                break;
        }
    });
    (0, exports.traverse)(schema, (json) => {
        if (json.componentName == 'Text') {
            delete json.props.lines;
        }
    });
};
exports.initSchema = initSchema;
// 遍历节点
const traverse = (json, callback) => {
    if (Array.isArray(json)) {
        json.forEach((node) => {
            (0, exports.traverse)(node, callback);
        });
        return;
    }
    // 去除 class 空格
    if (json && callback) {
        callback(json);
    }
    if (json.children &&
        json.children.length > 0 &&
        Array.isArray(json.children)) {
        json.children.forEach((child) => {
            (0, exports.traverse)(child, callback);
        });
    }
};
exports.traverse = traverse;
// 遍历兄弟节点
const traverseBrother = (json, callback) => {
    if (Array.isArray(json)) {
        json.forEach((node) => {
            (0, exports.traverseBrother)(node, callback);
        });
        return;
    }
    if (json && Array.isArray(json.children) && callback) {
        callback(json.children);
    }
    if (json.children &&
        json.children.length > 0 &&
        Array.isArray(json.children)) {
        json.children.forEach((child) => {
            (0, exports.traverseBrother)(child, callback);
        });
    }
};
exports.traverseBrother = traverseBrother;
const genStyleClass = (string, type) => {
    let classArray = string.split(' ');
    classArray = classArray.filter((name) => !!name);
    classArray = classArray.map((name) => {
        switch (type) {
            case 'camelCase':
                return camelCase(name);
            case 'kebabCase':
                return kebabCase(name);
            case 'snakeCase':
                return snakeCase(name);
            default:
                return camelCase(name);
        }
    });
    return classArray.join(' ');
};
exports.genStyleClass = genStyleClass;
const genStyleCode = (styles, key = '') => {
    return !/-/.test(key) && key.trim()
        ? `${styles}.${key}`
        : `${styles}['${key}']`;
};
exports.genStyleCode = genStyleCode;
const parseNumberValue = (value) => {
    const { cssUnit = 'px', scale, responseWidth } = consts_1.DSL_CONFIG;
    value = String(value).replace(/\b[\d\.]+(px|rem|rpx|vw)?\b/, (v) => {
        const nv = parseFloat(v);
        if (!isNaN(nv) && nv !== 0) {
            return (0, exports.toString)(nv);
        }
        else {
            return 0;
        }
    });
    if (/^\-?[\d\.]+$/.test(value)) {
        value = parseFloat(value);
        if (cssUnit == 'rpx') {
            value = (750 * value) / Number(responseWidth);
            value = value == 0 ? value : value + 'rpx';
        }
        else if (cssUnit == 'rem') {
            const htmlFontSize = consts_1.DSL_CONFIG.htmlFontSize || 16;
            value = parseFloat((value / htmlFontSize).toFixed(2));
            value = value ? `${value}rem` : value;
        }
        else if (cssUnit == 'vw') {
            const _w = 750 / scale;
            value = ((100 * parseInt(value)) / _w).toFixed(2);
            value = value == 0 ? value : value + 'vw';
        }
        else {
            value += cssUnit;
        }
    }
    return value;
};
exports.parseNumberValue = parseNumberValue;
// convert to responsive unit, such as vw
const parseStyle = (style) => {
    const { scale, cssUnit } = consts_1.DSL_CONFIG;
    const resultStyle = {};
    for (let key in style) {
        switch (key) {
            case 'fontSize':
            case 'marginTop':
            case 'marginBottom':
            case 'paddingTop':
            case 'paddingBottom':
            case 'height':
            case 'top':
            case 'bottom':
            case 'width':
            case 'maxWidth':
            case 'left':
            case 'right':
            case 'paddingRight':
            case 'paddingLeft':
            case 'marginLeft':
            case 'marginRight':
            case 'lineHeight':
            case 'borderBottomRightRadius':
            case 'borderBottomLeftRadius':
            case 'borderTopRightRadius':
            case 'borderTopLeftRadius':
            case 'borderRadius':
                resultStyle[key] = parseInt(style[key]) * scale;
                if (style[key]) {
                    resultStyle[key] = (0, exports.parseNumberValue)(style[key]);
                }
                break;
            default:
                if (style[key] && String(style[key]).includes('px')) {
                    resultStyle[key] = String(style[key]).replace(/[\d\.]+px/g, (v) => {
                        return /^[\d\.]+px$/.test(v) ? (0, exports.parseNumberValue)(v) : v;
                    });
                }
                resultStyle[key] = resultStyle[key] || style[key];
        }
    }
    return resultStyle;
};
exports.parseStyle = parseStyle;
// parse function, return params and content
const parseFunction = (func) => {
    const funcString = func.toString();
    const params = funcString.match(/\([^\(\)]*\)/)[0].slice(1, -1);
    const content = funcString.slice(funcString.indexOf('{') + 1, funcString.lastIndexOf('}'));
    return {
        params,
        content,
    };
};
exports.parseFunction = parseFunction;
const toJsString = (str) => {
    return typeof str === 'string' && str.includes("'")
        ? `\`${str}\``
        : `'${str}'`;
};
exports.toJsString = toJsString;
// parse layer props(static values or expression)
const parseProps = (value, isReactNode = false, isVariable = false) => {
    const isFunction = typeof value === 'string' && value.includes('=>');
    if (typeof value === 'function' || isFunction) {
        const { params, content } = (0, exports.parseFunction)(value);
        return `(${params}) => {${content}}`;
    }
    else if (typeof value === 'string') {
        if ((0, exports.isExpression)(value)) {
            if (isReactNode) {
                return value.slice(1, -1);
            }
            else {
                return value.slice(2, -2);
            }
        }
        if (isVariable) {
            return `${value}`;
        }
        else if (isReactNode) {
            return value;
        }
        else {
            return `${(0, exports.toJsString)(value)}`;
        }
    }
    else if (typeof value === 'object') {
        return `${JSON.stringify(value)}`;
    }
    else {
        return value;
    }
};
exports.parseProps = parseProps;
// parse condition: whether render the layer
const parseCondition = (condition, render) => {
    if (typeof condition === 'boolean') {
        return `${condition} && ${render}`;
    }
    else if (typeof condition === 'string') {
        condition = condition.replace(/this\./, '');
        return `${condition.slice(2, -2)} && ${render}`;
    }
};
exports.parseCondition = parseCondition;
// flexDirection -> flex-direction
const parseCamelToLine = (string) => {
    return string
        .split(/(?=[A-Z])/)
        .join('-')
        .toLowerCase();
};
exports.parseCamelToLine = parseCamelToLine;
// style obj -> css
const generateCSS = (style, prefix) => {
    let css = '';
    for (let layer in style) {
        css += `${prefix && prefix !== layer ? '.' + prefix + ' ' : ''}.${layer} {`;
        css += (0, exports.generateCssString)(style[layer]);
        css += '}';
    }
    return css;
};
exports.generateCSS = generateCSS;
/**
 * （1）定位属性：position  display  float  left  top  right  bottom   overflow  clear   z-index
（2）自身属性：width  height  padding  border  margin   background
（3）文字样式：font-family   font-size   font-style   font-weight   font-varient   color
（4）文本属性：text-align   vertical-align   text-wrap   text-transform   text-indent    text-decoration   letter-spacing    word-spacing    white-space   text-overflow
（5）css3中新增属性：content   box-shadow   border-radius  transform……
 */
const orderMap = [
    'position',
    'display',
    'float',
    'left',
    'top',
    'right',
    'bottom',
    'flex-direction',
    'justify-content',
    'align-items',
    'align-self',
    'overflow',
    'clear',
    'z-index',
    'width',
    'height',
    'max-width',
    'max-height',
    'padding',
    'padding-bottom',
    'padding-left',
    'padding-right',
    'padding-left',
    'border',
    'margin',
    'margin-top',
    'margin-bottom',
    'margin-left',
    'margin-right',
    'background',
    'background-color',
    'background-image',
    'background-size',
    'font-family',
    'font-size',
    'font-style',
    'font-weight',
    'font-varient',
    'line-height',
    'color',
    'text-align',
    'vertical-align',
    'text-wrap',
    'text-transform',
    'text-indent',
    'text-decoration',
    'letter-spacing',
    'word-spacing',
    'white-space',
    'text-overflow',
    'content',
    'box-shadow',
    'border-radius',
    'transform',
];
// genrate css object string
const generateCssString = (style) => {
    let css = '';
    let array = [];
    // 缩写margin
    const margin = Object.keys(style).filter((item) => item.startsWith('margin'));
    if (!style['margin'] && margin.length > 2) {
        style['margin'] = `${style['marginTop'] || 0} ${style['marginRight'] || 0} ${style['marginBottom'] || 0} ${style['marginLeft'] || 0}`;
        delete style['marginTop'];
        delete style['marginLeft'];
        delete style['marginBottom'];
        delete style['marginRight'];
    }
    // 缩写 padding
    const padding = Object.keys(style).filter((item) => item.startsWith('padding'));
    if (!style['padding'] && padding.length > 2) {
        style['padding'] = `${style['paddingTop'] || 0} ${style['paddingRight'] || 0} ${style['paddingBottom'] || 0} ${style['paddingLeft'] || 0}`;
        delete style['paddingTop'];
        delete style['paddingLeft'];
        delete style['paddingBottom'];
        delete style['paddingRight'];
    }
    for (let key in style) {
        const cssKey = (0, exports.parseCamelToLine)(key);
        const orderIndex = orderMap.indexOf(cssKey);
        array.push({
            key: cssKey,
            value: style[key],
            index: orderIndex == -1 ? 100 : orderIndex,
        });
    }
    array.sort((a, b) => {
        return a.index - b.index;
    });
    css = array
        .map((item) => {
        return `${item.key}: ${item.value};`;
    })
        .join('');
    return css;
};
exports.generateCssString = generateCssString;
// 根据 schema 生成 scss 或者 less
const generateScss = (schema) => {
    let scss = '';
    function walk(json) {
        if (json.props.className) {
            let className = json.props.className;
            scss += `.${className}{`;
            scss += `${(0, exports.generateCssString)((0, exports.parseStyle)(json.props.style))};`;
        }
        if (json.children && json.children.length > 0) {
            json.children.forEach((child) => {
                if (!['block', 'component', 'page'].includes(child.componentName.toLowerCase())) {
                    walk(child);
                }
            });
        }
        if (json.props.className) {
            scss += '}';
        }
    }
    walk(schema);
    return scss;
};
exports.generateScss = generateScss;
// parse loop render
const parseLoop = (loop, loopArg, render, params = {}) => {
    let data;
    let loopArgItem = (loopArg && loopArg[0]) || 'item';
    let loopArgIndex = (loopArg && loopArg[1]) || 'index';
    if (Array.isArray(loop)) {
        data = (0, exports.toString)(loop);
    }
    else if ((0, exports.isExpression)(loop)) {
        data = loop.slice(2, -2);
    }
    // add loop key
    const tagEnd = render.match(/^<.+?\s/)[0].length;
    render = `${render.slice(0, tagEnd)} key={${loopArgIndex}}${render.slice(tagEnd)}`;
    // remove `this`
    const re = new RegExp(`this.${loopArgItem}`, 'g');
    render = render.replace(re, loopArgItem);
    let stateValue = data;
    if (data.match(/this\.state\./)) {
        stateValue = `state.${data.split('.').pop()}`;
    }
    const formatRender = params['formatRender'] ||
        function (str) {
            return str;
        };
    return {
        hookState: [],
        value: `${stateValue}.map((${loopArgItem}, ${loopArgIndex}) => {
      return (${formatRender(render)});
    })`,
    };
};
exports.parseLoop = parseLoop;
// parse state
const parseState = (stateName, states) => {
    // hooks state
    return `const [${stateName}, set${(0, exports.toUpperCaseStart)(stateName)}] = useState(${(0, exports.toString)(states) || ''});`;
};
exports.parseState = parseState;
// replace state
const replaceState = (render) => {
    // remove `this`
    let stateName = 'state';
    const re = new RegExp(`this.state`, 'g');
    return render.replace(re, stateName);
};
exports.replaceState = replaceState;
// replace state
const parseLifeCycles = (schema, init) => {
    let lifeCycles = [];
    if (!schema.lifeCycles['_constructor'] && init) {
        schema.lifeCycles['_constructor'] = `function _constructor() {}`;
    }
    Object.keys(schema.lifeCycles).forEach((name) => {
        let { params, content } = (0, exports.parseFunction)(schema.lifeCycles[name]);
        content = (0, exports.replaceState)(content);
        switch (name) {
            case '_constructor': {
                init.push(content);
                lifeCycles.unshift(`
          // constructor
          useState(()=>{
            ${init.join('\n')}
          })
        `);
                break;
            }
            case 'componentDidMount': {
                lifeCycles.push(`
          // componentDidMount
          useEffect(()=>{
            ${content}
          }, [])
        `);
                break;
            }
            case 'componentDidUpdate': {
                lifeCycles.push(`
          // componentDidUpdate
          useEffect(()=>{
            ${content}
          })
        `);
                break;
            }
            case 'componentWillUnMount': {
                lifeCycles.push(`
          // componentWillUnMount
          useEffect(()=>{
            return ()=>{
              ${content}
            }
          }, [])
        `);
                break;
            }
        }
    });
    return lifeCycles;
};
exports.parseLifeCycles = parseLifeCycles;
const existImport = (imports, singleImport) => {
    let exist = false;
    imports.forEach((item) => {
        if (item._import === singleImport) {
            exist = true;
        }
    });
    return exist;
};
exports.existImport = existImport;
// parse async dataSource
const parseDataSource = (data) => {
    const name = data.id;
    const { uri, method, params } = data.options;
    const action = data.type;
    let payload = {};
    Object.keys(data.options).forEach((key) => {
        if (['uri', 'method', 'params'].indexOf(key) === -1) {
            payload[key] = (0, exports.toString)(data.options[key]);
        }
    });
    let comma = (0, exports.isEmptyObj)(payload) ? '' : ',';
    // params parse should in string template
    if (params) {
        if (method !== 'GET') {
            payload = `${(0, exports.toString)(payload).slice(0, -1)} ${comma} body: ${(0, exports.isExpression)(params) ? (0, exports.parseProps)(params) : (0, exports.toString)(params)}}`;
        }
        else {
            payload = `${(0, exports.toString)(payload).slice(0, -1)}}`;
        }
    }
    else {
        payload = (0, exports.toString)(payload);
    }
    let result = `{
  return ${action}(${(0, exports.parseProps)(uri)}, ${(0, exports.toString)(payload)})
    .then((response) => response.json())
`;
    if (data.dataHandler) {
        const { params, content } = (0, exports.parseFunction)(data.dataHandler);
        result += `.then((${params}) => {${content}})
    .catch((e) => {
      console.log('error', e);
    })
  `;
    }
    result += '}';
    return {
        value: `${name}() ${result}`,
        functionName: name,
        functionBody: result,
    };
};
exports.parseDataSource = parseDataSource;
// get children text
const getText = (schema) => {
    let text = '';
    const getChildrenText = (schema) => {
        const type = schema.componentName.toLowerCase();
        if (type === 'text') {
            text += (0, exports.parseProps)(schema.props.text || schema.text, true).replace(/\{/g, '${');
        }
        schema.children &&
            Array.isArray(schema.children) &&
            schema.children.map((item) => {
                getChildrenText(item);
            });
    };
    getChildrenText(schema);
    return text;
};
exports.getText = getText;
const transAnimation = function (animation) {
    let keyFrames = ``;
    for (let i of animation.keyframes) {
        keyFrames += `${((i.offset * 10000) / 100.0).toFixed(0) + '%'} {
  ${i.opacity ? 'opacity: '.concat(i.opacity) + ';' : ''}
  ${i.transform ? 'transform: '.concat(i.transform) + ';' : ''}
}
`;
    }
    let keyframes = `
@keyframes ${animation.name} {
${keyFrames}
}
`;
    return keyframes;
};
exports.transAnimation = transAnimation;
const addAnimation = function (schema) {
    let animationRes = ``;
    (0, exports.traverse)(schema, (json) => {
        if (json.animation) {
            animationRes += (0, exports.transAnimation)(json.animation);
        }
    });
    return animationRes;
};
exports.addAnimation = addAnimation;
/**
 * constrcut the import string
 */
const importString = (importsMap) => {
    const importStrings = [];
    const subImports = [];
    for (const [packageName, pkgSet] of importsMap) {
        const set1 = new Set(), set2 = new Set();
        for (const pkg of pkgSet) {
            let exportName = pkg.exportName;
            let subName = pkg.subName;
            let componentName = pkg.name;
            if (pkg.subName) {
                subImports.push(`const ${componentName} = ${exportName}.${subName};`);
            }
            if (!exportName) {
                exportName = componentName;
            }
            if (componentName !== exportName && !pkg.subName) {
                exportName = `${exportName} as ${componentName}`;
            }
            if (pkg.dependence && pkg.dependence.destructuring) {
                set2.add(exportName);
            }
            else {
                set1.add(exportName);
            }
        }
        const set1Str = [...set1].join(',');
        let set2Str = [...set2].join(',');
        const dot = set1Str && set2Str ? ',' : '';
        if (set2Str) {
            set2Str = `{${set2Str}}`;
        }
        importStrings.push(`import ${set1Str} ${dot} ${set2Str} from '${packageName}'`);
    }
    return importStrings.concat(subImports);
};
exports.importString = importString;
const findText = (schema) => {
    let text = [];
    function findTextNodes(nodes) {
        for (let node of nodes) {
            if (node.componentName === 'Text') {
                text.push(node.props.text || '');
            }
            if (Array.isArray(node.children) && node.children.length > 0) {
                findTextNodes(node.children);
            }
        }
    }
    findTextNodes(schema.children);
    return text.splice(0, 2);
};
exports.findText = findText;
const handleField = (compData, originalData) => {
    const { text = [] } = originalData;
    compData.props.label = text[0] || '文本';
    compData.props.placeholder = text[1] || '这里是输入框';
};
exports.handleField = handleField;
