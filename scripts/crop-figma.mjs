import sharp from 'sharp';

async function analyze() {
  const image = sharp('scripts/figma-preview.png');
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  
  let minX = info.width, minY = info.height, maxX = 0, maxY = 0;
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const idx = (y * info.width + x) * info.channels;
      const alpha = info.channels === 4 ? data[idx + 3] : 255;
      if (alpha > 20) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  console.log(`BBox: x=${minX}..${maxX}, y=${minY}..${maxY}, w=${maxX - minX + 1}, h=${maxY - minY + 1}`);

  // Crop the logo exactly
  await sharp('scripts/figma-preview.png')
    .extract({ left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 })
    .png()
    .toFile('scripts/figma-cropped.png');
  console.log('Saved figma-cropped.png');
}

analyze();
