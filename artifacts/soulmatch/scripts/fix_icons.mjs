import fs from 'fs';
import path from 'path';

function getAllFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, fileList);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

const rootDir = 'c:/Users/91638/Desktop/SoulMatch App/Soul-Match-AI/artifacts/soulmatch/src';
const files = getAllFiles(rootDir);
let updatedCount = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;

  // Add z-10 to absolutely positioned icons inside inputs
  content = content.replace(/className="absolute left-([0-9a-z.-]+) top-1\/2 -translate-y-1\/2([^"]*)"/g, (match, p1, p2) => {
    if (!p2.includes('z-10') && !match.includes('z-10')) {
      return `className="absolute z-10 left-${p1} top-1/2 -translate-y-1/2${p2}"`;
    }
    return match;
  });
  
  // Update disabled buttons in register.tsx to be full color ONLY when valid.
  // Actually, I'll just write a custom script for register.tsx below.

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    updatedCount++;
    console.log('Fixed icons in ' + file);
  }
}
console.log('Total files fixed: ' + updatedCount);
