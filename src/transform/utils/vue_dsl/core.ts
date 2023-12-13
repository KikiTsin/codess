import prettier from 'prettier';
import * as _ from 'lodash';
import {
  collectImports,
  importString,
  transComponentsMap,
  handleField,
  renderDefaultComps,
} from './utils';
import { IDependence } from './interface';
import { compExcludeClassnames } from './consts';
import insComponentsMap from './componentsMap' 
// box relative style
const boxStyleList = [
  'fontSize',
  'marginTop',
  'marginBottom',
  'paddingTop',
  'paddingBottom',
  'height',
  'top',
  'bottom',
  'width',
  'maxWidth',
  'left',
  'right',
  'paddingRight',
  'paddingLeft',
  'marginLeft',
  'marginRight',
  'lineHeight',
  'borderBottomRightRadius',
  'borderBottomLeftRadius',
  'borderTopRightRadius',
  'borderTopLeftRadius',
  'borderRadius',
];

// no unit style
const noUnitStyles = ['opacity', 'fontWeight'];

const lifeCycleMap = {
  _constructor: 'created',
  getDerivedStateFromProps: 'beforeUpdate',
  render: '',
  componentDidMount: 'mounted',
  componentDidUpdate: 'updated',
  componentWillUnmount: 'beforeDestroy',
};
const isExpression = (value: string) => {
  return /^\{\{.*\}\}$/.test(value);
};

const transformEventName = (name: string) => {
  return name.replace('on', '').toLowerCase();
};

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
      return value;
    });
  }

  return String(value);
};

interface optionData {
  toREM: Boolean;
  htmlFontsize: String | Number;
  viewportWidth: String;
  width: String;
  imgFileMap: Record<string, string>;
}

const parseStyle = (style: Record<string, any>, option = {}) => {
  const { toREM, htmlFontsize, viewportWidth, width, imgFileMap } =
    option as optionData;
  const styleData: string[] = [];
  for (const key in style) {
    let value = style[key];
    if (
      boxStyleList.indexOf(key) !== -1 &&
      (parseInt(value) === 0 || !!parseInt(value))
    ) {
      value = parseInt(value).toFixed(2);
      value = value === 0 ? value : value + 'px';
      styleData.push(`${_.kebabCase(key)}: ${value}`);
    } else if (noUnitStyles.indexOf(key) !== -1) {
      styleData.push(`${_.kebabCase(key)}: ${parseFloat(value)}`);
    } else {
      // 这里只针对background-image: url()做处理
      if (typeof value === 'string' && value.includes('.com')) {

        let value_arr = value.split(',');
        let img_arr: string[] = value_arr.reduce((arr: string[], item) => {
          let val = item.replace(/url\(|\)/gi, '');
          arr.push(`url("${imgFileMap[val.replace(/\"/g, '')]}")`);
          return arr;
        }, []);
        value = img_arr.join(',');
      }
      styleData.push(`${_.kebabCase(key)}: ${value}`);
    }
  }
  return styleData.join(';');
};

const parseFunction = (func: Function) => {
  const funcString: string = func.toString();
  const name = funcString
    .slice(funcString.indexOf('function'), funcString.indexOf('('))
    .replace('function ', '');
  const params = (funcString.match(/\([^\(\)]*\)/) || [''])[0].slice(1, -1);
  const content = funcString.slice(
    funcString.indexOf('{') + 1,
    funcString.lastIndexOf('}')
  );
  return {
    params,
    content,
    name,
  };
};

// parse layer props(static values or expression)
const parseProps = (vmData, value, isReactNode?, constantName?) => {
  const { expressionName, constants, methods } = vmData;
  if (typeof value === 'string') {
    if (isExpression(value)) {
      if (isReactNode) {
        return `{{${value.slice(7, -2)}}}`;
      }
      return value.slice(2, -2);
    }

    if (isReactNode) {
      return value;
    } else if (constantName) {
      // save to constant
      expressionName[constantName] = expressionName[constantName]
        ? expressionName[constantName] + 1
        : 1;
      const name = `${constantName}${expressionName[constantName]}`;
      constants[name] = value;
      return `"constants.${name}"`;
    }
    return `"${value}"`;
  } else if (typeof value === 'function') {
    const { params, content, name } = parseFunction(value);
    expressionName[name] = expressionName[name] ? expressionName[name] + 1 : 1;
    methods.push(`${name}_${expressionName[name]}(${params}) {${content}}`);
    return `${name}_${expressionName[name]}`;
  }
  return `"${value}"`;
};

