const fs = require('fs');

const path = 'artifacts/soulmatch/src/pages/profile-user.tsx';
let content = fs.readFileSync(path, 'utf8');

// Find the start and end of Public Story Preview
const startMarker = '              {/* Public Story Preview */}';
const startIdx = content.indexOf(startMarker);

const endMarker = '              {/* How You Can Improve This Match */}';
let endIdx = content.indexOf(endMarker);

if (startIdx === -1 || endIdx === -1) {
    console.error("Could not find Story Preview bounds.");
    process.exit(1);
}

const replacement = `              {/* Shared Interests */}
              {p.interests && Array.isArray(p.interests) && p.interests.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="bg-[#15151A] border border-white/5 rounded-3xl p-5"
                >
                  <div className="flex items-center gap-2.5 mb-5">
                    <Star className="w-4 h-4 text-orange-500" />
                    <h2 className="font-bold text-white text-sm">
                      Shared Interests
                    </h2>
                  </div>
                  <div className="flex flex-wrap gap-2.5 mb-6">
                    {p.interests.map((interest: string, i: number) => {
                      // Try to map some common interests to icons, otherwise use a generic Hash
                      const name = (typeof interest === 'string' ? interest : (interest as any).name || '').toLowerCase();
                      let Icon = Hash;
                      if (name.includes('read') || name.includes('book')) Icon = Book;
                      else if (name.includes('travel') || name.includes('trip')) Icon = Globe;
                      else if (name.includes('fit') || name.includes('gym') || name.includes('workout')) Icon = Activity;
                      else if (name.includes('music') || name.includes('song')) Icon = HeartPulse; // Placeholder
                      else if (name.includes('photo') || name.includes('camera')) Icon = Target; // Placeholder
                      else if (name.includes('coffee') || name.includes('food')) Icon = Flame; // Placeholder

                      return (
                        <div
                          key={i}
                          className="px-3 py-2 rounded-[14px] bg-[#1C1C24] border border-white/5 text-xs text-white/90 font-medium flex items-center gap-2 hover:bg-white/5 transition-colors cursor-default"
                        >
                          <Icon className="w-3.5 h-3.5 text-white/40" />
                          {typeof interest === 'string' ? interest : (interest as any).name || 'Interest'}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-white/5">
                    <span className="text-[10px] text-white/50">{p.interests.length} Common Interests</span>
                    <Heart className="w-3.5 h-3.5 text-pink-600" />
                  </div>
                </motion.div>
              )}
`;

content = content.substring(0, startIdx) + replacement + content.substring(endIdx);

// I should also import Hash if it's not imported
if (!content.includes('Hash,')) {
    content = content.replace('import {', 'import {\n  Hash,');
}

fs.writeFileSync(path, content, 'utf8');
console.log("Replaced Story Preview with Shared Interests!");
