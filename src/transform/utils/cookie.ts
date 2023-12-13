export default class Cookie {
  data: Record<string, any>;

  constructor() {
    this.data = {};
  }

  // 刷新cookie，清除过期cookie
  checkExpires(name: string) {
    const cookieObject = this.data[name];
    if (cookieObject) {
      if (cookieObject.expires && new Date() > new Date(cookieObject.expires)) {
        delete this.data[name];
      } else {
        return cookieObject.value;
      }
    }
    return undefined;
  }
  refresh() {
    Object.keys(this.data).forEach(this.checkExpires.bind(this));
  }
  parserKeyValue(str: string): [string, string | boolean] {
    const keyValue = str.split('=');
    const key = keyValue[0];
    let value;
    if (keyValue.length > 1) {
      value = keyValue.slice(1).join('=');
    } else {
      value = true;
    }
    return [key, value];
  }
  parserOne(cookieStr: string) {
    const strList = cookieStr.split('; ');
    const obj: Record<string, any> = {
      expires: '',
    };
    const [kv, ...optionStrList] = strList;
    const [cookieKey, cookieValue] = this.parserKeyValue(kv);
    obj.value = cookieValue;
    obj.key = cookieKey;
    optionStrList.forEach((str) => {
      const [key, value] = this.parserKeyValue(str);
      if (key === 'max-age') {
        const expiresValue = new Date(
          new Date().getTime() + +value * 1000
        ).toUTCString();
        obj.expires = expiresValue;
      } else {
        obj[key] = value;
      }
    });
    this.data[cookieKey] = obj;
  }
  parserList(cookieList: string[] = []) {
    cookieList.forEach(this.parserOne.bind(this));
  }
  getOne(name: string) {
    return this.checkExpires(name);
  }
  getAll() {
    return Object.keys(this.data)
      .map((key) => {
        const getValue = this.checkExpires(key);
        return getValue ? `${key}=${getValue}` : undefined;
      })
      .filter(Boolean)
      .join('; ');
  }
}
