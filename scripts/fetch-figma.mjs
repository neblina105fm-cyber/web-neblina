import fs from 'fs';

async function run() {
  try {
    const thumbUrl = 'https://www.figma.com/file/BUnPpoy5RamuIhyqzuSeiL/thumbnail?node-id=4-15&in-better-link-exp=true&t=meVqs0E3zJaG7TYG-1';
    console.log('Fetching thumbnail from:', thumbUrl);
    const res = await fetch(thumbUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
      },
      redirect: 'follow'
    });
    console.log('Response status:', res.status, 'Content-Type:', res.headers.get('content-type'));
    const buffer = Buffer.from(await res.arrayBuffer());
    console.log('Downloaded bytes:', buffer.length);
    fs.writeFileSync('scripts/figma-node-thumbnail.png', buffer);
    console.log('Saved to scripts/figma-node-thumbnail.png');
  } catch (e) {
    console.error(e);
  }
}
run();
