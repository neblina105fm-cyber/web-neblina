const fs = require('fs');

console.log('--- Clearing hardcoded preloads and bypasses ---');

// 1. In JournalistPortalModal.jsx:
let journCode = fs.readFileSync('src/components/journalists/JournalistPortalModal.jsx', 'utf8');
journCode = journCode.replace(
  "const [loginUsername, setLoginUsername] = useState('admin');",
  "const [loginUsername, setLoginUsername] = useState('');"
);
journCode = journCode.replace(
  "const [loginPassword, setLoginPassword] = useState('admin');",
  "const [loginPassword, setLoginPassword] = useState('');"
);
// Also ensure input tags have autoCapitalize="none" and autoComplete="username" / "current-password"
fs.writeFileSync('src/components/journalists/JournalistPortalModal.jsx', journCode, 'utf8');
console.log('JournalistPortalModal: login state cleared to empty strings');

// 2. In clientPortalService.js: Remove demo fallback to admin/admin
let clientService = fs.readFileSync('src/services/clientPortalService.js', 'utf8');
clientService = clientService.replace(
  /const foundUser = \(inputUser === 'admin' && inputPass === 'admin'\)\s*\?\s*\(users\.find\(u => u\.username\.toLowerCase\(\) === 'admin'\) \|\| users\[0\]\)\s*:\s*users\.find\(u => u\.username\.toLowerCase\(\) === inputUser && u\.password === inputPass\);/,
  "const foundUser = users.find(u => u.username.toLowerCase() === inputUser && u.password === inputPass);"
);
fs.writeFileSync('src/services/clientPortalService.js', clientService, 'utf8');
console.log('clientPortalService: removed admin/admin bypass');

// 3. In staffPortalService.js: Remove demo fallback to admin/admin
let staffService = fs.readFileSync('src/services/staffPortalService.js', 'utf8');
staffService = staffService.replace(
  /const found = \(cleanU === 'admin' && cleanP === 'admin'\)\s*\?\s*\(users\.find\(u => u\.username\.toLowerCase\(\) === 'admin'\) \|\| users\[0\]\)\s*:\s*users\.find\(u =>\s*u\.username\.toLowerCase\(\) === cleanU &&\s*String\(u\.password\) === cleanP\s*\);/,
  "const found = users.find(u => u.username.toLowerCase() === cleanU && String(u.password) === cleanP);"
);
fs.writeFileSync('src/services/staffPortalService.js', staffService, 'utf8');
console.log('staffPortalService: removed admin/admin bypass');

// 4. In journalistsService.js: Remove automatic forced 'admin/admin' injection
let journService = fs.readFileSync('src/services/journalistsService.js', 'utf8');
journService = journService.replace(
  /\/\/ Asegurar que el usuario demo 'admin' exista siempre\s*const adminExists = list\.some\(j => j\.username === 'admin'\);\s*if \(!adminExists\) \{\s*list\.unshift\(DEFAULT_JOURNALISTS\[0\]\);\s*localStorage\.setItem\(JOURNALISTS_STORAGE_KEY, JSON.stringify\(list\)\);\s*\}/,
  "// No forzar usuario demo en la lista de periodistas"
);
fs.writeFileSync('src/services/journalistsService.js', journService, 'utf8');
console.log('journalistsService: removed forced admin/admin injection');
