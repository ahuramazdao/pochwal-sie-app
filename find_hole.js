import sharp from 'sharp';

async function findHole() {
  const { data, info } = await sharp('public/assets/bg-program-klub.png')
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  
  let minX = width, maxX = 0;
  let minY = height, maxY = 0;
  let found = false;
  
  for (let y = 1000; y < 1900; y++) {
    for (let x = 100; x < 900; x++) {
      const idx = (y * width + x) * channels;
      const alpha = data[idx + 3];
      
      // Look for pixels that are fully or partially transparent
      if (alpha < 250) {
        found = true;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  
  if (!found) {
    console.log("No transparent pixels found in the search area!");
    return;
  }
  
  const centerX = Math.round((minX + maxX) / 2);
  const centerY = Math.round((minY + maxY) / 2);
  const radius = Math.round((maxX - minX) / 2);
  
  console.log(`Hole BBox: X[${minX}, ${maxX}] Y[${minY}, ${maxY}]`);
  console.log(`Center: X=${centerX}, Y=${centerY}`);
  console.log(`Radius: ${radius}`);
}
findHole();
