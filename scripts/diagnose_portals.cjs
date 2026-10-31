const fs = require('fs');

console.log('--- Checking services and mocks ---');
try {
  const clientService = fs.readFileSync('src/services/clientPortalService.js', 'utf8');
  console.log('clientPortalService loaded, size:', clientService.length);
} catch (e) {
  console.error('Error loading clientPortalService:', e);
}

try {
  const staffService = fs.readFileSync('src/services/staffPortalService.js', 'utf8');
  console.log('staffPortalService loaded, size:', staffService.length);
} catch (e) {
  console.error('Error loading staffPortalService:', e);
}
