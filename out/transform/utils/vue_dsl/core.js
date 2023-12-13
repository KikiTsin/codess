"use strict";var e=this&&this.__createBinding||(Object.create?function(e,t,n,o){void 0===o&&(o=n);var r=Object.getOwnPropertyDescriptor(t,n);r&&!("get"in r?!t.__esModule:r.writable||r.configurable)||(r={enumerable:!0,get:function(){return t[n]}}),Object.defineProperty(e,o,r)}:function(e,t,n,o){void 0===o&&(o=n),e[o]=t[n]}),t=this&&this.__setModuleDefault||(Object.create?function(e,t){Object.defineProperty(e,"default",{enumerable:!0,value:t})}:function(e,t){e.default=t}),n=this&&this.__importStar||function(n){if(n&&n.__esModule)return n;var o={};if(null!=n)for(var r in n)"default"!==r&&Object.prototype.hasOwnProperty.call(n,r)&&e(o,n,r);return t(o,n),o},o=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(exports,"__esModule",{value:!0}),exports.transformSchema=void 0;const r=o(require("prettier")),s=n(require("lodash")),i=require("./utils"),a=require("./consts"),p=o(require("./componentsMap")),c=["fontSize","marginTop","marginBottom","paddingTop","paddingBottom","height","top","bottom","width","maxWidth","left","right","paddingRight","paddingLeft","marginLeft","marginRight","lineHeight","borderBottomRightRadius","borderBottomLeftRadius","borderTopRightRadius","borderTopLeftRadius","borderRadius"],l=["opacity","fontWeight"],d={_constructor:"created",getDerivedStateFromProps:"beforeUpdate",render:"",componentDidMount:"mounted",componentDidUpdate:"updated",componentWillUnmount:"beforeDestroy"},u=e=>/^\{\{.*\}\}$/.test(e),$=e=>e.replace("on","").toLowerCase(),f=e=>"[object Function]"==={}.toString.call(e)?e.toString():"string"==typeof e?e:"object"==typeof e?JSON.stringify(e,((e,t)=>"function"==typeof t?t.toString():t)):String(e),h=(e,t={})=>{const{toREM:n,htmlFontsize:o,viewportWidth:r,width:i,imgFileMap:a}=t,p=[];for(const t in e){let n=e[t];if(-1===c.indexOf(t)||0!==parseInt(n)&&!parseInt(n))if(-1!==l.indexOf(t))p.push(`${s.kebabCase(t)}: ${parseFloat(n)}`);else{if("string"==typeof n&&n.includes(".com")){let e=n.split(",");n=e.reduce(((e,t)=>{let n=t.replace(/url\(|\)/gi,"");return e.push(`url("${a[n.replace(/\"/g,"")]}")`),e}),[]).join(",")}p.push(`${s.kebabCase(t)}: ${n}`)}else n=parseInt(n).toFixed(2),n=0===n?n:n+"px",p.push(`${s.kebabCase(t)}: ${n}`)}return p.join(";")},m=e=>{const t=e.toString(),n=t.slice(t.indexOf("function"),t.indexOf("(")).replace("function ","");return{params:(t.match(/\([^\(\)]*\)/)||[""])[0].slice(1,-1),content:t.slice(t.indexOf("{")+1,t.lastIndexOf("}")),name:n}},g=(e,t,n,o)=>{const{expressionName:r,constants:s,methods:i}=e;if("string"==typeof t){if(u(t))return n?`{{${t.slice(7,-2)}}}`:t.slice(2,-2);if(n)return t;if(o){r[o]=r[o]?r[o]+1:1;const e=`${o}${r[o]}`;return s[e]=t,`"constants.${e}"`}return`"${t}"`}if("function"==typeof t){const{params:e,content:n,name:o}=m(t);return r[o]=r[o]?r[o]+1:1,i.push(`${o}_${r[o]}(${e}) {${n}}`),`${o}_${r[o]}`}return`"${t}"`},y=(e,t)=>{return"function"==typeof t?`@${n=e,n.replace("on","").toLowerCase()}`:`:${e}`;var n},b=(e,t)=>{let n=u(e)?e.slice(2,-2):e;return"string"==typeof n&&(n=n.replace("this.","")),t=t.replace(/^<\w+\s/,`${t.match(/^<\w+\s/)[0]} v-if="${n}" `)},v=(e,t,n,o)=>{let r;const s=t&&t[0]||"item",i=t&&t[1]||"index";Array.isArray(e)?r=f(e):u(e)&&(r=e.slice(2,-2).replace("this.state.",""));const a=n.indexOf(">"),p=-1===n.slice(0,a).indexOf("key=")?`:key="${i}"`:"";n=`\n      ${n.slice(0,a)}\n      v-for="(${s}, ${i}) in ${r}"  \n      ${p}\n      ${n.slice(a)}`;const c=new RegExp(`this.${s}`,"g");return n=n.replace(c,s)},x=(e,t)=>new Promise((async n=>{const{transformedData:o,imgFileMap:s}=e,c=t.responsive.width||375,l=t.responsive.viewportWidth||375,u=l?l/15:null,$=(0,i.transComponentsMap)(p.default),x=[];let j=[];const O=[],_=[],w={},M=[],N=new Set,k=[],C=[],S=[],D=new Map,L=[],F={expressionName:k,constants:w,methods:M},R=e=>{let t=[];return function e(n){for(let o of n)"Text"===o.componentName&&t.push(o.props.text||""),Array.isArray(o.children)&&o.children.length>0&&e(o.children)}(e.children),t.splice(0,2)},A=e=>{const t=["object","boolean"].includes(typeof e);let n=t?"":'"';return`${n}${t?JSON.stringify(e):e}${n}`},E=e=>{let t=(e.componentName||"DIV").toLowerCase(),n=e.componentName,o=[],r=[];if(e.nodeLayerName&&e.nodeLayerName.includes("#component")){const s=e.nodeLayerName.split(/\#|\:/);s.length>1&&(n=s[s.length-2],n.includes("/")&&(r=n.split("/"),o=r.slice(1,r.length),n=n.split("/")[0]),$[n]&&!e.isGenerated&&(t=$[n].name,n=t))}const p=e.props&&e.props.className;let d,f=p?` class="${p}"`:"";p&&S.push(`\n            .${p} {\n              ${h(e.props.style,{htmlFontsize:u,viewportWidth:l,width:c,imgFileMap:s})}\n            }\n          `);let x="";switch(Object.keys(e.props).forEach((t=>{-1===["className","style","text","src","lines"].indexOf(t)&&(x+=` ${y(t,e.props[t])}=${g(F,e.props[t])}`)})),t){case"text":const t=g(F,e.props.text,!0);d=`<span${f}${x}>${t}</span> `;break;case"image":const r=g(F,e.props.src,!1),p=`"${s[r.replace(/\"/g,"")]}"`;d=`<img${f}${x} src=${p} /> `;break;case"div":case"page":case"block":case"component":d=e.children&&e.children.length?`<div${f}${x}>${I(e.children)}</div>`:`<div${f}${x} ></div>`;break;default:if(d=e.children&&e.children.length?`<div${f}${x}>${I(e.children)}</div>`:`<div${f}${x} ></div>`,n){let t={...$[n]||{}};if(o.length)for(let e of o)t[e]&&(t.props={...t.props,...t[e].props});n=n.split("/")[0],e.isGenerated=!0,(0,i.collectImports)({componentName:n,componentsMap:$,importsMap:D,dependenceList:L,components:N}),x=((e,t)=>{"Field"===e.name&&(0,i.handleField)(e,{text:R(t)});let n="";return e.methods&&Object.keys(e.methods).forEach((t=>{const{params:o,content:r}=m(e.methods[t]);k[t]=k[t]?k[t]+1:1,M.push(`${t.replace(/[\-\:]/gi,"_")}_${k[t]}(${o}) {${r}}`),n+=`@${t}='${t.replace(/[\-\:]/gi,"_")}_${k[t]}' `})),e.props&&Object.keys(e.props).forEach((t=>{if("value"===t){k[t]=k[t]?k[t]+1:1;const o="string"==typeof e.props[t]?`${e.props[t]}${k[t]}`:`${e.props[t].key}${k[t]}`,r="string"==typeof e.props[t]?"":e.props[t].value;n+=`v-model='${o}' `,_.push(`${o}: ${A(r)}`)}else n+=`:${t}='${A(e.props[t])}' `})),n})(t,e),a.compExcludeClassnames.includes(n)&&(f=""),d=t.children&&t.children.length?`<${n} ${f} ${x}>${(0,i.renderDefaultComps)({children:t.children,componentsMap:$,importsMap:D,dependenceList:L,components:N})}</${n}>`:e.children&&e.children.length&&Array.isArray(e.children)?`<${n} ${f} ${x}>${e.children.map((e=>E(e))).join("")}</${n}>`:"string"==typeof e.children?`<${n} ${f} ${x} >${e.children}</${n}>`:`<${n} ${f} ${x} />`}else d=""}return e.loop&&(d=v(e.loop,e.loopArgs,d)),e.condition&&(d=b(e.condition,d)),d||""},I=e=>{let t="";if(Array.isArray(e))e.forEach((e=>{t+=I(e)}));else{e.componentName||console.log(e.id);const n=(e.componentName||"DIV").toLowerCase();if(-1!==["page","block","component"].indexOf(n)){const t=[];e.state&&_.push(`${f(e.state).slice(1,-1)}`),e.lifeCycles&&(e.lifeCycles._constructor||C.push(`${d._constructor}() { ${t.join("\n")}}`),Object.keys(e.lifeCycles).forEach((n=>{const o=d[n]||n,{content:r}=m(e.lifeCycles[n]);"_constructor"===n?C.push(`${o}() {${r} ${t.join("\n")}}`):C.push(`${o}() {${r}}`)}))),x.push(E(e))}else t+=E(e)}return t};t.utils&&Object.keys(t.utils).forEach((e=>{O.push(`const ${e} = ${t.utils[e]}`)})),I(o),_.push(`constants: ${f(w)}`);j=(0,i.importString)(D),x.length>0&&x[0].includes("pages")&&x.pop();n({panelDisplay:[{panelName:"index.css",panelValue:r.default.format(`${S.join("\n")}`,{parser:"css"}),panelType:"css"},{panelName:"index.vue",panelValue:r.default.format(`\n            <template>\n              <div class="page">\n                ${x.join("\n")}\n              </div>\n            </template>\n            <script>\n              ${j.join("\n")}\n              export default {\n                data() {\n                  return {\n                    ${_.join(",\n")}\n                  } \n                },\n                ${N.size>0?`components: { ${[...N].join(",\n")} },`:""}\n                methods: {\n                  ${M.join(",\n")}\n                },\n                ${C.join(",\n")}\n              }\n            <\/script>\n            <style src="./index.css" />\n          `,{parser:"vue",printWidth:80,singleQuote:!0}),panelType:"vue"}],renderData:{template:x,imports:j,datas:_,methods:M,lifeCycles:C,styles:S}})}));exports.transformSchema=x;