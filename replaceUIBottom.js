const fs = require('fs');

const path = 'artifacts/soulmatch/src/pages/profile-user.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Remove the Tips & Upsell Grid from the right column
const removeStart = content.indexOf('{/* Tips & Upsell Grid */}');
const removeEndTag = '</motion.div>\n                      </div>';
const removeEnd = content.indexOf(removeEndTag, removeStart);

if (removeStart === -1 || removeEnd === -1) {
    console.error("Could not find Tips & Upsell Grid to remove.");
    process.exit(1);
}

// Remove this block
content = content.substring(0, removeStart) + content.substring(removeEnd + removeEndTag.length);

// 2. Insert the new full-width Bottom Section
// We insert it right before the closing tag of the main grid
const insertTag = '            </div>\n          </div>\n        )}\n      </div>';
const insertIdx = content.indexOf(insertTag);

if (insertIdx === -1) {
    console.error("Could not find insertion point for bottom section.");
    process.exit(1);
}

const bottomSection = `            </div>

            {/* Bottom 3 Cards Section (Full Width) */}
            {!compLoading && compatibilityData && (
              (() => {
                const data = compatibilityData as any;
                const storyBreakdowns = Array.isArray(data.storyBreakdowns) ? data.storyBreakdowns : [];
                
                // Fallback dummy data if no actual data exists (as requested by user mockup reference)
                const defaultFocus = [
                  { name: "Family Values", similarity: 14 },
                  { name: "Career Focus", similarity: 0 },
                  { name: "Personal Growth", similarity: 0 }
                ];
                
                let focusAreas = storyBreakdowns.filter((c: any) => !c.insufficientData && c.similarity < 50);
                if (focusAreas.length === 0) focusAreas = defaultFocus;
                else focusAreas = focusAreas.slice(0, 3);

                return (
                  <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* How You Can Improve This Match */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35 }}
                      className="bg-[#15151A] border border-white/5 rounded-3xl p-5 flex flex-col h-full"
                    >
                      <div className="flex items-center gap-2.5 mb-5">
                        <div className="p-1">
                          <Zap className="w-5 h-5 text-yellow-500" />
                        </div>
                        <h3 className="text-sm font-bold text-white">How You Can Improve This Match</h3>
                      </div>
                      
                      <div className="space-y-4 mb-5 flex-1">
                        <div className="flex gap-3">
                          <div className="bg-[#1C1C24] p-1.5 rounded-lg h-7 shrink-0 flex items-center justify-center">
                            <Users className="w-3.5 h-3.5 text-orange-500" />
                          </div>
                          <div>
                            <div className="font-bold text-xs text-white/90">Learn about each other's family values</div>
                            <div className="text-[10px] text-white/50 mt-0.5">Understanding expectations builds stronger connections.</div>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <div className="bg-[#1C1C24] p-1.5 rounded-lg h-7 shrink-0 flex items-center justify-center">
                            <Briefcase className="w-3.5 h-3.5 text-purple-500" />
                          </div>
                          <div>
                            <div className="font-bold text-xs text-white/90">Share your career goals</div>
                            <div className="text-[10px] text-white/50 mt-0.5">Knowing your ambitions helps you support each other.</div>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <div className="bg-[#1C1C24] p-1.5 rounded-lg h-7 shrink-0 flex items-center justify-center">
                            <Home className="w-3.5 h-3.5 text-blue-500" />
                          </div>
                          <div>
                            <div className="font-bold text-xs text-white/90">Talk about your daily routine</div>
                            <div className="text-[10px] text-white/50 mt-0.5">Similar lifestyles lead to better understanding.</div>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <div className="bg-[#1C1C24] p-1.5 rounded-lg h-7 shrink-0 flex items-center justify-center">
                            <Target className="w-3.5 h-3.5 text-yellow-500" />
                          </div>
                          <div>
                            <div className="font-bold text-xs text-white/90">Discover common interests</div>
                            <div className="text-[10px] text-white/50 mt-0.5">Shared hobbies can bring you closer.</div>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <div className="bg-[#1C1C24] p-1.5 rounded-lg h-7 shrink-0 flex items-center justify-center">
                            <MessageCircle className="w-3.5 h-3.5 text-purple-400" />
                          </div>
                          <div>
                            <div className="font-bold text-xs text-white/90">Keep the conversation going</div>
                            <div className="text-[10px] text-white/50 mt-0.5">The more you talk, the better it gets!</div>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Focus Areas to Improve */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.38 }}
                      className="bg-[#15151A] border border-white/5 rounded-3xl p-5 flex flex-col h-full"
                    >
                      <div className="flex items-center gap-2.5 mb-5">
                        <div className="p-1">
                          <Star className="w-5 h-5 text-yellow-500" />
                        </div>
                        <h3 className="text-sm font-bold text-white">Focus Areas to Improve</h3>
                      </div>
                      
                      <div className="space-y-4 mb-5 flex-1">
                        {focusAreas.map((area: any, i: number) => {
                          const icon = area.name.includes("Family") ? <Users className="w-3.5 h-3.5 text-purple-500" /> 
                            : area.name.includes("Career") ? <Briefcase className="w-3.5 h-3.5 text-yellow-500" />
                            : <Zap className="w-3.5 h-3.5 text-blue-500" />;
                          
                          return (
                            <div key={i} className="flex items-center gap-3">
                              <div className="bg-[#1C1C24] p-1.5 rounded-lg h-7 shrink-0 flex items-center justify-center">
                                {icon}
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between items-center mb-1">
                                  <div className="font-bold text-xs text-white/90">{area.name}</div>
                                  <div className="text-xs text-white/70">{area.similarity}%</div>
                                </div>
                                <div className="h-1 bg-white/5 rounded-full overflow-hidden w-full">
                                  <div className="h-full bg-pink-500" style={{ width: \`\${area.similarity}%\` }}></div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="bg-pink-500/5 border border-pink-500/20 rounded-xl p-3 flex gap-2.5 mt-auto">
                        <Heart className="w-5 h-5 text-pink-500 shrink-0" />
                        <div>
                          <div className="text-[10px] text-white/70 leading-tight">
                            <span className="text-pink-500 font-bold mr-1">Tip:</span> 
                            Complete more stories and answer daily questions to unlock deeper insights and improve your match score.
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Unlock Full Compatibility Insights */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="bg-[#15151A] border border-white/5 rounded-3xl p-5 flex flex-col h-full"
                    >
                      <div className="flex items-center gap-2.5 mb-3">
                        <div className="p-1">
                          <Lock className="w-5 h-5 text-orange-500" />
                        </div>
                        <h3 className="text-sm font-bold text-orange-500">Unlock Full Compatibility Insights</h3>
                      </div>
                      
                      <p className="text-xs text-white/90 mb-4 font-semibold">Get complete access to detailed insights</p>
                      
                      <div className="space-y-2 mb-5 flex-1">
                        <div className="flex gap-2.5 items-start">
                          <div className="bg-pink-500 rounded-full p-0.5 shrink-0 mt-0.5">
                            <Check className="w-2.5 h-2.5 text-white" />
                          </div>
                          <div className="font-bold text-xs text-white/80">Detailed personality & values comparison</div>
                        </div>
                        <div className="flex gap-2.5 items-start">
                          <div className="bg-pink-500 rounded-full p-0.5 shrink-0 mt-0.5">
                            <Check className="w-2.5 h-2.5 text-white" />
                          </div>
                          <div className="font-bold text-xs text-white/80">Strengths & differences analysis</div>
                        </div>
                        <div className="flex gap-2.5 items-start">
                          <div className="bg-pink-500 rounded-full p-0.5 shrink-0 mt-0.5">
                            <Check className="w-2.5 h-2.5 text-white" />
                          </div>
                          <div className="font-bold text-xs text-white/80">Communication style insights</div>
                        </div>
                        <div className="flex gap-2.5 items-start">
                          <div className="bg-pink-500 rounded-full p-0.5 shrink-0 mt-0.5">
                            <Check className="w-2.5 h-2.5 text-white" />
                          </div>
                          <div className="font-bold text-xs text-white/80">Match improvement roadmap</div>
                        </div>
                        <div className="flex gap-2.5 items-start">
                          <div className="bg-pink-500 rounded-full p-0.5 shrink-0 mt-0.5">
                            <Check className="w-2.5 h-2.5 text-white" />
                          </div>
                          <div className="font-bold text-xs text-white/80">Conversation starters & topic suggestions</div>
                        </div>
                        <div className="flex gap-2.5 items-start">
                          <div className="bg-pink-500 rounded-full p-0.5 shrink-0 mt-0.5">
                            <Check className="w-2.5 h-2.5 text-white" />
                          </div>
                          <div className="font-bold text-xs text-white/80">Deeper compatibility breakdown</div>
                        </div>
                      </div>

                      <div className="mt-auto">
                        <Button className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white border-0 py-5 text-base relative overflow-hidden group rounded-xl">
                          <span className="relative z-10 flex w-full items-center justify-center font-bold">
                            <span>Unlock Now</span>
                            <span className="absolute right-3 bg-white text-pink-600 px-2 py-0.5 rounded-md text-[10px] font-bold">
                              ₹99
                            </span>
                          </span>
                        </Button>
                        <div className="text-center mt-2 text-[9px] text-white/40 font-medium">
                          One-time payment • Secure & Private
                        </div>
                      </div>
                    </motion.div>
                  </div>
                );
              })()
            )}
          </div>
        )}
      </div>`;

content = content.substring(0, insertIdx) + bottomSection + content.substring(insertIdx + insertTag.length);

fs.writeFileSync(path, content, 'utf8');
console.log("Bottom UI replaced successfully!");
