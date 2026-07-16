const fs = require('fs');
const lines = fs.readFileSync('C:/Users/91638/.gemini/antigravity-ide/brain/2cd573e0-f426-4b63-aada-54f023955919/.system_generated/logs/transcript.jsonl', 'utf-8').split('\n');
for(let i=0; i<lines.length; i++){
  if(lines[i].includes('export async function calculateAndStoreCompatibility') && lines[i].includes('"type":"VIEW_FILE"')) {
    const o = JSON.parse(lines[i]);
    const fileContent = o.content.replace(/^[0-9]+: /gm, '');
    fs.writeFileSync('c:/Users/91638/Downloads/Soul-Match-AI/Soul-Match-AI/recovered_helpers.ts', fileContent);
    console.log("Recovered from early view!");
    break;
  }
}
