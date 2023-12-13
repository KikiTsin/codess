"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socks5Http = void 0;
// const options = {
//   cookie: cookieStr,
//   data: postData,
//   socks5: '127.0.0.1:8080',
//   url: 'https://www.imgcook.com/api/v2/gen-layout-process',
//   responseType: 'json',
//   method: "POST",
// }
const node_child_process_1 = require("node:child_process");
const getCurlStr = (options) => {
    const { cookie, data, socks5, url, method = 'GET', timeout = 60000, } = options;
    let curlStr = `curl --connect-timeout ${timeout / 1000}`;
    if (cookie) {
        curlStr += ` -b '${cookie}'`;
    }
    if (data) {
        curlStr += ` -d '${JSON.stringify(data)}' -H 'Content-Type: application/json'`;
    }
    if (socks5) {
        curlStr += ` --socks4a ${socks5}`;
    }
    curlStr += ` -X ${method} ${url}`;
    return curlStr;
};
const socks5Http = (options = {}) => {
    const curlStr = getCurlStr(options);
    return new Promise((resolve, reject) => {
        (0, node_child_process_1.exec)(curlStr, (error, stdout, stderr) => {
            if (error) {
                reject(new Error(`执行的错误: ${error}`));
                return;
            }
            let errorMessage = stderr;
            if (!stdout) {
                errorMessage = error || errorMessage;
                reject(new Error(errorMessage));
            }
            else {
                try {
                    const data = JSON.parse(stdout);
                    console.log(data);
                    resolve(data);
                }
                catch (error) {
                    reject(new Error(`解析错误: ${stdout}`));
                }
            }
        });
    });
};
exports.socks5Http = socks5Http;
