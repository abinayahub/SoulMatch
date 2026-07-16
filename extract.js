const fs = require('fs');
const lines = fs.readFileSync('C:/Users/91638/.gemini/antigravity-ide/brain/2cd573e0-f426-4b63-aada-54f023955919/.system_generated/logs/transcript.jsonl', 'utf-8').split('\n');
for(let i=lines.length-1; i>=0; i--){
  if(lines[i].includes('export async function calculateAndStoreCompatibility') && lines[i].includes('"type":"PLANNER_RESPONSE"')) {
    const o = JSON.parse(lines[i]);
    const calls = o.tool_calls || [];
    for(const c of calls) {
       if (c.name === 'multi_replace_file_content' || c.name === 'replace_file_content') {
         if (c.args && c.args.TargetFile && c.args.TargetFile.includes('helpers.ts')) {
           fs.writeFileSync('c:/Users/91638/Downloads/Soul-Match-AI/Soul-Match-AI/extracted_helpers.ts', c.args.ReplacementContent || c.args.ReplacementChunks);
           console.log("Extracted from replacement!");
           return;
         }
       }
    }
  }
}
