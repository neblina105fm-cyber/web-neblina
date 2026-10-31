const fs = require('fs');

let code = fs.readFileSync('src/components/Navbar.jsx', 'utf8');

code = code.replace(
  '<nav className="flex items-center gap-1 justify-center min-w-0">',
  '<nav className="flex items-center gap-1 xl:gap-1.5 justify-center min-w-0 flex-1 px-4">'
);

fs.writeFileSync('src/components/Navbar.jsx', code, 'utf8');
console.log('Navbar navigation spacing adjusted successfully.');
