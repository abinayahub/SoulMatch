const fs = require('fs');
const lines = fs.readFileSync('C:/Users/91638/.gemini/antigravity-ide/brain/2cd573e0-f426-4b63-aada-54f023955919/.system_generated/logs/transcript.jsonl', 'utf-8').split('\n');
let bestMatch = null;
for(let i=0; i<lines.length; i++){
  if(lines[i].includes('"TargetFile":"\\"c:/Users/91638/Downloads/Soul-Match-AI/Soul-Match-AI/artifacts/api-server/src/lib/helpers.ts\\""')) {
    bestMatch = lines[i];
  }
}
if(bestMatch) {
  fs.writeFileSync('c:/Users/91638/Downloads/Soul-Match-AI/Soul-Match-AI/last_edit.json', bestMatch);
  console.log("Found last edit!");
}
