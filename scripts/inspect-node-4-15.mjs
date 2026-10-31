import fs from 'fs';

const data = JSON.parse(fs.readFileSync('scripts/figma-initial-data.json', 'utf8'));

// Search recursively for node with id '4:15' or '4-15'
function findNode(node) {
  if (!node) return null;
  if (node.id === '4:15' || node.id === '4-15') return node;
  if (node.children) {
    for (const child of node.children) {
      const found = findNode(child);
      if (found) return found;
    }
  }
  return null;
}

const target = findNode(data.document || data);
if (target) {
  console.log('Found target node:', target.name, target.type, JSON.stringify(target).slice(0, 500));
} else {
  console.log('Node 4:15 not found directly, searching keys...');
  const jsonStr = JSON.stringify(data);
  const idx = jsonStr.indexOf('4:15');
  console.log('Context around 4:15:', jsonStr.slice(Math.max(0, idx - 100), idx + 300));
}
