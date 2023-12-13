"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeImgLocal = exports.getImgSource = exports.transformCodeToFile = exports.getImgCookCode = exports.getToken = exports.getImgCookToken = void 0;
const cookie_1 = __importDefault(require("./utils/cookie"));
const dsl_1 = require("./utils/dsl");
const socks5Http_1 = require("./utils/socks5Http");
const node_path_1 = require("node:path");
const node_fs_1 = require("node:fs");
const axios_1 = __importDefault(require("axios"));
const enum_1 = require("./enum");
const utils_1 = require("./utils");
// import  from 'axios-socks5-agent';
const socksAgent = require('axios-socks5-agent');
const fs = require('fs-extra');
const socks5Options = {
    host: '29.2.70.186',
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
let cookie = new cookie_1.default();
let _csrfToken = '';
const getImgCookToken = async () => {
    return axios_1.default
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
                .find((str) => {
                return str.match('csrf-token');
            })
                .match(/content="([^"]+)"/)[1];
            if (csrfToken) {
                _csrfToken = csrfToken;
            }
        }
        catch (error) {
            throw new Error('获取html_token失败');
        }
    })
        .catch((err) => {
        console.log(err);
    });
};
exports.getImgCookToken = getImgCookToken;
const getToken = async () => {
    let ctoken;
    ctoken = cookie.getOne('ctoken');
    if (ctoken && _csrfToken) {
        return _csrfToken;
    }
    await (0, exports.getImgCookToken)();
    ctoken = cookie.getOne('ctoken');
    if (ctoken && _csrfToken) {
        return _csrfToken;
    }
    throw new Error('获取page_token失败');
};
exports.getToken = getToken;
const getImgCookCode = async (designJson) => {
    if (_csrfToken === undefined || cookie === undefined) {
        cookie = new cookie_1.default();
        _csrfToken = '';
    }
    const ctoken = await (0, exports.getToken)();
    console.log('获取ctoken成功:', ctoken);
    const postData = {
        ctoken,
        original_pic: designJson.artboardImg || '',
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
        (0, socks5Http_1.socks5Http)({
            method: 'POST',
            data: postData,
            cookie: _cookie,
            timeout: 60000,
            socks5: env === 'dev' ? '' : `${socks5Options.host}:${socks5Options.port}`,
            url: imgCookConfig.getCodeUrl,
        }).then((res) => {
            const { data, success, status, errorMsg } = res;
            if (success === 'true' && status && data) {
                return resolve(data);
            }
            reject(new Error(errorMsg || '解析错误，请检查格式'));
        });
    });
};
exports.getImgCookCode = getImgCookCode;
const transformCodeToFile = async (query) => {
    return new Promise(async (resolve, reject) => {
        const { lang = 'vue', // dsl目标语言
        dir = '', // 写入的文件目录
        data, // 设计稿数据
        useTailwind = 0, // 是否使用tailwindcss
         } = query;
        const root = enum_1.pathConfig.root;
        const outputPath = (0, node_path_1.join)(root, dir, 'dist');
        const rawData = data;
        let imgFileMap = {};
        fs.removeSync(outputPath);
        fs.ensureDirSync(`${outputPath}/image`);
        try {
            imgFileMap = (0, utils_1.getImgFileMap)(rawData);
            await (0, exports.writeImgLocal)(imgFileMap, outputPath); // 图片写入本地
        }
        catch (err) {
            imgFileMap = {};
            console.error('下载图片失败');
        }
        const schema = await (0, exports.getImgCookCode)(rawData).catch(() => {
            return '{}';
        });
        // const transformedPath = join(pathConfig.root, '/transformedJson.json');
        // fs.outputJSONSync(transformedPath, JSON.parse(schema as string));
        await (0, dsl_1.buildCode)({
            transformedData: JSON.parse(schema),
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
exports.transformCodeToFile = transformCodeToFile;
const getImgSource = (query) => {
    const { url, imgPath } = query;
    return new Promise((resolve, reject) => {
        axios_1.default
            .get(url, {
            responseType: 'stream',
            timeout: 300000,
        })
            .then(({ data, headers }) => {
            console.log(data);
            console.log(headers);
            const ws = (0, node_fs_1.createWriteStream)(imgPath);
            data.pipe(ws);
            resolve(true);
        })
            .catch(() => {
            reject();
        });
    });
};
exports.getImgSource = getImgSource;
const writeImgLocal = (imgFileMap, path) => {
    // imgFileMap --> { "https://static.imgcook.com/img/test/25e27d60f62011ed9b85bdf9fcbb52ca.png":"./image/img20.png" }
    let promiseArr = [];
    for (const key in imgFileMap) {
        promiseArr.push((0, exports.getImgSource)({
            url: key,
            imgPath: imgFileMap[key].replace('.', path),
        }));
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
exports.writeImgLocal = writeImgLocal;
