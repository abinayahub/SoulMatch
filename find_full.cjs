const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: fs.createReadStream('C:\\\\Users\\\\91638\\\\.gemini\\\\antigravity-ide\\\\brain\\\\b09ccb3d-6e0b-4e33-b4a8-28adbfd2450a\\\\.system_generated\\\\logs\\\\transcript_full.jsonl')
});

let longestStr = "";

rl.on('line', (line) => {
  try {
    const data = JSON.parse(line);
    if (data.type === 'PLANNER_RESPONSE' && data.tool_calls) {
      for (const call of data.tool_calls) {
        if (call.name === 'replace_file_content' || call.name === 'write_to_file') {
          if (call.args && call.args.TargetFile && call.args.TargetFile.includes('profile-user.tsx')) {
            if (call.args.ReplacementContent && call.args.ReplacementContent.length > longestStr.length) {
              longestStr = call.args.ReplacementContent;
            }
            if (call.args.CodeContent && call.args.CodeContent.length > longestStr.length) {
              longestStr = call.args.CodeContent;
            }
          }
        }
      }
    }
    if (data.type === 'VIEW_FILE') {
        if (data.content && data.content.includes('profile-user.tsx') && data.content.length > longestStr.length) {
             longestStr = data.content;
        }
    }
  } catch(e) {}
});

rl.on('close', () => {
  console.log('Max chunk found length: ', longestStr.length);
  fs.writeFileSync('max_chunk.txt', longestStr);
});
