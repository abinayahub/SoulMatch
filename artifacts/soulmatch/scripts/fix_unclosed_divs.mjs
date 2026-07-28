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
const dirsToScan = [
  path.join(rootDir, 'pages'),
  path.join(rootDir, 'components')
];

let files = [];
dirsToScan.forEach(dir => {
  files = files.concat(getAllFiles(dir));
});

let updatedCount = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;

  // Remove the unclosed div that was injected
  const unclosedDivRegex = /      <div className="relative z-10 flex-1 flex flex-col w-full h-full">\r?\n/g;
  content = content.replace(unclosedDivRegex, '');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    updatedCount++;
    console.log(`Fixed unclosed div in ${file}`);
  }
}

console.log(`Fixed ${updatedCount} files.`);