const parsePropsKey = (key, value) => {
  if (typeof value === 'function') {
    return `@${transformEventName(key)}`;
  }
  return `:${key}`;
};

// parse condition: whether render the layer,条件解析
const parseCondition = (condition, render) => {
  let _condition = isExpression(condition) ? condition.slice(2, -2) : condition;
  if (typeof _condition === 'string') {
    _condition = _condition.replace('this.', '');
  }
  render = render.replace(
    /^<\w+\s/,
    `${render.match(/^<\w+\s/)[0]} v-if="${_condition}" `
  );
  return render;
};

// parse loop render
const parseLoop = (loop, loopArg, render, datas?) => {
  let data;
  const loopArgItem = (loopArg && loopArg[0]) || 'item';
  const loopArgIndex = (loopArg && loopArg[1]) || 'index';

  if (Array.isArray(loop)) {
    data = toString(loop);
    // datas.push(`${data}: ${toString(loop)}`);
  } else if (isExpression(loop)) {
    data = loop.slice(2, -2).replace('this.state.', '');
  }
  // add loop key
  const tagEnd = render.indexOf('>');
  const keyProp =
    render.slice(0, tagEnd).indexOf('key=') === -1
      ? `:key="${loopArgIndex}"`
      : '';
  render = `
      ${render.slice(0, tagEnd)}
      v-for="(${loopArgItem}, ${loopArgIndex}) in ${data}"  
      ${keyProp}
      ${render.slice(tagEnd)}`;

  // remove `this`
  const re = new RegExp(`this.${loopArgItem}`, 'g');
  render = render.replace(re, loopArgItem);

  return render;
};

