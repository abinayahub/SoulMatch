const fs = require('fs');
const lines = fs.readFileSync('C:/Users/91638/.gemini/antigravity-ide/brain/2cd573e0-f426-4b63-aada-54f023955919/.system_generated/logs/transcript.jsonl', 'utf-8').split('\n');
let edits = [];
for(let i=0; i<lines.length; i++){
  if (lines[i].includes('helpers.ts') && lines[i].includes('"type":"PLANNER_RESPONSE"')) {
    try {
      const o = JSON.parse(lines[i]);
      const calls = o.tool_calls || [];
      for (const c of calls) {
        if ((c.name === 'multi_replace_file_content' || c.name === 'replace_file_content') && c.args.TargetFile.includes('helpers.ts')) {
          edits.push({
             index: i,
             args: c.args
          });
        }
      }
    } catch(e) {}
  }
}
fs.writeFileSync('c:/Users/91638/Downloads/Soul-Match-AI/Soul-Match-AI/all_edits.json', JSON.stringify(edits, null, 2));
console.log(`Found ${edits.length} edits.`);
