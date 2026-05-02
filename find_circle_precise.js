import sharp from 'sharp';

async function findExact() {
  const { data, info } = await sharp('public/assets/bg-program-klub.png')
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  
  let minX = width, maxX = 0;
  let minY = height, maxY = 0;
  
  // Search only the very specific area where the circle is (based on ASCII art)
  // X: 200 to 750
  // Y: 1200 to 1750
  for (let y = 1200; y < 1750; y++) {
    for (let x = 200; x < 750; x++) {
      const idx = (y * width + x) * channels;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      
      // Look for pure white pixels
      if (r > 240 && g > 240 && b > 240) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  
  const centerX = Math.round((minX + maxX) / 2);
  const centerY = Math.round((minY + maxY) / 2);
  const radius = Math.round((maxX - minX) / 2);
  
  console.log(`BBox: X[${minX}, ${maxX}] Y[${minY}, ${maxY}]`);
  console.log(`Center: X=${centerX}, Y=${centerY}`);
  console.log(`Radius: ${radius}`);
  console.log(`Safe Radius: ${Math.round(radius * 0.93)}`);
}
findExact();
