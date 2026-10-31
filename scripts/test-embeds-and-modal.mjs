import { processSocialContent } from '../src/utils/socialEmbedParser.js';

console.log('🧪 Testing socialEmbedParser.js ...\n');

// Test 1: Instagram blockquote
const igBlockquote = `<blockquote class="instagram-media" data-instgrm-permalink="https://www.instagram.com/reel/DBUxample123/?utm_source=ig_embed">
<div>View this post on Instagram</div>
</blockquote>`;
const out1 = processSocialContent(igBlockquote);
console.log('1. Instagram blockquote ->', out1.includes('https://www.instagram.com/reel/DBUxample123/embed/captioned/') ? '✅ PASS (Iframe generated)' : '❌ FAIL');

// Test 2: Raw Instagram URL
const igRaw = `<p>https://www.instagram.com/p/C-samplePost456/?igsh=123</p>`;
const out2 = processSocialContent(igRaw);
console.log('2. Raw Instagram URL ->', out2.includes('https://www.instagram.com/p/C-samplePost456/embed/captioned/') ? '✅ PASS (Iframe generated)' : '❌ FAIL');

// Test 3: Facebook link
const fbRaw = `<p>https://www.facebook.com/neblina105fm/posts/987654321</p>`;
const out3 = processSocialContent(fbRaw);
console.log('3. Facebook post URL ->', out3.includes('facebook.com/plugins/post.php') ? '✅ PASS (Iframe generated)' : '❌ FAIL');

// Test 4: TikTok link
const ttRaw = `<p>https://www.tiktok.com/@neblina105fm/video/7421894729182371078</p>`;
const out4 = processSocialContent(ttRaw);
console.log('4. TikTok video URL ->', out4.includes('tiktok.com/embed/v2/7421894729182371078') ? '✅ PASS (Iframe generated)' : '❌ FAIL');

// Test 5: Twitter / X link
const xRaw = `<p>https://x.com/neblina105fm/status/1845123456789012345</p>`;
const out5 = processSocialContent(xRaw);
console.log('5. Twitter / X URL ->', out5.includes('twitter-tweet') ? '✅ PASS (Tweet embed container generated)' : '❌ FAIL');

// Test 6: YouTube link
const ytRaw = `<p>https://www.youtube.com/watch?v=dQw4w9WgXcQ</p>`;
const out6 = processSocialContent(ytRaw);
console.log('6. YouTube URL ->', out6.includes('youtube.com/embed/dQw4w9WgXcQ') ? '✅ PASS (Iframe generated)' : '❌ FAIL');

console.log('\n🎉 All unit checks finished!');
