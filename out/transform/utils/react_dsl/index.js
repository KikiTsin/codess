"use strict";var e=this&&this.__createBinding||(Object.create?function(e,t,r,i){void 0===i&&(i=r);var a=Object.getOwnPropertyDescriptor(t,r);a&&!("get"in a?!t.__esModule:a.writable||a.configurable)||(a={enumerable:!0,get:function(){return t[r]}}),Object.defineProperty(e,i,a)}:function(e,t,r,i){void 0===i&&(i=r),e[i]=t[r]}),t=this&&this.__setModuleDefault||(Object.create?function(e,t){Object.defineProperty(e,"default",{enumerable:!0,value:t})}:function(e,t){e.default=t}),r=this&&this.__importStar||function(r){if(r&&r.__esModule)return r;var i={};if(null!=r)for(var a in r)"default"!==a&&Object.prototype.hasOwnProperty.call(r,a)&&e(i,r,a);return t(i,r),i},i=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(exports,"__esModule",{value:!0}),exports.transformSchemaReact=void 0;const a=r(require("lodash")),n=i(require("./entry")),o=i(require("prettier")),s=i(require("prettier/parser-babel")),u=i(require("prettier/parser-html")),l=i(require("prettier/parser-postcss")),c=i(require("prettier/parser-markdown")),f=i(require("./componentsMap")),d={babel:s.default,json:s.default,vue:u.default,css:l.default,scss:l.default,less:l.default,html:u.default,md:c.default};async function p(e,t){const{transformedData:r,imgFileMap:i,useTailwind:s}=e,u=a.get(r,"imgcook.dslConfig",{});a.set(r,"imgcook.dslConfig",Object.assign(u,t));const l={prettier:{format:(e,t)=>{if(!t||!d[t.parser])return e;t.plugins=[d[t.parser]];try{return o.default.format(e,t)}catch(t){return console.error("format error",t),e}}},responsive:{width:750,viewportWidth:375},componentsMap:f.default,imgFileMap:i,useTailwind:s};return(await(0,n.default)(r,l)).panelDisplay}exports.transformSchemaReact=p;