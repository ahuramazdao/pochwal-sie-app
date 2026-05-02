async function run() {
  const { Jimp } = await import('jimp');

  try {
    const img = await Jimp.read('public/assets/bg-program-klub.png');
    const width = img.bitmap.width;
    const height = img.bitmap.height;
    
    let minX = width, maxX = 0;
    let minY = height, maxY = 0;
    
    for (let y = 1000; y < height; y++) {
      for (let x = 0; x < width / 2; x++) {
        const hex = img.getPixelColor(x, y);
        const rgba = Jimp.intToRGBA(hex);
        
        if (rgba.r > 245 && rgba.g > 245 && rgba.b > 245) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    
    console.log(`MinX: ${minX}, MaxX: ${maxX}`);
    console.log(`MinY: ${minY}, MaxY: ${maxY}`);
    
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const radiusX = (maxX - minX) / 2;
    const radiusY = (maxY - minY) / 2;
    
    console.log(`Center: x=${centerX}, y=${centerY}, radius=${(radiusX + radiusY) / 2}`);
  } catch (e) {
    console.error(e);
  }
}
run();
