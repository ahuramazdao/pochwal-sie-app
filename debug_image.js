import sharp from 'sharp';

async function analyze() {
  const { data, info } = await sharp('public/assets/bg-program-klub.png')
    .resize(100, 100, { fit: 'fill' })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  let out = '';
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * channels;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      
      // Look for the white circle area
      if (r > 200 && g > 200 && b > 200) {
        out += '##';
      } else {
        out += '..';
      }
    }
    out += '\n';
  }
  console.log(out);
}
analyze();
