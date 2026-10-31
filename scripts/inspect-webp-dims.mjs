import fs from 'fs';

const buf = fs.readFileSync('scripts/figma-s3-thumbnail.png');
// WebP dimensions parser
// RIFF ... WEBP ... VP8 or VP8L or VP8X
console.log('File size:', buf.length);
console.log('Header:', buf.toString('ascii', 0, 16));
const chunkType = buf.toString('ascii', 12, 16);
console.log('Chunk type:', chunkType);

if (chunkType === 'VP8X') {
  // 24-bit width and height at byte 24 and 27 (1-based, 0-indexed: 24..26 and 27..29)
  const width = 1 + buf.readUIntLE(24, 3);
  const height = 1 + buf.readUIntLE(27, 3);
  console.log(`VP8X Dimensions: ${width}x${height}`);
} else if (chunkType === 'VP8L') {
  // Lossless
  const b1 = buf[21];
  const b2 = buf[22];
  const b3 = buf[23];
  const b4 = buf[24];
  const width = 1 + (((b2 & 0x3f) << 8) | b1);
  const height = 1 + (((b4 & 0xf) << 10) | (b3 << 2) | ((b2 & 0xc0) >> 6));
  console.log(`VP8L Dimensions: ${width}x${height}`);
} else if (chunkType === 'VP8 ') {
  // Lossy
  const width = buf.readUInt16LE(26) & 0x3fff;
  const height = buf.readUInt16LE(28) & 0x3fff;
  console.log(`VP8 Dimensions: ${width}x${height}`);
}
