const fs = require('fs');
const file = 'artifacts/soulmatch/src/pages/profile-user.tsx';
let content = fs.readFileSync(file, 'utf8');

const profileCardStartStr = '{/* Profile Card */}';
const profileCardEndStr = '              {(user?.role === "premium" || user?.role === "admin") && ('.replace(/"/g, "'");

let profileCardJSX = content.substring(
  content.indexOf(profileCardStartStr), 
  content.indexOf(profileCardEndStr)
);

const firstMotionDiv = profileCardJSX.indexOf('<motion.div');
const firstMotionDivEnd = profileCardJSX.indexOf('>', firstMotionDiv) + 1;
profileCardJSX = profileCardJSX.substring(0, firstMotionDiv) + '<div className="flex-1 flex flex-col w-full relative">' + profileCardJSX.substring(firstMotionDivEnd);

const lastMotionDiv = profileCardJSX.lastIndexOf('</motion.div>');
profileCardJSX = profileCardJSX.substring(0, lastMotionDiv) + '</div>\\n' + profileCardJSX.substring(lastMotionDiv + 13);

const compStartStr = '<div className="flex justify-between items-center mb-2 px-1">\\n                         <h1 className="text-2xl font-bold text-foreground">Profile Comparison</h1>';
const compEndStr = '</div>\\n                        </div>\\n                      </motion.div>';
const compStart = content.indexOf(compStartStr);
const compEnd = content.indexOf(compEndStr) + compEndStr.length;

let compJSX = content.substring(compStart, compEnd);

const compMotionDiv = compJSX.indexOf('<motion.div');
const compMotionDivEnd = compJSX.indexOf('>', compMotionDiv) + 1;
compJSX = compJSX.substring(0, compMotionDiv) + '<div className="flex-1 w-full lg:border-l lg:border-border lg:pl-10 flex flex-col justify-center relative mt-8 lg:mt-0 pt-8 lg:pt-0 border-t lg:border-t-0 border-border">' + compJSX.substring(compMotionDivEnd);

const compLastMotionDiv = compJSX.lastIndexOf('</motion.div>');
compJSX = compJSX.substring(0, compLastMotionDiv) + '</div>\\n' + compJSX.substring(compLastMotionDiv + 13);

const popoverEnd = compJSX.indexOf('</Popover>') + 10;
compJSX = compJSX.substring(popoverEnd);
const firstDivEnd = compJSX.indexOf('</div>') + 6;
compJSX = compJSX.substring(firstDivEnd);

const unifiedHero = `
          {/* Unified Hero Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-3xl p-6 lg:p-10 relative overflow-hidden mb-8 shadow-sm flex flex-col lg:flex-row gap-8 lg:gap-10 items-stretch justify-between"
          >
            \${profileCardJSX}
            \${compJSX}
          </motion.div>
`;

content = content.substring(0, compStart) + content.substring(compEnd);
content = content.replace(content.substring(content.indexOf(profileCardStartStr), content.indexOf(profileCardEndStr)), '');

const gridStartStr = '<div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">';
const gridStart = content.indexOf(gridStartStr);
content = content.substring(0, gridStart) + unifiedHero + '\\n          ' + content.substring(gridStart);

fs.writeFileSync(file, content);
console.log('Successfully merged!');
