const fs = require('fs');

let content = fs.readFileSync('src/services/scheduleData.js', 'utf8');

const helper = `function cleanShowImage(url) {
  if (!url) return '';
  return url.replace('https://player.mipanel.stream/player/uploads', 'https://mipanel.stream/player/uploads');
}

`;

if (!content.includes('cleanShowImage')) {
  content = helper + content;
  content = content.replace(
    'if (Array.isArray(parsed) && parsed.length > 0) return parsed;',
    'if (Array.isArray(parsed) && parsed.length > 0) { return parsed.map(s => ({ ...s, image: cleanShowImage(s.image) })); }'
  );
  fs.writeFileSync('src/services/scheduleData.js', content, 'utf8');
  console.log('scheduleData.js successfully sanitized!');
} else {
  console.log('cleanShowImage already present');
}
