const fs = require('fs');
const path = require('path');

const directories = [
  path.join(__dirname, '../src/pages'),
  path.join(__dirname, '../src/components'),
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Regex to match tailwind classes like text-[20px] or w-[100px]
  // Using positive lookbehind (?<=[...]) so we don't consume the space character!
  const regex = /(?<=["'\s`])(w-|h-|min-w-|min-h-|max-w-|max-h-|p-|pt-|pb-|pl-|pr-|px-|py-|m-|mt-|mb-|ml-|mr-|mx-|my-|gap-|text-|top-|bottom-|left-|right-|space-x-|space-y-)\[(\d+(?:\.\d+)?)px\]/g;

  let changes = 0;
  const newContent = content.replace(regex, (match, classPrefix, pxValueStr) => {
    const pxValue = parseFloat(pxValueStr);
    
    // Ignore extremely small pixel values (like 1px, 2px borders/tweaks)
    if (pxValue <= 3) return match;

    const min = Math.round(pxValue * 0.85);
    const max = Math.round(pxValue * 1.15);
    // Base reference width: 393px (modern standard Android phone)
    const vw = (pxValue * 100 / 393).toFixed(2);
    
    changes++;
    return `${classPrefix}[clamp(${min}px,${vw}vw,${max}px)]`;
  });

  if (changes > 0) {
    fs.writeFileSync(filePath, newContent, 'utf-8');
    console.log(`Updated ${path.basename(filePath)} (${changes} replacements)`);
  }
}

function traverseDir(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverseDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      processFile(fullPath);
    }
  }
}

console.log('Starting migration script (pass 2)...');
directories.forEach(dir => {
  if (fs.existsSync(dir)) {
    traverseDir(dir);
  }
});
console.log('Migration complete!');
