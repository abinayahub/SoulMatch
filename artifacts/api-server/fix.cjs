const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/services/keywordAnalysis.ts');
let content = fs.readFileSync(file, 'utf8');

const regex = /KEYWORD_MAP:\s*Record<string,\s*UnifiedCategory>\s*=\s*\{([\s\S]*?)\};/;
const match = content.match(regex);
if (match) {
  const mapStr = match[1];
  const keys = new Set();
  const newMapStr = mapStr.replace(/"([^"]+)":\s*"([^"]+)"/g, (match, key, value) => {
    if (keys.has(key)) {
      return ''; // remove duplicate
    }
    keys.add(key);
    return match;
  }).replace(/,\s*,/g, ',').replace(/,\s*\n/g, '\n').replace(/,\s*$/g, '');
  content = content.replace(regex, `KEYWORD_MAP: Record<string, UnifiedCategory> = {\n${newMapStr}\n};`);
  fs.writeFileSync(file, content);
  console.log('Fixed duplicates');
}
