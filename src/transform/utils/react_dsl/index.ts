import * as _ from 'lodash';
import entry from './entry';
import prettier from 'prettier';
import parserBabel from 'prettier/parser-babel';
import parserHtml from 'prettier/parser-html';
import parserCss from 'prettier/parser-postcss';
import parserMarkDown from 'prettier/parser-markdown';
import componentsMap from './componentsMap';

const browerParser = {
  babel: parserBabel,
  json: parserBabel,
  vue: parserHtml,
  css: parserCss,
  scss: parserCss,
  less: parserCss,
  html: parserHtml,
  md: parserMarkDown,
};

export async function transformSchemaReact(options, dslConfig) {
  const { transformedData: schema, imgFileMap, useTailwind } = options;
  const config = _.get(schema, 'imgcook.dslConfig', {});
  _.set(schema, 'imgcook.dslConfig', Object.assign(config, dslConfig));

  const prettier_options = {
    prettier: {
      format: (str, opt) => {
        if (opt && browerParser[opt.parser]) {
          opt.plugins = [browerParser[opt.parser]];
        } else {
          return str;
        }
        try {
          return prettier.format(str, opt);
        } catch (e) {
          console.error('format error', e);
          return str;
        }
      },
    },
    responsive: {
      width: 750,
      viewportWidth: 375,
    },
    componentsMap,
    imgFileMap,
    useTailwind,
  };

  // const files = vm.run(code)(data,options);

  const files = await entry(schema, prettier_options);
  return files.panelDisplay;
}
