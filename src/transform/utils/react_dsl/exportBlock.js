"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const consts_1 = require("./consts");
function exportMod(schema, option) {
    return new Promise(async (resolve) => {
        const { prettier, scale, componentsMap, folder, blocksCount, pagesCount, blockInPage, dslConfig = {}, pageGlobalCss, imgFileMap, } = option;
        const isExportGlobalFile = dslConfig.globalCss && blocksCount == 1 && !blockInPage;
        const fileName = schema.fileName;
        const { cssUnit } = dslConfig;
        const rootSchema = schema;
        let folderName;
        let filePathName = 'index';
        if (schema.componentName == 'Page') {
            // 单页面
            // if(pagesCount == 1){
            //   folderName = '';
            // }else{
            //   folderName = 'pages/' + schema.fileName;
            // }
            // folderName = 'pages/' + schema.fileName;
            folderName = '';
            if (dslConfig.outputStyle == consts_1.OUTPUT_TYPE.PROJECT) {
                filePathName = 'App';
            }
            // filePathName = schema.fileName
        }
        else {
            folderName =
                pagesCount == 0 &&
                    blocksCount == 1 &&
                    dslConfig.outputStyle !== consts_1.OUTPUT_TYPE.PROJECT
                    ? ''
                    : 'components/' + schema.fileName;
        }
        schema.folderName = folderName;
        const globalCss = pageGlobalCss + '\n' + (schema.css || '');
        // imports
        const dependenceList = [];
        // imports mods
        const importMods = [];
        // import css
        const importStyles = [];
        const importsMap = new Map();
        // inline style
        const style = {};
        // Global Public Functions
        const utils = [];
        // states
        let statesData = null;
        // useState
        let useState = [];
        // calsses
        let classes = [];
        // methods
        const methods = [];
        // life cycles
        let lifeCycles = [];
        // init
        const init = [];
        const cssFileName = `${filePathName}${dslConfig.inlineStyle == consts_1.CSS_TYPE.MODULE_CLASS ? '.module' : ''}.${dslConfig.cssType || 'css'}`;
        if (dslConfig.inlineStyle !== consts_1.CSS_TYPE.INLINE_CSS) {
            if (isExportGlobalFile) {
                importStyles.push(`import './global.css';`);
            }
            if (dslConfig.inlineStyle == consts_1.CSS_TYPE.IMPORT_CLASS) {
                importStyles.push(`import './${cssFileName}';`);
            }
            else {
                importStyles.push(`import styles from './${cssFileName}';`);
            }
        }
        const collectImports = (componentName) => {
            // ignore the empty string
            if (!componentName) {
                return;
            }
            const component = componentsMap[componentName];
            if (!component) {
                return;
            }
            const objSets = importsMap.get(component.packageName);
            if (!objSets) {
                const set = new Set();
                set.add(component);
                importsMap.set(component.packageName, set);
            }
            else {
                objSets.add(component);
            }
            if (!dependenceList.find((i) => i.package == component.packageName)) {
                dependenceList.push({
                    package: component.packageName,
                    version: component.dependenceVersion || '*',
                });
            }
        };
        function addImgImport(folderName, imgPath) {
            if (!imgPath) {
                return '""';
            }
            let val = new Set();
            // ./image/img0.png - -->
            //  foldername存在的话 components/Mod0
            // foldername不存在的话，./image/img0.png
            let finalPath = imgPath;
            let length = folderName.split('/').length;
            if (folderName && length > 0) {
                let path = new Array(length).fill('..');
                finalPath = imgPath.replace('.', `${path.join('/')}`);
            }
            const path_arr = imgPath.replace('.png', '').split('/');
            const exportName = path_arr[path_arr.length - 1];
            val.add({
                exportName,
                name: exportName,
            });
            importsMap.set(finalPath, val);
            return exportName;
        }
        // generate render xml
        /**
         *
         * @param {*} json
         * @param {*} isReplace 是否提取 block
         * @returns
         */
        const generateRender = (json, isReplace = false) => {
            if (typeof json == 'string') {
                return json;
            }
            if (Array.isArray(json)) {
                return json
                    .map((item) => {
                    return generateRender(item, isReplace);
                })
                    .join('');
            }
            let type = json.componentName.toLowerCase();
            let componentName = json.componentName;
            let componentSubClass = [], compArr = [];
            if (json.nodeLayerName && json.nodeLayerName.includes('#component')) {
                const nodeLayerNameArr = json.nodeLayerName.split(/\#|\:/);
                if (nodeLayerNameArr.length > 1) {
                    componentName = nodeLayerNameArr[nodeLayerNameArr.length - 2];
                    if (componentName.includes('/')) {
                        compArr = componentName.split('/');
                        componentSubClass = compArr.slice(1, compArr.length);
                        componentName = componentName.split('/')[0];
                    }
                    // 当节点是block且标记了组件的时候，会导致重复渲染组件代码
                    if (componentsMap[componentName] && !json.isGenerated) {
                        type = componentName;
                    }
                }
            }
            let className = json.props && json.props.className;
            let classString = json.classString || '';
            if (className) {
                style[className] = (0, utils_1.parseStyle)(json.props.style);
            }
            let xml;
            let props = '';
            Object.keys(json.props).forEach((key) => {
                if (key === 'codeStyle') {
                    if (json.props[key] && JSON.stringify(json.props[key]) !== '{}') {
                        props += ` style={${(0, utils_1.parseProps)(json.props[key])}}`;
                    }
                }
                if (['className', 'style', 'text', 'src', 'key', 'codeStyle'].indexOf(key) === -1) {
                    props += ` ${key}={${(0, utils_1.parseProps)(json.props[key])}}`;
                }
                // fix attr when type is not text
                if (type !== 'text' && ['text'].includes(key)) {
                    props += ` ${key}={${(0, utils_1.parseProps)(json.props[key])}}`;
                }
            });
            switch (type) {
                case 'text':
                    let innerText = (0, utils_1.parseProps)(json.props.text || json.text, true) || '';
                    if (innerText.match(/this\.props/)) {
                        innerText = innerText.replace(/this\./, '');
                    }
                    xml = `<span ${classString} ${props}>${innerText || ''}</span>`;
                    break;
                case 'image':
                    let source = (0, utils_1.parseProps)(json.props.src);
                    // 将 图片导入语句 增加进入importsmap
                    const exportName = addImgImport(folderName, imgFileMap[json.props.src]);
                    source = (source && `src={${exportName}}`) || '';
                    // const localFile = `"${imgFileMap[rawSource.replace(/\"/g, '')]}"`;
                    xml = `<img ${classString} ${props} ${source} />`;
                    break;
                case 'page':
                case 'block':
                case 'component':
                    if (isReplace) {
                        const compName = json.fileName;
                        xml = `<${compName} />`;
                        // 当前是 Page 模块
                        const compPath = rootSchema.componentName == 'Page' ? './components' : '..';
                        if (compName) {
                            importMods.push(`import ${compName} from '${compPath}/${compName}';`);
                        }
                        delete style[className];
                    }
                    else if (json.children && json.children.length) {
                        xml = `<div ${classString} ${props}>${json.children
                            .map((node) => {
                            return generateRender(node, true);
                        })
                            .join('')}</div>`;
                    }
                    else {
                        xml = `<div ${classString} ${props} />`;
                    }
                    break;
                case 'div':
                case 'view':
                    if (json.children && json.children.length) {
                        xml = `<div ${classString} ${props}>${json.children
                            .map((node) => {
                            return generateRender(node, true);
                        })
                            .join('')}</div>`;
                    }
                    else {
                        xml = `<div ${classString} ${props} />`;
                    }
                    break;
                default:
                    if (componentName) {
                        let componentData = {
                            ...componentsMap[componentName],
                        };
                        json.isGenerated = true;
                        if (componentSubClass.length) {
                            for (let classItem of componentSubClass) {
                                if (componentData[classItem]) {
                                    componentData.props = {
                                        ...componentData.props,
                                        ...componentData[classItem].props
                                    };
                                }
                            }
                        }
                        collectImports(componentName);
                        // 组件这里重置props，数据源从imgcook server改成componentsMap
                        props = '';
                        Object.keys(componentData.props).forEach((key) => {
                            const isVariable = Object.keys(componentData.state || {}).includes(componentData.props[key]);
                            props += ` ${key}={${(0, utils_1.parseProps)(componentData.props[key], false, isVariable)}}`;
                        });
                        handleHooksData(componentData);
                        if (consts_1.compExcludeClassnames.includes(componentName)) {
                            classString = '';
                        }
                        if (json.children &&
                            json.children.length &&
                            Array.isArray(json.children) &&
                            !consts_1.notRenderChildrenComps.includes(componentName)) {
                            xml = `<${componentName} ${classString} ${props}>${json.children
                                .map((node) => {
                                return generateRender(node, true);
                            })
                                .join('')}</${componentName}>`;
                        }
                        else if (typeof json.children === 'string') {
                            xml = `<${componentName} ${classString} ${props} >${json.children}</${componentName}>`;
                        }
                        else {
                            // 这里的props，根据组件不同状态，应该是imgcook AI识别组件的功能支撑的。
                            xml = `<${componentName} ${classString} ${props} />`;
                        }
                    }
                    else {
                        xml = '';
                    }
            }
            if (json.loop) {
                const parseLoopData = (0, utils_1.parseLoop)(json.loop, json.loopArgs, xml, {});
                xml = parseLoopData.value;
                useState = useState.concat(parseLoopData.hookState);
            }
            xml = (0, utils_1.replaceState)(xml);
            if (json.condition) {
                xml = (0, utils_1.parseCondition)(json.condition, xml);
            }
            if (json.loop || json.condition) {
                xml = `{${xml}}`;
            }
            return xml;
        };
        const handleHooksData = (json) => {
            // 容器组件处理: state/method/dataSource/lifeCycle
            if (json.methods) {
                Object.keys(json.methods).forEach((name) => {
                    const { params, content } = (0, utils_1.parseFunction)(json.methods[name]);
                    methods.push(`function ${name}(${params}) {${content}}`);
                });
            }
            if (json.dataSource && Array.isArray(json.dataSource.list)) {
                json.dataSource.list.forEach((item) => {
                    if (typeof item.isInit === 'boolean' && item.isInit) {
                        init.push(`${item.id}();`);
                    }
                    else if (typeof item.isInit === 'string') {
                        init.push(`if (${(0, utils_1.parseProps)(item.isInit)}) { ${item.id}(); }`);
                    }
                    const parseDataSourceData = (0, utils_1.parseDataSource)(item);
                    methods.push(`const ${parseDataSourceData.functionName} = ()=> ${parseDataSourceData.functionBody}`);
                });
                if (json.dataSource.dataHandler) {
                    const { params, content } = (0, utils_1.parseFunction)(json.dataSource.dataHandler);
                    methods.push(`const dataHandler = (${params}) => {${content}}`);
                    init.push(`dataHandler()`);
                }
            }
            if (json.lifeCycles) {
                lifeCycles = (0, utils_1.parseLifeCycles)(json, init);
            }
            if (json.state) {
                let stateArr = Object.keys(json.state);
                for (let ste of stateArr) {
                    useState.push((0, utils_1.parseState)(ste, json.state[ste]));
                }
            }
        };
        // parse schema
        const transformHooks = (json) => {
            if (typeof json == 'string') {
                return json;
            }
            let result = '';
            const blockName = json.fileName || json.id;
            const type = json.componentName.toLowerCase();
            handleHooksData(json);
            const hooksView = generateRender(json, false);
            const hasDispatch = hooksView.match('dispatch');
            const classData = `
       export default memo((props) => {
         ${useState.join('\n')}
         ${hasDispatch
                ? 'const { state: { txt }, dispatch} = useContext(IndexContext);'
                : ''}
   
         ${methods.join('\n')}
         ${lifeCycles.join('\n')}
         ${hooksView.match(/^\{true\ \&\& /)
                ? `return (<View>${hooksView}</View>)`
                : `return (${hooksView})`}
         });
         `;
            classes.push(classData);
            return result;
        };
        const transformComponent = (json) => {
            if (typeof json == 'string') {
                return json;
            }
            let result = '';
            const type = json.componentName.toLowerCase();
            if (['page', 'block', 'component'].includes(type)) {
                // 容器组件处理: state/method/dataSource/lifeCycle/render
                const states = [];
                const lifeCycles = [];
                const methods = [];
                const init = [];
                let render = '';
                let classData = '';
                if (json.state) {
                    states.push(`this.state = ${(0, utils_1.toString)(json.state)};`);
                }
                if (json.methods) {
                    Object.keys(json.methods).forEach((name) => {
                        const { params, content } = (0, utils_1.parseFunction)(json.methods[name]);
                        methods.push(`${name}(${params}) {${content}}`);
                    });
                }
                if (json.dataSource && Array.isArray(json.dataSource.list)) {
                    json.dataSource.list.forEach((item) => {
                        if (typeof item.isInit === 'boolean' && item.isInit) {
                            init.push(`this.${item.id}();`);
                        }
                        else if (typeof item.isInit === 'string') {
                            init.push(`if (${(0, utils_1.parseProps)(item.isInit)}) { this.${item.id}(); }`);
                        }
                        const parseDataSourceData = (0, utils_1.parseDataSource)(item);
                        methods.push(`${parseDataSourceData.functionName}()${parseDataSourceData.functionBody}`);
                    });
                    if (json.dataSource.dataHandler) {
                        const { params, content } = (0, utils_1.parseFunction)(json.dataSource.dataHandler);
                        methods.push(`dataHandler(${params}) {${content}}`);
                        init.push(`this.dataHandler()`);
                    }
                }
                if (!json.lifeCycles) {
                    json.lifeCycles = {};
                }
                if (!json.lifeCycles['_constructor']) {
                    lifeCycles.push(`constructor(props, context) { super(); ${states.join('\n')} ${init.join('\n')}}`);
                }
                Object.keys(json.lifeCycles).forEach((name) => {
                    const { params, content } = (0, utils_1.parseFunction)(json.lifeCycles[name]);
                    if (name === '_constructor') {
                        lifeCycles.push(`constructor(${params}) { super(); ${content}   ${states.join('\n')}  ${init.join('\n')}}`);
                    }
                    else {
                        lifeCycles.push(`${name}(${params}) {${content}}`);
                    }
                });
                render = generateRender(json, false);
                classData = `
        export default class ${json.fileName} extends Component {
          ${lifeCycles.join('\n')}
          ${methods.join('\n')}
          render(){ 
            const state = this.state;
            return (${render});}
        
        }
        `;
                classes.push(classData);
            }
            else {
                result += generateRender(json);
            }
            return result;
        };
        const transform = dslConfig.useHooks ? transformHooks : transformComponent;
        // option.utils
        if (option.utils) {
            Object.keys(option.utils).forEach((name) => {
                utils.push(`const ${name} = ${option.utils[name]}`);
            });
        }
        // parse schema
        // start parse schema
        transform(schema);
        let indexValue = '';
        const imports = (0, utils_1.importString)(importsMap);
        if (dslConfig.useHooks) {
            // const hooksView = generateRender(schema);
            // const hasDispatch = hooksView.match('dispatch');
            indexValue = `
        'use strict';
        import { useState, useEffect, memo } from 'react';
  
        ${imports.join('\n')}
        ${importMods.join('\n')}
  
        ${importStyles.map((i) => i).join('\n')}
        ${utils.join('\n')}
  
        ${classes.join('\n')}
  
      `;
        }
        else {
            indexValue = `
      'use strict';
      import { Component} from 'react';
  
      ${imports.join('\n')}
      ${importMods.join('\n')}
      ${importStyles.map((i) => i).join('\n')}
  
      ${utils.join('\n')}
      ${classes.join('\n')}
    `;
        }
        const prefix = dslConfig.inlineStyle
            ? ''
            : schema.props && schema.props.className;
        // 获取当前 节点 所有 动画参数
        const animationKeyframes = (0, utils_1.addAnimation)(schema);
        const panelDisplay = [
            {
                panelName: `${filePathName}.${dslConfig.useTypescript ? 'tsx' : 'jsx'}`,
                panelValue: prettier.format(indexValue, consts_1.prettierJsOpt),
                panelType: dslConfig.useTypescript ? 'tsx' : 'jsx',
                folder: folderName,
                panelDependencies: dependenceList,
            },
        ];
        // 非内联模式 才引入 index.module.css
        if (dslConfig.inlineStyle !== consts_1.CSS_TYPE.INLINE_CSS) {
            let cssPanelValue = (0, utils_1.generateCSS)(schema.commonStyles, '');
            switch (dslConfig.cssType) {
                case 'less':
                    cssPanelValue = prettier.format(`${cssPanelValue}${(0, utils_1.generateScss)(schema)} ${animationKeyframes}`, consts_1.prettierLessOpt);
                    break;
                case 'scss':
                    cssPanelValue = prettier.format(`${cssPanelValue}${(0, utils_1.generateScss)(schema)} ${animationKeyframes}`, consts_1.prettierScssOpt);
                    break;
                default:
                    cssPanelValue = prettier.format(`${cssPanelValue}${(0, utils_1.generateCSS)(style, prefix)} ${animationKeyframes}`, consts_1.prettierCssOpt);
            }
            panelDisplay.push({
                panelName: cssFileName,
                panelValue: cssPanelValue,
                panelType: dslConfig.cssType || 'css',
                folder: folderName,
            });
        }
        // 只有一个模块时，生成到当前模块
        if (isExportGlobalFile && schema.css) {
            panelDisplay.push({
                panelName: `global.css`,
                panelValue: prettier.format(schema.css || '', consts_1.prettierCssOpt),
                panelType: 'css',
                folder: folderName,
            });
        }
        resolve(panelDisplay);
    });
}
exports.default = exportMod;
