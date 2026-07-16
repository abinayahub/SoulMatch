const fs = require('fs');
const file = 'src/pages/profile-user.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Extract Profile Card
const profileCardStartStr = '{/* Profile Card */}';
const profileCardEndStr = '              {(user?.role === "premium" || user?.role === "admin") && ('.replace(/"/g, "'");
const profileCardStart = content.indexOf(profileCardStartStr);
const profileCardEnd = content.indexOf(profileCardEndStr);

let profileCardJSX = content.substring(profileCardStart, profileCardEnd);
profileCardJSX = profileCardJSX.replace(/<motion\\.div[\\s\\S]*?className="bg-card border border-border rounded-3xl p-5 relative"/, '<div className="flex-1 flex flex-col justify-between"');
const lastMotionDivIdxProfile = profileCardJSX.lastIndexOf('</motion.div>');
profileCardJSX = profileCardJSX.substring(0, lastMotionDivIdxProfile) + '</div>\\n' + profileCardJSX.substring(lastMotionDivIdxProfile + 13);


// 2. Extract Profile Comparison
const compStartStr = '<div className="flex justify-between items-center mb-2 px-1">\\n                         <h1 className="text-2xl font-bold text-foreground">Profile Comparison</h1>';
const compEndStr = '</div>\\n                        </div>\\n                      </motion.div>';

const compStart = content.indexOf(compStartStr);
const compEnd = content.indexOf(compEndStr) + compEndStr.length;

let compJSX = content.substring(compStart, compEnd);
compJSX = compJSX.replace(/<motion\\.div[\\s\\S]*?className="bg-card border border-border rounded-3xl p-6 relative overflow-hidden"/, '<div className="flex-1 flex flex-col justify-between mt-6 lg:mt-0 lg:pl-6 lg:border-l lg:border-border"');
const lastMotionDivIdxComp = compJSX.lastIndexOf('</motion.div>');
compJSX = compJSX.substring(0, lastMotionDivIdxComp) + '</div>\\n' + compJSX.substring(lastMotionDivIdxComp + 13);

// Remove the header completely from compJSX
const popoverEnd = compJSX.indexOf('</Popover>') + 10;
compJSX = compJSX.substring(popoverEnd);
compJSX = compJSX.replace(/^\\s*<\\/div>/m, ''); // remove the closing div of the header


// 3. Create Unified Hero
const unifiedHero = `
          {/* Unified Hero Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-3xl p-6 lg:p-8 relative overflow-hidden mb-8 shadow-sm flex flex-col lg:flex-row gap-6"
          >
            \${profileCardJSX}
            \${compJSX}
          </motion.div>
`;

// 4. Modify original string
content = content.substring(0, compStart) + content.substring(compEnd);

// Instead of putting unifiedHero where profileCard was (which is inside the left column),
// we must put it BEFORE the grid container!
// Let's find the grid container start
const gridContainerStartStr = '<div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">';
const gridContainerStart = content.indexOf(gridContainerStartStr);

content = content.substring(0, gridContainerStart) + unifiedHero + '\\n          ' + content.substring(gridContainerStart);

// Now remove the original profileCardJSX from inside the grid!
content = content.replace(content.substring(content.indexOf(profileCardStartStr), content.indexOf(profileCardEndStr)), '');

fs.writeFileSync(file, content);
console.log('Successfully combined hero cards');
