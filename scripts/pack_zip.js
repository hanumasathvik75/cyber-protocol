const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = 'C:\\Users\\SATHVIK\\.gemini\\antigravity\\scratch\\safeguard';
const tempDir = path.join(rootDir, 'temp_pack');
const zipPath = path.join(rootDir, 'cyber-protocol-setup.zip');

if (fs.existsSync(tempDir)) {
  fs.rmSync(tempDir, { recursive: true, force: true });
}
fs.mkdirSync(path.join(tempDir, 'safeguard-extension'), { recursive: true });
fs.mkdirSync(path.join(tempDir, 'scripts'), { recursive: true });

function copyFolder(src, dest) {
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyFolder(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

copyFolder(path.join(rootDir, 'safeguard-extension'), path.join(tempDir, 'safeguard-extension'));
copyFolder(path.join(rootDir, 'scripts'), path.join(tempDir, 'scripts'));

if (fs.existsSync(zipPath)) {
  fs.unlinkSync(zipPath);
}

execSync(`powershell -Command "Compress-Archive -Path '${tempDir}\\*' -DestinationPath '${zipPath}' -Force"`);
fs.rmSync(tempDir, { recursive: true, force: true });
console.log('Zip generated successfully:', zipPath);
