import fs from 'fs';

const html = fs.readFileSync('scripts/figma-design-page.html', 'utf8');
const match = html.match(/<script[^>]*data-initial>([\s\S]*?)<\/script>/i);
if (match) {
  const jsonStr = match[1];
  fs.writeFileSync('scripts/figma-initial-data.json', jsonStr);
  const data = JSON.parse(jsonStr);
  console.log('Keys in data:', Object.keys(data));
  if (data.file) {
    console.log('File keys:', Object.keys(data.file));
    console.log('File name:', data.file.name);
  }
  // Search for images, canvas, thumbnail, or node 4:15
  const str = JSON.stringify(data);
  console.log('Contains 4:15?', str.includes('4:15'));
  console.log('Contains 4-15?', str.includes('4-15'));
  
  // Find any image URLs
  const imgUrls = str.match(/https:\/\/[^"']+\.(png|svg|jpg|jpeg|webp)/gi);
  console.log('Image URLs count:', imgUrls ? imgUrls.length : 0);
  if (imgUrls) {
    console.log('Sample image URLs:', [...new Set(imgUrls)].slice(0, 15));
  }
  
  // Look for any S3 URLs or figma image URLs
  const figmaImgs = str.match(/https:\/\/[^"']*(images|thumbnails|s3)[^"']*/gi);
  console.log('Figma image/s3 URLs count:', figmaImgs ? figmaImgs.length : 0);
  if (figmaImgs) {
    console.log('Sample figma image/s3 URLs:', [...new Set(figmaImgs)].slice(0, 15));
  }
} else {
  console.log('data-initial script not found');
}
