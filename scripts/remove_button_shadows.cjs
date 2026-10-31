const fs = require('fs');

function cleanButtonShadows(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');
  let original = code;

  // Replace shadow classes inside <button and <a elements
  // We can do targeted regex replacements for classes on buttons
  // shadow, shadow-sm, shadow-md, shadow-lg, shadow-xs, shadow-2xl, shadow-xl
  
  // 1. Specific button class patterns
  code = code.replace(/<button([^>]*?)className=(["'])(.*?)\2/gs, (match, before, quote, classNames) => {
    const cleaned = classNames
      .replace(/\bshadow-(?:2xl|xl|lg|md|sm|xs)\b/g, '')
      .replace(/\bshadow\b/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    return `<button${before}className=${quote}${cleaned}${quote}`;
  });

  if (code !== original) {
    fs.writeFileSync(filePath, code, 'utf8');
    console.log('Cleaned button shadows in:', filePath);
  } else {
    console.log('No button shadows to clean in:', filePath);
  }
}

const targetFiles = [
  'src/components/Navbar.jsx',
  'src/components/NewsSection.jsx',
  'src/components/client/ClientPortalModal.jsx',
  'src/components/admin/AdminModal.jsx',
  'src/components/staff/StaffPortalModal.jsx',
  'src/components/journalists/JournalistPortalModal.jsx',
  'src/components/PublicServiceSection.jsx',
  'src/components/admin/AdminPublicServiceTab.jsx',
  'src/components/TalentsSection.jsx',
  'src/components/EventsSection.jsx',
  'src/components/SponsorsDirectorySection.jsx',
  'src/components/Footer.jsx'
];

targetFiles.forEach(f => {
  if (fs.existsSync(f)) {
    cleanButtonShadows(f);
  }
});