export const transformSchema = (
  rawData,
  option
): Promise<Record<string, any>> => {
  return new Promise(async (resolve) => {
    const { transformedData: schema, imgFileMap } = rawData;
    const width = option.responsive.width || 375;
    const viewportWidth = option.responsive.viewportWidth || 375;
    const htmlFontsize = viewportWidth ? viewportWidth / 15 : null;

    const componentsMap = transComponentsMap(insComponentsMap);

    // template
    const template: string[] = [];

    // imports
    let imports: string[] = [];

    // Global Public Functions
    const utils: string[] = [];

    // data
    const datas: string[] = [];

    const constants = {};

    // methods
    const methods: string[] = [];

    const components = new Set();

    const expressionName = [];

    // lifeCycles
    const lifeCycles: string[] = [];

    // styles
    const styles: string[] = [];
    const importsMap = new Map();
    // imports
    const dependenceList: IDependence[] = [];

    // const styles4rem: string[] = [];
    const vmData = { expressionName, constants, methods };

    const getCompText = (data) => {
      let text = '';
      if ('children' in data) {
        data.children.forEach((da) => {
          if ('children' in da) {
            getCompText(da);
            return;
          }
          text = da.props.text;
        });
      }
      return text;
    };

    const findText = (schema) => {
      let text: string[] = [];
      function findTextNodes(nodes: Record<string, any>[]) {
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

    const handleCompData = (json, schema) => {
      // 处理 data / props /methods
      switch (json.name) {
        case 'Field':
          handleField(json, {
            text: findText(schema),
          });
      }
      let props = '';
      if (json.methods) {
        Object.keys(json.methods).forEach((name) => {
          const { params, content } = parseFunction(json.methods[name]);
          expressionName[name] = expressionName[name]
            ? expressionName[name] + 1
            : 1;
          methods.push(
            `${name.replace(/[\-\:]/gi, '_')}_${
              expressionName[name]
            }(${params}) {${content}}`
          );
          props += `@${name}='${name.replace(/[\-\:]/gi, '_')}_${
            expressionName[name]
          }' `;
        });
      }

      if (json.props) {
        Object.keys(json.props).forEach((item) => {
          if (item === 'value') {
            // "value": "val", ===> "value": { key: "val", value: '', },
            expressionName[item] = expressionName[item]
              ? expressionName[item] + 1
              : 1;
            const key =
              typeof json.props[item] === 'string'
                ? `${json.props[item]}${expressionName[item]}`
                : `${json.props[item].key}${expressionName[item]}`;
            const val =
              typeof json.props[item] === 'string'
                ? ''
                : json.props[item].value;
            props += `v-model='${key}' `;
            datas.push(`${key}: ${getDataSource(val)}`);
          } else {
            props += `:${item}='${getDataSource(json.props[item])}' `;
          }
        });
      }
      return props;
    };

    const getDataSource = (data) => {
      const flag = ['object', 'boolean'].includes(typeof data);
      let singleQuote = flag ? '' : '"';
      const val = flag ? JSON.stringify(data) : data;
      return `${singleQuote}${val}${singleQuote}`;
    };

    // generate render xml
    const generateRender = (schema) => {
      // const type = (schema.componentName || 'DIV').toLowerCase();
      let type = (schema.componentName || 'DIV').toLowerCase();
      let componentName = schema.componentName;
      let componentSubClass = [], compArr = [];
      if (schema.nodeLayerName && schema.nodeLayerName.includes('#component')) {
        const nodeLayerNameArr = schema.nodeLayerName.split(/\#|\:/);

        if (nodeLayerNameArr.length > 1) {
          componentName = nodeLayerNameArr[nodeLayerNameArr.length - 2];
          if (componentName.includes('/')) {
            compArr = componentName.split('/');
            componentSubClass = compArr.slice(1, compArr.length);
            componentName = componentName.split('/')[0];
          }
          // 当节点是block且标记了组件的时候，会导致重复渲染组件代码
          if (componentsMap[componentName] && !schema.isGenerated) {
            type = componentsMap[componentName].name;
            componentName = type;
          }
        }
      }

      const className = schema.props && schema.props.className;
      let classString = className ? ` class="${className}"` : '';

      if (className) {
        styles.push(`
            .${className} {
              ${parseStyle(schema.props.style, {
                htmlFontsize,
                viewportWidth,
                width,
                imgFileMap,
              })}
            }
          `);
      }

      let xml;
      let props = '';

      Object.keys(schema.props).forEach((key) => {
        if (
          ['className', 'style', 'text', 'src', 'lines'].indexOf(key) === -1
        ) {
          props += ` ${parsePropsKey(key, schema.props[key])}=${parseProps(
            vmData,
            schema.props[key]
          )}`;
        }
      });
      switch (type) {
        case 'text':
          // eslint-disable-next-line no-case-declarations
          const innerText = parseProps(vmData, schema.props.text, true);
          xml = `<span${classString}${props}>${innerText}</span> `;
          break;
        case 'image':
          // eslint-disable-next-line no-case-declarations
          const rawSource = parseProps(vmData, schema.props.src, false);
          // const urlInfo = new URL(_source);
          // const imgPath = urlInfo.pathname.replace('/static/', '')
          // eslint-disable-next-line no-case-declarations
          const localFile = `"${imgFileMap[rawSource.replace(/\"/g, '')]}"`;
          xml = `<img${classString}${props} src=${localFile} /> `;
          break;
        case 'div':
        case 'page':
        case 'block':
        case 'component':
          if (schema.children && schema.children.length) {
            // eslint-disable-next-line no-use-before-define
            xml = `<div${classString}${props}>${transform(
              schema.children
            )}</div>`;
          } else {
            xml = `<div${classString}${props} ></div>`;
          }
          break;
        default:
          if (schema.children && schema.children.length) {
            // eslint-disable-next-line no-use-before-define
            xml = `<div${classString}${props}>${transform(
              schema.children
            )}</div>`;
          } else {
            xml = `<div${classString}${props} ></div>`;
          }

          if (componentName) {
            let componentData: Record<string, any> = {
              ...(componentsMap[componentName] || {}),
            };;
            if (componentSubClass.length) {
              for (let classItem of componentSubClass) {
                if(componentData[classItem]) {
                  componentData.props = {
                    ...componentData.props,
                    ...componentData[classItem].props
                  }
                }
              }
            }
            // Button Button/primary
            componentName = componentName.split('/')[0];
            schema.isGenerated = true;
            collectImports({
              componentName,
              componentsMap,
              importsMap,
              dependenceList,
              components,
            });

            // 组件这里重置props，数据源从imgcook server改成componentsMap
            props = handleCompData(componentData, schema);

            if (compExcludeClassnames.includes(componentName)) {
              classString = '';
            }
            if (componentData.children && componentData.children.length) {
              xml = `<${componentName} ${classString} ${props}>${renderDefaultComps(
                {
                  children: componentData.children,
                  componentsMap,
                  importsMap,
                  dependenceList,
                  components,
                }
              )}</${componentName}>`;
            } else if (
              schema.children &&
              schema.children.length &&
              Array.isArray(schema.children)
            ) {
              xml = `<${componentName} ${classString} ${props}>${schema.children
                .map((node) => {
                  return generateRender(node);
                })
                .join('')}</${componentName}>`;
            } else if (typeof schema.children === 'string') {
              xml = `<${componentName} ${classString} ${props} >${schema.children}</${componentName}>`;
            } else {
              xml = `<${componentName} ${classString} ${props} />`;
            }
          } else {
            xml = '';
          }
      }

      if (schema.loop) {
        xml = parseLoop(schema.loop, schema.loopArgs, xml);
      }
      if (schema.condition) {
        xml = parseCondition(schema.condition, xml);
        // console.log(xml);
      }
      return xml || '';
    };

    // parse schema
    const transform = (schema) => {
      let result = '';

      if (Array.isArray(schema)) {
        schema.forEach((layer) => {
          result += transform(layer);
        });
      } else {
        if (!schema.componentName) {
          console.log(schema.id);
        }
        const type = (schema.componentName || 'DIV').toLowerCase();

        if (['page', 'block', 'component'].indexOf(type) !== -1) {
          // 容器组件处理: state/method/dataSource/lifeCycle/render
          const init = [];
          if (schema.state) {
            datas.push(`${toString(schema.state).slice(1, -1)}`);
          }

          // if (schema.dataSource && Array.isArray(schema.dataSource.list)) {
          //   schema.dataSource.list.forEach(item => {
          //     if (typeof item.isInit === 'boolean' && item.isInit) {
          //       init.push(`this.${item.id}();`);
          //     } else if (typeof item.isInit === 'string') {
          //       init.push(`if (${parseProps(item.isInit)}) { this.${item.id}(); }`);
          //     }
          //     methods.push(parseDataSource(item));
          //   });

          //   if (schema.dataSource.dataHandler) {
          //     const { params, content } = parseFunction(schema.dataSource.dataHandler);
          //     methods.push(`dataHandler(${params}) {${content}}`);
          //     init.push('this.dataHandler()');
          //   }
          // }

          if (schema.lifeCycles) {
            if (!schema.lifeCycles._constructor) {
              lifeCycles.push(
                `${lifeCycleMap._constructor}() { ${init.join('\n')}}`
              );
            }

            Object.keys(schema.lifeCycles).forEach((name) => {
              const vueLifeCircleName = lifeCycleMap[name] || name;
              const { content } = parseFunction(schema.lifeCycles[name]);

              if (name === '_constructor') {
                lifeCycles.push(
                  `${vueLifeCircleName}() {${content} ${init.join('\n')}}`
                );
              } else {
                lifeCycles.push(`${vueLifeCircleName}() {${content}}`);
              }
            });
          }
          template.push(generateRender(schema));
        } else {
          result += generateRender(schema);
        }
      }
      return result;
    };

    if (option.utils) {
      Object.keys(option.utils).forEach((name) => {
        utils.push(`const ${name} = ${option.utils[name]}`);
      });
    }

    transform(schema);
    datas.push(`constants: ${toString(constants)}`);
    const prettierOpt = {
      parser: 'vue',
      printWidth: 80,
      singleQuote: true,
    };
    imports = importString(importsMap);
    if (template.length > 0 && template[0].includes('pages')) {
      template.pop();
    }

    const finalData = {
      panelDisplay: [
        {
          panelName: 'index.css',
          panelValue: prettier.format(`${styles.join('\n')}`, {
            parser: 'css',
          }),
          panelType: 'css',
        },
        // {
        //   panelName: 'index.rem.css',
        //   panelValue: prettier.format(styles4rem.join('\n'), {
        //     parser: 'css',
        //   }),
        //   panelType: 'css',
        // },
        {
          panelName: 'index.vue',
          panelValue: prettier.format(
            `
            <template>
              <div class="page">
                ${template.join('\n')}
              </div>
            </template>
            <script>
              ${imports.join('\n')}
              export default {
                data() {
                  return {
                    ${datas.join(',\n')}
                  } 
                },
                ${
                  components.size > 0
                    ? `components: { ${[...components].join(',\n')} },`
                    : ''
                }
                methods: {
                  ${methods.join(',\n')}
                },
                ${lifeCycles.join(',\n')}
              }
            </script>
            <style src="./index.css" />
          `,
            prettierOpt
          ),
          panelType: 'vue',
        },
      ],
      renderData: {
        template,
        imports,
        datas,
        methods,
        lifeCycles,
        styles,
      },
    };
    resolve(finalData);
  });
};
