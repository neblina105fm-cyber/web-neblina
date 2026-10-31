const fs = require('fs');

let content = fs.readFileSync('src/components/Navbar.jsx', 'utf8');

// 1. Add HeartHandshake import
if (!content.includes('HeartHandshake,')) {
  content = content.replace('Radio,', 'Radio,\n  HeartHandshake,');
}

// 2. Add public_service to secondaryNavItems
if (!content.includes("id: 'public_service'")) {
  content = content.replace(
    "{ id: 'sponsors', label: 'Aliados', icon: Store },",
    "{ id: 'sponsors', label: 'Aliados', icon: Store },\n    { id: 'public_service', label: 'Servicio Público', fullLabel: 'Servicio Público & Ayudas', icon: HeartHandshake },"
  );
}

// 3. Make logo bigger & add more separation from Inicio:
// In 2XL desktop view:
// Change logo from h-10 xl:h-11 to h-11 sm:h-12 xl:h-13 w-auto
// Change logo container margin: add mr-6 xl:mr-10
content = content.replace(
  'className="relative flex items-center cursor-pointer py-1 select-none flex-shrink-0 active:scale-95 transition-transform duration-150"',
  'className="relative flex items-center cursor-pointer py-1 select-none flex-shrink-0 mr-6 xl:mr-10 active:scale-95 transition-transform duration-150"'
);

content = content.replace(
  'className="h-10 xl:h-11 w-auto object-contain relative z-10 transition-transform duration-200"',
  'className="h-11 sm:h-12 xl:h-13 w-auto object-contain relative z-10 transition-transform duration-200"'
);

// In Mobile header view:
content = content.replace(
  'className="h-8 sm:h-9 w-auto object-contain relative z-10 transition-transform duration-200"',
  'className="h-9 sm:h-11 w-auto object-contain relative z-10 transition-transform duration-200"'
);

fs.writeFileSync('src/components/Navbar.jsx', content, 'utf8');
console.log('Navbar updated successfully!');
