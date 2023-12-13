import Cookie from './utils/cookie';
import { buildCode } from './utils/dsl';
import { socks5Http } from './utils/socks5Http';
import { join } from 'node:path';
import { createWriteStream } from 'node:fs';
import axios from 'axios';
import { pathConfig } from './enum';
import { getImgFileMap } from './utils';

// import  from 'axios-socks5-agent';
const socksAgent = require('axios-socks5-agent');
const fs = require('fs-extra');

import { responseFace } from './interface';
const socks5Options = {
  host: '29.2.70.186', //
  port: 1080,
};
const { httpAgent, httpsAgent } = new socksAgent({
  agentOptions: { keepAlive: true },
  ...socks5Options,
});
const env = 'dev';

// const sockProxy = env === 'dev' ? {} : { httpAgent, httpsAgent };
const sockProxy = { httpAgent, httpsAgent };

const imgCookConfig = {
  htmlUrl: 'https://www.imgcook.com/editor#/',
  getCodeUrl: 'https://www.imgcook.com/api/v2/gen-layout-process',
};

let cookie = new Cookie();
let _csrfToken = '';
export const getImgCookToken = async () => {
  return axios
    .get(imgCookConfig.htmlUrl, {
      ...(env === 'dev' ? {} : sockProxy),
      responseType: 'text',
      timeout: 30000,
    })
    .then(({ data, headers }) => {
      cookie.parserList(headers['set-cookie']);
      try {
        const csrfToken = data
          .match(/<meta[^>]+/g)
          .find((str: string) => {
            return str.match('csrf-token');
          })
          .match(/content="([^"]+)"/)[1];
        if (csrfToken) {
          _csrfToken = csrfToken;
        }
      } catch (error) {
        throw new Error('获取html_token失败');
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

export const getToken = async () => {
  let ctoken;
  ctoken = cookie.getOne('ctoken');
  if (ctoken && _csrfToken) {
    return _csrfToken;
  }
  await getImgCookToken();
  ctoken = cookie.getOne('ctoken');
  if (ctoken && _csrfToken) {
    return _csrfToken;
  }
  throw new Error('获取page_token失败');
};
export const getImgCookCode = async (designJson: Record<string, any>) => {
  if (_csrfToken === undefined || cookie === undefined) {
    cookie = new Cookie();
    _csrfToken = '';
  }
  const ctoken = await getToken();
  console.log('获取ctoken成功:', ctoken);
  const postData = {
    ctoken,
    original_pic: designJson.artboardImg || '', // 'https://img.alicdn.com/tfs/TB1F1jLvYj1gK0jSZFOXXc7GpXa-800-800.png',
    data: designJson,
    options: {
      useThreshold: true,
      combineCols: true,
      composeText: true,
      adaptSpace: true,
      composeRepeat: true,
      dirtyFilter: true,
      checkUseless: true,
      checkShape: true,
    },
    levelProcess: 1,
    teamConfig: {},
    moduleInfo: {},
  };
  const cookieStr = cookie.getAll();
  const _cookie = cookieStr.replace(/;\s/, ';').replace(/;$/, '');
  console.log('cookie', cookie);
  return new Promise((resolve, reject) => {
    socks5Http({
      method: 'POST',
      data: postData,
      cookie: _cookie,
      timeout: 60000,
      socks5:
        env === 'dev' ? '' : `${socks5Options.host}:${socks5Options.port}`,
      url: imgCookConfig.getCodeUrl,
    }).then((res: responseFace) => {
      const { data, success, status, errorMsg } = res;
      if (success === 'true' && status && data) {
        return resolve(data);
      }
      reject(new Error(errorMsg || '解析错误，请检查格式'));
    });
  });
};

interface TransformCodeToFileFace {
  lang?: string;
  dir?: string;
  data: Record<string, any>;
  useTailwind?: number;
}
export const transformCodeToFile = async (query: TransformCodeToFileFace) => {
  return new Promise(async (resolve, reject) => {
    const {
      lang = 'vue', // dsl目标语言
      dir = '', // 写入的文件目录
      data, // 设计稿数据
      useTailwind = 0, // 是否使用tailwindcss
    } = query;
    const root = pathConfig.root;

    const outputPath = join(root, dir, 'dist');

    const rawData = data;

    let imgFileMap = {};
    fs.removeSync(outputPath);

    fs.ensureDirSync(`${outputPath}/image`);
    try {
      imgFileMap = getImgFileMap(rawData);
      await writeImgLocal(imgFileMap, outputPath); // 图片写入本地
    } catch(err) {
      imgFileMap = {};
      console.error('下载图片失败');
    }
    const schema = await getImgCookCode(rawData).catch(() => {
      return '{}';
    });
    // const transformedPath = join(pathConfig.root, '/transformedJson.json');
    // fs.outputJSONSync(transformedPath, JSON.parse(schema as string));
    await buildCode({
      transformedData: JSON.parse(schema as string),
      outputPath,
      imgFileMap,
      lang,
      useTailwind: !!Number(useTailwind),
    }).catch(() => {
      return {};
    });
    resolve({
      code: 0,
      data: {
        message: 'success',
      },
    });
  });
};

interface ImgQuery {
  url: string;
  imgPath: string;
}
export const getImgSource = (query: ImgQuery) => {
  const { url, imgPath } = query;
  return new Promise((resolve, reject) => {
    axios
      .get(url, {
        responseType: 'stream',
        timeout: 300000,
      })
      .then(({ data, headers }) => {
        console.log(data);
        console.log(headers);
        const ws = createWriteStream(imgPath);
        data.pipe(ws);
        resolve(true);
      })
      .catch(() => {
        reject();
      });
  });
};

export const writeImgLocal = (
  imgFileMap: Record<string, string>,
  path: string
) => {
  // imgFileMap --> { "https://static.imgcook.com/img/test/25e27d60f62011ed9b85bdf9fcbb52ca.png":"./image/img20.png" }
  let promiseArr: Promise<unknown>[] = [];
  for (const key in imgFileMap) {
    promiseArr.push(
      getImgSource({
        url: key,
        imgPath: imgFileMap[key].replace('.', path),
      })
    );
  }
  return new Promise((resolve, reject) => {
    Promise.all(promiseArr).then(() => {
      resolve(true);
    })
    .catch(() => {
      reject();
    });
  });
};
