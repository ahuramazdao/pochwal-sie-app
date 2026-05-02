import sharp from 'sharp';

async function findCircle() {
  const { data, info } = await sharp('public/assets/bg-program-klub.png')
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  
  let maxRunWidth = 0;
  let bestY = 0;
  let bestRunStartX = 0;
  let bestRunEndX = 0;
  
  for (let y = Math.floor(height * 0.5); y < Math.floor(height * 0.95); y++) {
    let firstWhite = -1;
    let lastWhite = -1;
    
    for (let x = 50; x < Math.floor(width * 0.55); x++) {
      const idx = (y * width + x) * channels;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      if (r > 240 && g > 240 && b > 240) {
        if (firstWhite === -1) firstWhite = x;
        lastWhite = x;
      }
    }
    
    if (firstWhite !== -1) {
      const runWidth = lastWhite - firstWhite;
      
      if (runWidth > maxRunWidth) {
        maxRunWidth = runWidth;
        bestY = y;
        bestRunStartX = firstWhite;
        bestRunEndX = lastWhite;
      }
    }
  }
  
  const centerX = Math.round((bestRunStartX + bestRunEndX) / 2);
  const radiusX = Math.round(maxRunWidth / 2);
  
  let topY = -1, bottomY = -1;
  for (let y = Math.floor(height * 0.4); y < height; y++) {
    const idx = (y * width + centerX) * channels;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    if (r > 240 && g > 240 && b > 240) {
      if (topY === -1) topY = y;
      bottomY = y;
    }
  }
  
  const centerY = Math.round((topY + bottomY) / 2);
  const radiusY = Math.round((bottomY - topY) / 2);
  
  const trueRadius = Math.min(radiusX, radiusY);
  const safeRadius = Math.round(trueRadius * 0.93);
  
  console.log(`RECOMMENDED CONFIG:`);
  console.log(`  logoPosition: { x: ${centerX}, y: ${centerY}, radius: ${safeRadius} }`);
}

findCircle();
