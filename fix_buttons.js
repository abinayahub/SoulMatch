const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(dirPath);
  });
}

walk('c:/Users/91638/Desktop/SoulMatch App/Soul-Match-AI/artifacts/soulmatch/src', (filePath) => {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  
  const lines = content.split('\n');
  let changed = false;
  for (let i=0; i<lines.length; i++) {
     if (lines[i].includes('linear-gradient(135deg, #F8C7C8, #F8D9D2, #F7E8EE)') && 
         (lines[i].includes('<button') || lines[i].includes('<Button'))) {
         
         if (lines[i].includes('text-[#252525]')) {
             lines[i] = lines[i].replace('text-[#252525]', 'text-white gradient-coral-pill');
         } else if (lines[i].includes('className=\"')) {
             lines[i] = lines[i].replace('className=\"', 'className=\"gradient-coral-pill text-white ');
         }
         
         lines[i] = lines[i].replace(/style=\{\{\s*background:\s*'linear-gradient\(135deg, #F8C7C8, #F8D9D2, #F7E8EE\)'(?:,\s*boxShadow:\s*'[^']+')?\s*\}\}/g, '');
         lines[i] = lines[i].replace(/style=\{\{\s*background:\s*'linear-gradient\(135deg, #F8C7C8, #F8D9D2, #F7E8EE\)'\s*\}\}/g, '');
         
         changed = true;
     }
  }
  
  if (changed) {
    fs.writeFileSync(filePath, lines.join('\n'));
    console.log('Updated ' + filePath);
  }
});
