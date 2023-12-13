export function getImgFileMap(_data: Record<string, any>) {
  const map: Record<string, any> = {};
  let num = 0;
  function getImgFile(data: Record<string, any>) {
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
