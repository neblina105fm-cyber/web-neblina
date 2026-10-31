import sharp from 'sharp';

async function check() {
  const meta = await sharp('scripts/figma-preview.png').metadata();
  console.log('Figma preview metadata:', meta);
}
check();
