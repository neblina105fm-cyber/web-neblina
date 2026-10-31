import fs from 'fs';

async function run() {
  const url = 'https://s3-alpha.figma.com/thumbnails/e778512f-f202-4492-b0da-bb01b9c08e2b?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAQ4GOSFWC6ET65LQJ%2F20261018%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20261018T120000Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=ac52803f7d01e06969b7a0b92082a7b2fd2814c13489040eb506e067ebe14af8';
  console.log('Fetching S3 thumbnail...');
  const res = await fetch(url);
  console.log('Status:', res.status, 'Content-Type:', res.headers.get('content-type'));
  const buf = Buffer.from(await res.arrayBuffer());
  console.log('Bytes:', buf.length);
  fs.writeFileSync('scripts/figma-s3-thumbnail.png', buf);
  console.log('Saved to scripts/figma-s3-thumbnail.png');
}
run();
