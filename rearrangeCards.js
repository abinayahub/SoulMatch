const fs = require('fs');

const path = 'artifacts/soulmatch/src/pages/profile-user.tsx';
let content = fs.readFileSync(path, 'utf8');

// --- 1. Extract Cards ---
function extractBlock(markerStart, markerEnd, source) {
    const s = source.indexOf(markerStart);
    if (s === -1) return null;
    const e = source.indexOf(markerEnd, s);
    if (e === -1) return null;
    return source.substring(s, e + markerEnd.length);
}

const card1 = extractBlock('                    {/* How You Can Improve This Match */}\n                    <motion.div', '</motion.div>', content);
const card2 = extractBlock('                    {/* Focus Areas to Improve */}\n                    <motion.div', '</motion.div>', content);
const card3 = extractBlock('                    {/* Unlock Full Compatibility Insights */}\n                    <motion.div', '</motion.div>', content);

if (!card1 || !card2 || !card3) {
    console.error("Could not extract cards.");
    process.exit(1);
}

const focusLogicStr = `                // Fallback dummy data if no actual data exists (as requested by user mockup reference)
                const defaultFocus = [
                  { name: "Family Values", similarity: 14 },
                  { name: "Career Focus", similarity: 0 },
                  { name: "Personal Growth", similarity: 0 }
                ];
                
                let focusAreas = storyBreakdowns.filter((c: any) => !c.insufficientData && c.similarity < 50);
                if (focusAreas.length === 0) focusAreas = defaultFocus;
                else focusAreas = focusAreas.slice(0, 3);`;


// Remove the entire bottom section
const bottomStartMarker = '            {/* Bottom 3 Cards Section (Full Width) */}';
const startToRemove = content.lastIndexOf(bottomStartMarker);
const endTag = '          </div>\n        )}\n      </div>\n    </AppLayout>';
const endIdx = content.indexOf(endTag);
if (startToRemove === -1 || endIdx === -1) {
    console.error("Could not find boundaries for removal.");
    process.exit(1);
}
content = content.substring(0, startToRemove) + content.substring(endIdx);


// Insert Card 1 into Left Column
const leftColEndMarker = '            {/* Right Column: Insights */}';
const leftColEndIdx = content.indexOf(leftColEndMarker);
if (leftColEndIdx === -1) {
    console.error("Could not find left column end.");
    process.exit(1);
}
const leftColInsertIdx = content.lastIndexOf('            </div>', leftColEndIdx);
const formattedCard1 = card1.replace(/ {20}/g, '              ');
content = content.substring(0, leftColInsertIdx) + formattedCard1 + '\n' + content.substring(leftColInsertIdx);


// Insert Cards 2 & 3 into Right Column
// The right column ends with:
//                       </motion.div>
//                       
//                     </div>
//                   );
//                 })()
// We'll use a regex to find this safely.
const rightColEndRegex = /<\/motion\.div>\s+<\/div>\s+\);\s+}\)\(\)/;
const match = content.match(rightColEndRegex);
if (!match) {
    console.error("Could not find right column end using regex.");
    process.exit(1);
}

const insertLogicMarker = 'const storyBreakdowns = Array.isArray(data.storyBreakdowns)\n                    ? data.storyBreakdowns\n                    : [];';
const insertLogicIdx = content.indexOf(insertLogicMarker) + insertLogicMarker.length;
content = content.substring(0, insertLogicIdx) + '\n\n' + focusLogicStr.replace(/ {16}/g, '                  ') + content.substring(insertLogicIdx);

// Find right column end again since indices shifted
const match2 = content.match(rightColEndRegex);
const rightColEndIdx2 = match2.index;

const rightBottomGrid = `</motion.div>

                      {/* 2-Column Tips Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
${card2.replace(/ {20}/g, '                        ')}
${card3.replace(/ {20}/g, '                        ')}
                      </div>
                    </div>
                  );
                })()`;

content = content.substring(0, rightColEndIdx2) + rightBottomGrid + content.substring(rightColEndIdx2 + match2[0].length);

fs.writeFileSync(path, content, 'utf8');
console.log("Layout restructured successfully with regex!");
