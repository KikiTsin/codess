"use strict";function t(t){const e={};let o=0;return function t(r){for(const s in r)if("props"===s&&r[s].attrs&&r[s].attrs.source&&(e[r[s].attrs.source]=`./image/img${o}.png`,o++),"children"===s&&r[s].length>0)for(const e of r[s])t(e)}(t),e}Object.defineProperty(exports,"__esModule",{value:!0}),exports.getImgFileMap=void 0,exports.getImgFileMap=t;