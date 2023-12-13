"use strict";var e=this&&this.__createBinding||(Object.create?function(e,t,n,i){void 0===i&&(i=n);var r=Object.getOwnPropertyDescriptor(t,n);r&&!("get"in r?!t.__esModule:r.writable||r.configurable)||(r={enumerable:!0,get:function(){return t[n]}}),Object.defineProperty(e,i,r)}:function(e,t,n,i){void 0===i&&(i=n),e[i]=t[n]}),t=this&&this.__setModuleDefault||(Object.create?function(e,t){Object.defineProperty(e,"default",{enumerable:!0,value:t})}:function(e,t){e.default=t}),n=this&&this.__importStar||function(n){if(n&&n.__esModule)return n;var i={};if(null!=n)for(var r in n)"default"!==r&&Object.prototype.hasOwnProperty.call(n,r)&&e(i,n,r);return t(i,n),i};Object.defineProperty(exports,"__esModule",{value:!0}),exports.deactivate=exports.startTransform=exports.createPanel=exports.activate=void 0;const i=n(require("vscode")),r=require("./utils/index"),o=require("./transform/index");function s(e){const t=i.commands.registerCommand("d2c.transform",(()=>{c(e)}));e.subscriptions.push(t)}function a(e,t){const n=i.Uri.joinPath(t.extensionUri,"assets","index.js"),o=e.asWebviewUri(n),s=i.Uri.joinPath(t.extensionUri,"assets","index.css");return`<!DOCTYPE html>\n    <html lang="en">\n    <head>\n      <meta charset="UTF-8">\n\n      \x3c!--\n        <meta http-equiv="Content-Security-Policy" content="default-src 'none';">\n        Use a content security policy to only allow loading images from https or from our extension directory,\n        and only allow scripts that have a specific nonce.\n      --\x3e\n      <meta http-equiv="Content-Security-Policy">\n      <meta name="viewport" content="width=device-width, initial-scale=1.0">\n      <link href="${e.asWebviewUri(s)}" rel="stylesheet">\n      <title>d2c operating panel</title>\n    </head>\n    <body>\n      <div id="app"></div>\n      <script>window.vscode_plugin_version = '1.0.0'<\/script>\n      <script nonce="${(0,r.getNonce)()}" src="${o}"><\/script>\n    </body>\n    </html>`}function c(e){const t=i.window.createWebviewPanel("d2cPanel","codess",i.ViewColumn.Two,(0,r.getWebviewOptions)(e.extensionUri));t.webview.html=a(t.webview,e),t.webview.onDidReceiveMessage((e=>{switch(e.command){case"d2c_transform":return void d(JSON.parse(e.text),t);case"open_browser":i.env.openExternal(i.Uri.parse("https://github.com/KikiTsin/codess"))}}),void 0,e.subscriptions)}async function d(e,t){try{await(0,o.transformCodeToFile)(e).catch((()=>({code:-1,data:{}}))),t.webview.postMessage({command:"transform_end"})}catch(e){console.error(e)}}function l(){}exports.activate=s,exports.createPanel=c,exports.startTransform=d,exports.deactivate=l;