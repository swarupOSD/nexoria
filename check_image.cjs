const fs = require('fs');
const PNG = require('pngjs').PNG;

fs.createReadStream('catch_errors_screenshot.png')
  .pipe(new PNG({ filterType: 4 }))
  .on('parsed', function() {
    let colors = new Set();
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        let idx = (this.width * y + x) << 2;
        let r = this.data[idx];
        let g = this.data[idx+1];
        let b = this.data[idx+2];
        colors.add(`${r},${g},${b}`);
        if (colors.size > 10) {
            console.log("NOT BLANK. Found multiple colors.");
            return;
        }
      }
    }
    console.log("BLANK SCREEN! Total unique colors:", colors.size);
    console.log("Colors found:", Array.from(colors));
  });
