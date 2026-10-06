const fs = require('fs');
const path = require('path');

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    for (const child of fs.readdirSync(src)) {
      copyRecursive(path.join(src, child), path.join(dest, child));
    }
  } else if (stats.isFile() && (src.endsWith('.svg') || src.endsWith('.png') || src.endsWith('.json'))) {
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(src, dest);
  }
}

const srcDir = path.join(__dirname, '..', 'nodes');
const destDir = path.join(__dirname, '..', 'dist', 'nodes');
copyRecursive(srcDir, destDir);
console.log('Copied static assets to dist/nodes');
