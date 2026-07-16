const fs = require('fs');
const lines = fs.readFileSync('C:/Users/91638/.gemini/antigravity-ide/brain/2cd573e0-f426-4b63-aada-54f023955919/.system_generated/logs/transcript.jsonl', 'utf-8').split('\n');
for(let i=0; i<lines.length; i++){
  if(lines[i].includes('export async function calculateAndStoreCompatibility') && lines[i].includes('"type":"VIEW_FILE"')) {
    const o = JSON.parse(lines[i]);
    const fileContent = o.content.replace(/^[0-9]+: /gm, '').replace(/The following code has been modified.*?\n/, '').replace(/The above content shows the entire.*/, '');
    fs.writeFileSync('c:/Users/91638/Downloads/Soul-Match-AI/Soul-Match-AI/artifacts/api-server/src/lib/helpers.ts', fileContent);
    console.log("Restored helpers.ts!");
    break;
  }
}
