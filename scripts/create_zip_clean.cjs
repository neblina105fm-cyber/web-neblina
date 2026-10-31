const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const distDir = path.resolve(__dirname, '..', 'dist');
const zipOut = path.resolve(__dirname, '..', 'neblina_dist_hosting.zip');

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'neblina_dist_'));
console.log('Copying dist to temp directory:', tempDir);

fs.cpSync(distDir, tempDir, { recursive: true });

// Check if old zip exists and remove
if (fs.existsSync(zipOut)) {
  fs.unlinkSync(zipOut);
}

console.log('Compressing with PowerShell Compress-Archive...');
const psCommand = `powershell -NoProfile -Command "Compress-Archive -Path '${tempDir}\\*' -DestinationPath '${zipOut}' -Force"`;
execSync(psCommand, { stdio: 'inherit' });

console.log('Cleaning up temp directory...');
fs.rmSync(tempDir, { recursive: true, force: true });

const stats = fs.statSync(zipOut);
console.log(`Zip successfully created: ${zipOut} (${(stats.size / (1024 * 1024)).toFixed(2)} MB)`);
