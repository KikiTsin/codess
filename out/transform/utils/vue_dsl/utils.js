"use strict";function e(e){const{componentName:n,componentsMap:t,importsMap:o,dependenceList:s,components:p}=e;if(!n)return;const r=t[n];if(!r)return;const c=o.get(r.packageName);if(c)c.add(r);else{const e=new Set;e.add(r),o.set(r.packageName,e)}p.add(n),s.find((e=>e.package===r.packageName))||s.push({package:r.packageName,version:r.dependenceVersion||"*"})}Object.defineProperty(exports,"__esModule",{value:!0}),exports.renderDefaultComps=exports.handleField=exports.transComponentsMap=exports.importString=exports.collectImports=void 0,exports.collectImports=e;const n=e=>{const n=[],t=[];for(const[o,s]of e){const e=new Set,p=new Set;for(const n of s){let o=n.exportName,s=n.subName,r=n.name;n.subName&&t.push(`const ${r} = ${o}.${s};`),o||(o=r),r===o||n.subName||(o=`${o} as ${r}`),n.dependence&&n.dependence.destructuring?p.add(o):e.add(o)}const r=[...e].join(",");let c=[...p].join(",");const a=r&&c?",":"";c&&(c=`{${c}}`),n.push(`import ${r} ${a} ${c} from '${o}'`)}return n.concat(t)};exports.importString=n;const t=e=>{let n=[];if(e&&Array.isArray(e.list)){n=n.concat(e.list);for(let t of e.list)t.children&&Array.isArray(t.children)&&(n=n.concat(t.children))}return n.reduce(((e,n)=>{const t=n.name,o=n.name_alias;if(!e[t]||o&&!e[o]){if(n.dependence)try{let e="string"==typeof n.dependence?JSON.parse(n.dependence):n.dependence;e&&(n.packageName=e.package),n.dependenceVersion||(n.dependenceVersion="*"),n.exportName=e.export_name,n.subName=e.sub_name,/^\d/.test(n.dependenceVersion)&&(n.dependenceVersion="^"+n.dependenceVersion)}catch(e){console.log(e)}e[t]=n,e[o]=n}return e}),{})};exports.transComponentsMap=t;const o=(e,n)=>{const{text:t=[]}=n;e.props.label=t[0]||"文本",e.props.placeholder=t[1]||"这里是输入框"};exports.handleField=o;const s=n=>{const{children:t,componentsMap:o,importsMap:s,dependenceList:p,components:r}=n;let c="";for(let n of t){e({componentName:n.name,componentsMap:o,importsMap:s,dependenceList:p,components:r});let t="";n.props&&(t=Object.keys(n.props).map((e=>`${e}="${n.props[e]}"`)).join(" ")),c+=`<${n.name} ${t} />`}return c};exports.renderDefaultComps=s;