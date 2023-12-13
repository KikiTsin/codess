"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getImgFileMap = void 0;
function getImgFileMap(_data) {
    const map = {};
    let num = 0;
    function getImgFile(data) {
        for (const key in data) {
            if (key === 'props' && data[key].attrs && data[key].attrs.source) {
                map[data[key].attrs.source] = `./image/img${num}.png`;
                num++;
            }
            if (key === 'children' && data[key].length > 0) {
                for (const child of data[key]) {
                    getImgFile(child);
                }
            }
        }
    }
    getImgFile(_data);
    return map;
}
exports.getImgFileMap = getImgFileMap;
