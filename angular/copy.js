//cross platform support, windows does not support cp command
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fse = require('fs-extra');

fs.copyFileSync('dist/angular/index.html', '../views/index.html');
fse.copySync('dist/angular/assets', '../public/assets');

fs.readdir('dist/angular/', (err, list) => {
  if (err) {
    throw err;
  }
  for (let s of list) {
    if (/\.js$/i.test(s) || /\.css$/i.test(s)) {
      fs.copyFileSync('dist/angular/' + s, '../public/' + s);
    }
  }
})
