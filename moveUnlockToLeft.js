const fs = require('fs');

const path = 'artifacts/soulmatch/src/pages/profile-user.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Extract Unlock Full Compatibility Insights
const startMarker = '{/* Unlock Full Compatibility Insights */}';
const startIdx = content.indexOf(startMarker);
if (startIdx === -1) {
    console.error("Could not find Unlock card");
    process.exit(1);
}

// It ends before the closing of the grid div
const endTag = '                      </div>\n                    </div>\n                  );\n                })()';
const endIdx = content.indexOf(endTag);
if (endIdx === -1) {
    console.error("Could not find end of Unlock card");
    process.exit(1);
}

const unlockCardHTML = content.substring(startIdx, endIdx).trim();

// 2. Remove the Unlock card and the 2-column grid wrapper around Focus Areas
// We need to find the start of the 2-column grid
const gridStartMarker = '{/* 2-Column Tips Grid */}\n                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">';
const gridStartIdx = content.indexOf(gridStartMarker);

// The focus area card ends right before the unlock card starts
const focusAreaEndIdx = startIdx;
const focusAreaHTML = content.substring(gridStartIdx + gridStartMarker.length, focusAreaEndIdx).trim();

// Replace from gridStartMarker to end of unlock card with just the focus area html
const replaceEndIdx = endIdx + '                      </div>'.length;
content = content.substring(0, gridStartIdx) + focusAreaHTML + '\n' + content.substring(replaceEndIdx);


// 3. Insert Unlock card into the left column
// The left column ends right before `{/* Right Column: Insights */}`
const leftColEndMarker = '{/* Right Column: Insights */}';
const leftColEndIdx = content.indexOf(leftColEndMarker);
const leftColInsertIdx = content.lastIndexOf('            </div>', leftColEndIdx);

// Adjust indentation for unlock card
let formattedUnlock = unlockCardHTML.split('\n').map(line => '  ' + line).join('\n'); // Add 2 spaces

content = content.substring(0, leftColInsertIdx) + formattedUnlock + '\n' + content.substring(leftColInsertIdx);

fs.writeFileSync(path, content, 'utf8');
console.log("Moved Unlock card to left column!");
