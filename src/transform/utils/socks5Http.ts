// const options = {
//   cookie: cookieStr,
//   data: postData,
//   socks5: '127.0.0.1:8080',
//   url: 'https://www.imgcook.com/api/v2/gen-layout-process',
//   responseType: 'json',
//   method: "POST",
// }
import { exec } from 'node:child_process';
import { responseFace } from '../interface';

const getCurlStr = (options: HttpOptions) => {
  const {
    cookie,
    data,
    socks5,
    url,
    method = 'GET',
    timeout = 60000,
  } = options;
  let curlStr = `curl --connect-timeout ${timeout / 1000}`;
  if (cookie) {
    curlStr += ` -b '${cookie}'`;
  }
  if (data) {
    curlStr += ` -d '${JSON.stringify(
      data
    )}' -H 'Content-Type: application/json'`;
  }
  if (socks5) {
    curlStr += ` --socks4a ${socks5}`;
  }
  curlStr += ` -X ${method} ${url}`;
  return curlStr;
};

interface HttpOptions {
  responseType?: string;
  method?: string;
  data?: Object;
  cookie?: string;
  timeout?: number;
  socks5?: string;
  url?: string;
}

export const socks5Http = (
  options: HttpOptions = {}
): Promise<responseFace> => {
  const curlStr = getCurlStr(options);
  return new Promise((resolve, reject) => {
    exec(curlStr, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`执行的错误: ${error}`));
        return;
      }
      let errorMessage = stderr;
      if (!stdout) {
        errorMessage = error || errorMessage;
        reject(new Error(errorMessage));
      } else {
        try {
          const data = JSON.parse(stdout);
          console.log(data);
          resolve(data);
        } catch (error) {
          reject(new Error(`解析错误: ${stdout}`));
        }
      }
    });
  });
};
