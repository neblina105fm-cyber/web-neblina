const fs = require('fs');

let code = fs.readFileSync('src/components/Navbar.jsx', 'utf8');

// Replace header container max-width:
code = code.replace(
  'max-w-[1440px] mx-auto px-3.5 sm:px-6 lg:px-8',
  'w-full max-w-[1920px] mx-auto px-3.5 sm:px-6 lg:px-8'
);

fs.writeFileSync('src/components/Navbar.jsx', code, 'utf8');
console.log('Navbar successfully updated with wider max container.');
