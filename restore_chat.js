const fs = require('fs');
const transcriptPath = 'C:/Users/91638/.gemini/antigravity-ide/brain/ce94e376-a851-4150-814b-5d2b5a59e123/.system_generated/logs/transcript_full.jsonl';
const fileToRestore = 'c:\\\\users\\\\91638\\\\desktop\\\\soulmatch app\\\\soul-match-ai\\\\artifacts\\\\soulmatch\\\\src\\\\pages\\\\chat.tsx'.toLowerCase();

let lines = fs.readFileSync(transcriptPath, 'utf8').split('\n');
let edits = [];

for(let line of lines) {
  if(!line) continue;
  try {
      let obj = JSON.parse(line);
      if(obj.tool_calls) {
        for(let tc of obj.tool_calls) {
          if(tc.name === 'replace_file_content' || tc.name === 'multi_replace_file_content') {
            let target = tc.args.TargetFile.toLowerCase().replace(/\//g, '\\\\');
            if(target.includes('chat.tsx')) {
              edits.push(tc.args);
            }
          }
        }
      }
  } catch(e) {}
}

let currentContent = fs.readFileSync('artifacts/soulmatch/src/pages/chat.tsx', 'utf8');
console.log('Found ' + edits.length + ' edits.');

for (let i = edits.length - 1; i >= 0; i--) {
  let edit = edits[i];
  let chunks = typeof edit.ReplacementChunks === 'string' ? JSON.parse(edit.ReplacementChunks) : (edit.ReplacementChunks || [edit]);
  // Revert chunks backwards
  for (let j = chunks.length - 1; j >= 0; j--) {
    let chunk = chunks[j];
    let oldStr = chunk.ReplacementContent;
    let newStr = chunk.TargetContent;
    let idx = currentContent.indexOf(oldStr);
    if (idx !== -1) {
       currentContent = currentContent.substring(0, idx) + newStr + currentContent.substring(idx + oldStr.length);
       console.log('Reversed a chunk in edit ' + i);
    } else {
       // try LF instead of CRLF
       let oldStrLF = oldStr.replace(/\r\n/g, '\n');
       let currentContentLF = currentContent.replace(/\r\n/g, '\n');
       idx = currentContentLF.indexOf(oldStrLF);
       if(idx !== -1) {
          currentContent = currentContentLF.substring(0, idx) + newStr.replace(/\r\n/g, '\n') + currentContentLF.substring(idx + oldStrLF.length);
          console.log('Reversed chunk in edit ' + i + ' (LF match)');
       } else {
          console.log('CRITICAL FAIL in edit ' + i + ': ' + oldStr.substring(0, 50));
       }
    }
  }
}

fs.writeFileSync('artifacts/soulmatch/src/pages/chat_restored.tsx', currentContent);
console.log('Saved to artifacts/soulmatch/src/pages/chat_restored.tsx');
