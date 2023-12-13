"use strict";
// function getTailwindcssName(store_data) {
//   let iframe_ele = document.getElementById('test_iframe');
//   let doc = (<HTMLIFrameElement>iframe_ele).contentWindow.document;
//   let trs = doc.getElementsByTagName('TBODY')[0].children;
//   for (let tr of trs) {
//     let children = tr.children || [];
//     store_data[children[1].textContent.replace(/\;\n/, '')] =
//       children[0].textContent.replace(/\;\n/, '');
//   }
//   return store_data;
// }
// function getTailwindcssMenu() {
//   const ele = document.getElementById('test');
//   let list = [];
//   // ele.children.length - 2
//   // 只支持flexbox layout
//   for (let i = 11; i < 13; i++) {
//     const block = ele.children[i];
//     const lis = block.children[1].children;
//     for (let item of lis) {
//       let text = item.textContent;
//       if (text.includes('/')) {
//         // ['', 'Grid Column Start / End', 'Grid Row Start / End']
//         const map = {
//           'Top / Right / Bottom / Left': 'top-right-bottom-left',
//           'Grid Row Start / End': 'grid-row',
//           'Grid Column Start / End': 'grid-column',
//         };
//         list.push(map[text]);
//       } else {
//         list.push(text.replace(/\s/g, '-').toLowerCase());
//       }
//     }
//   }
//   return list;
// }
// function init() {
//   const iframe_ele = document.createElement('iframe');
//   iframe_ele.setAttribute('id', 'test_iframe');
//   document.body.append(iframe_ele);
//   // let list = ['background-attachment', 'break-after'];
//   const list = getTailwindcssMenu();
//   let store_data = {};
//   function getTailwindcssNames() {
//     if (list.length > 0) {
//       let lis = list.pop();
//       document
//         .getElementById('test_iframe')
//         .setAttribute('src', `https://tailwindcss.com/docs/${lis}`);
//       document.getElementById('test_iframe').onload = () => {
//         store_data = {
//           ...store_data,
//           ...getTailwindcssName(store_data),
//         };
//         getTailwindcssNames();
//         window.sessionStorage.setItem('tailwind', JSON.stringify(store_data));
//       };
//     }
//   }
//   getTailwindcssNames();
//   return store_data;
// }
