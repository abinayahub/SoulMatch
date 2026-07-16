const fs = require('fs');
const transcriptPath = 'C:\\\\Users\\\\91638\\\\.gemini\\\\antigravity-ide\\\\brain\\\\b09ccb3d-6e0b-4e33-b4a8-28adbfd2450a\\\\.system_generated\\\\logs\\\\transcript_full.jsonl';
const lines = fs.readFileSync(transcriptPath, 'utf8').split('\n');

let fileLines = {};

function extractFromText(text) {
  if (text.includes('Total Lines:') && text.includes('profile-user.tsx')) {
    if (text.includes('Total Lines: 1101') || text.includes('Total Lines: 274') || text.includes('Total Lines: 161')) {
      return; // Skip broken states
    }
    const linesOfText = text.split('\n');
    for (const l of linesOfText) {
      const match = l.match(/^(\d+): (.*)$/);
      if (match) {
        fileLines[parseInt(match[1], 10)] = match[2];
      }
    }
  }
}

function traverse(obj) {
  if (typeof obj === 'string') {
    extractFromText(obj);
  } else if (Array.isArray(obj)) {
    obj.forEach(traverse);
  } else if (typeof obj === 'object' && obj !== null) {
    Object.values(obj).forEach(traverse);
  }
}

lines.forEach(line => {
  if (!line.trim()) return;
  try { traverse(JSON.parse(line)); } catch(e) {}
});

let maxLine = 0;
for (const num of Object.keys(fileLines)) {
  if (parseInt(num, 10) > maxLine) maxLine = parseInt(num, 10);
}

let result = [];
for (let i = 1; i <= maxLine; i++) {
  result.push(fileLines[i] !== undefined ? fileLines[i] : `// MISSING LINE ${i}`);
}

fs.writeFileSync('artifacts/soulmatch/src/pages/profile-user.tsx', result.join('\n'));
console.log('Rebuilt file up to line ' + maxLine);
let missing = result.filter(r => r.startsWith('// MISSING LINE')).length;
console.log('Missing lines: ' + missing);
