const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('./src/components', filePath => {
  if (filePath.endsWith('.tsx')) {
    const content = fs.readFileSync(filePath, 'utf8');
    const maps = content.match(/\.map\s*\(/g);
    if (maps && maps.length > 0) {
      console.log(`\n--- ${filePath} ---`);
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (line.includes('key=')) {
          console.log(`Line ${idx+1}: ${line.trim()}`);
        }
      });
    }
  }
});
