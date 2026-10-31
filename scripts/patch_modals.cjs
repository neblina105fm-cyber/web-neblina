const fs = require('fs');

['src/components/IosInstallModal.jsx', 'src/components/UniversalInstallModal.jsx'].forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/src=["']\/apple-touch-icon/g, 'src="./apple-touch-icon');
  fs.writeFileSync(file, content, 'utf8');
  console.log(file, 'updated successfully');
});
