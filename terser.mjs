import { globby } from 'globby';
import { minify } from 'terser';

import fs from 'fs-extra';

async function build() {
  const paths = await globby(['out']);

  const input = paths.reduce((acc, path) => {
    if (path.endsWith('.js')) {
      const pathKey = path.replace('src/', '');
      acc[pathKey] = path;
    }
    return acc;
  }, {});

  for (let key in input) {
    var options = {
      mangle: {
        toplevel: true,
      },
    };
    const result = await minify(fs.readFileSync(input[key], 'utf-8'), options);
    fs.outputFileSync(key, result.code, 'utf8');
  }
}

build();
