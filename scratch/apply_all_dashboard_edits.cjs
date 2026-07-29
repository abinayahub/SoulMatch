const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'artifacts', 'soulmatch', 'src', 'pages', 'dashboard.tsx');

// Reset the file first to clean checkout state
const execSync = require('child_process').execSync;
execSync('git checkout "' + filePath + '"');

let content = fs.readFileSync(filePath, 'utf8');

// 1. Declare analysisProgressPercent at top of component scope
const insertMarker = "const answeredQuestions = (journeyProgress as any)?.answeredQuestions || 0;";
content = content.replace(
  insertMarker,
  `const answeredQuestions = (journeyProgress as any)?.answeredQuestions || 0;\n  const analysisProgressPercent = Math.min(100, Math.round((answeredQuestions / 150) * 100));`
);

// 2. Redesign Top Header Premium Hero Card
content = content.replace('className="relative w-full rounded-2xl overflow-hidden mb-2', 'className="relative w-full overflow-hidden mb-4 glass');
content = content.replace('bg-[#FF429A]/10 dark:bg-[#FF429A]/20 blur-[20px] rounded-full', 'bg-[#E5772E]/10 dark:bg-[#E5772E]/20 blur-[20px] rounded-full');
content = content.replace('bg-[#9B4DFF]/10 dark:bg-[#9B4DFF]/20 blur-[15px] rounded-full', 'bg-[#FAC985]/10 dark:bg-[#FAC985]/20 blur-[15px] rounded-full');
content = content.replace('text-[#FF429A]/30 dark:text-[#FF429A]/40', 'text-[#E5772E]/30 dark:text-[#E5772E]/40');
content = content.replace('text-[#1A1A1A] dark:text-[#F3F4F6]', 'text-[#7A2D13] dark:text-[#F3F4F6]');
content = content.replace('text-[#FF2D88] dark:text-[#FF429A] truncate', 'text-[#CC3917] truncate');
content = content.replace('Every answer brings you closer to someone who truly understands you. 💜', 'Every answer brings you closer to someone who truly understands you. ✨');

// 3. Redesign Your 30-Day Journey Card container
content = content.replace(
  'bg-card border border-border/80 dark:border-white/15 border-black/15 rounded-2xl p-4 shadow-sm relative overflow-hidden',
  'glass p-5 mb-4 relative overflow-hidden'
);
content = content.replace('text-pink-500 font-bold hover:underline cursor-pointer">View Journey', 'text-[#E5772E] font-bold hover:underline cursor-pointer">View Journey');
content = content.replace('stroke-pink-500 fill-none drop-shadow-[0_0_6px_rgba(236,72,153,0.4)]', 'stroke-[#E5772E] fill-none drop-shadow-[0_0_6px_rgba(229,119,46,0.4)]');
content = content.replace(
  "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md shadow-pink-500/30 border border-pink-400/50",
  "bg-gradient-to-r from-[#E5772E] to-[#CC3917] text-white shadow-md shadow-[#E5772E]/30 border border-[#E5772E]/50"
);
content = content.replace('border-pink-500/90 bg-pink-500/25 flex items-center justify-center shadow-md shadow-pink-500/20 shrink-0', 'border-[#E5772E]/90 bg-[#E5772E]/25 flex items-center justify-center shadow-md shadow-[#E5772E]/20 shrink-0');
content = content.replace(
  'bg-pink-500 text-white text-[7.5px] xs:text-[8px] font-black px-1 rounded-full leading-none py-0.5 border border-background shadow-sm',
  'bg-[#E5772E] text-white text-[7.5px] xs:text-[8px] font-black px-1 rounded-full leading-none py-0.5 border border-background shadow-sm'
);
content = content.replace(
  /Answer Today's 5 Questions[\s\S]*?<\/div>/,
  `Answer Today's 5 Questions &gt;\n              </Button>`
);
content = content.replace(
  /<div className="w-full bg-pink-500 hover:bg-pink-600 text-white rounded-xl font-bold h-10 text-xs flex items-center justify-center transition-colors shadow-sm">/,
  `<Button className="w-full">`
);

// 4. Redesign Today's Reflection Preview Card to the simpler design with circular progress
const reflectionStart = content.indexOf("{/* 3. Today's Reflection Preview Card */}");
const reflectionEnd = content.indexOf("{/* 5. Personality Analysis */}");
if (reflectionStart !== -1 && reflectionEnd !== -1) {
  const newReflectionCard = `{/* 3. Today's Reflection Preview Card */}
        {(() => {
           const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
           const dToday = new Date();
           const last7 = Array.from({ length: 7 }, (_, i) => {
             const d = new Date(dToday);
             d.setDate(dToday.getDate() - (6 - i));
             const dateStr = d.toISOString().split("T")[0];
             return { label: days[d.getDay() === 0 ? 6 : d.getDay() - 1], dateStr };
           });

           const historyMap = new Map();
           history.forEach((h) => historyMap.set(h.date, h.answer));
           
           const completedThisWeek = last7.filter((d) => historyMap.has(d.dateStr)).length;
           
           const isAnswered = reflectionToday?.answered === true;
           const hasQuestion = reflectionToday?.answered === false && !!reflectionToday?.question;
           const isLoading = !reflectionToday;

           return (
              <div className="glass p-5 mb-4 flex items-center justify-between gap-4">
                 {/* Left Section */}
                 <div className="flex-1 min-w-0">
                    <div className="flex gap-3">
                       <div className="w-10 h-10 rounded-full bg-[#E5772E]/10 flex items-center justify-center shrink-0">
                          <Heart className="w-5 h-5 text-[#E5772E] fill-[#E5772E]" />
                       </div>
                       <div className="min-w-0">
                          <h3 className="text-sm font-bold text-foreground leading-tight">Today's Reflection</h3>
                          <p className="text-[11px] text-[#8B8177] dark:text-[#9CA3AF] font-medium mt-1 leading-snug">
                             {isAnswered ? "You've completed today's reflection." : "Write your thoughts and understand yourself better."}
                          </p>
                          <Link href="/reflection" className="block w-fit mt-3">
                             <Button className="h-9 text-xs rounded-full px-4 font-bold flex items-center justify-center w-fit">
                                {isAnswered ? "View Reflection" : "Write Reflection"} <ChevronRight className="w-3.5 h-3.5 ml-1" />
                             </Button>
                          </Link>
                       </div>
                    </div>
                 </div>

                 {/* Right Section: Circular Progress */}
                 <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                    <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                       <circle cx="32" cy="32" r="28" className="stroke-white/30 fill-none" strokeWidth="4" />
                       <circle cx="32" cy="32" r="28" className="stroke-[#E5772E] fill-none" strokeWidth="4" strokeDasharray="176" strokeDashoffset={176 - (completedThisWeek / 7) * 176} strokeLinecap="round" />
                    </svg>
                    <div className="flex flex-col items-center">
                       <span className="text-[11px] font-black text-foreground leading-none">{completedThisWeek}/7</span>
                       <span className="text-[7px] font-bold text-foreground/60 mt-0.5 text-center leading-none">This Week</span>
                    </div>
                 </div>
              </div>
           );
        })()}
        
        `;
  content = content.substring(0, reflectionStart) + newReflectionCard + content.substring(reflectionEnd);
} else {
  console.log("Reflection markers not found.");
}

// 5. Redesign Personality Analysis to Personality Journey (Robust index replacement)
const personalityNew = `        {/* 5. Personality Journey */}
        <div className="glass p-5 mb-4 flex items-center justify-between gap-4">
           {/* Left Section */}
           <div className="flex-1 min-w-0">
              <div className="flex gap-3">
                 <div className="w-10 h-10 rounded-full bg-[#E5772E]/10 flex items-center justify-center shrink-0">
                    <Brain className="w-5.5 h-5.5 text-[#E5772E]" />
                 </div>
                 <div className="min-w-0">
                    <h3 className="text-sm font-bold text-foreground leading-tight">Personality Journey</h3>
                    <p className="text-[11px] text-[#8B8177] dark:text-[#9CA3AF] font-medium mt-1 leading-snug">
                       Your personality profile is growing with every question.
                    </p>
                    <div 
                       onClick={() => navigate("/personality")}
                       className="text-[#E5772E] hover:text-[#CC3917] font-bold hover:underline cursor-pointer flex items-center gap-1 mt-3 text-xs select-none w-fit"
                    >
                       View Full Analysis <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                 </div>
              </div>
           </div>

           {/* Right Section: Circular Progress */}
           <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
              <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                 <circle cx="32" cy="32" r="28" className="stroke-white/30 fill-none" strokeWidth="4" />
                 <circle cx="32" cy="32" r="28" className="stroke-[#E5772E] fill-none" strokeWidth="4" strokeDasharray="176" strokeDashoffset={176 - (analysisProgressPercent / 100) * 176} strokeLinecap="round" />
              </svg>
              <div className="flex flex-col items-center">
                 <span className="text-[11px] font-black text-foreground leading-none">{analysisProgressPercent}%</span>
                 <span className="text-[7px] font-bold text-foreground/60 mt-0.5 text-center leading-none">Progress</span>
              </div>
           </div>
        </div>`;

const pStart = content.indexOf("{/* 5. Personality Analysis */}");
const pEnd = content.indexOf("{/* 6. Quick Actions */}");
if (pStart !== -1 && pEnd !== -1) {
  content = content.substring(0, pStart) + personalityNew + "\n\n        " + content.substring(pEnd);
} else {
  console.log("Personality card markers not found.");
}

// 6. Redesign Quick Actions
content = content.replace('{ icon: Search, label: "Discover", color: "text-pink-500", bg: "bg-pink-500/10", path: "/discover" }', '{ icon: Search, label: "Discover", color: "text-[#E5772E]", bg: "bg-[#E5772E]/10", path: "/discover" }');
content = content.replace('{ icon: Heart, label: "Matches", color: "text-rose-500", bg: "bg-rose-500/10", path: "/matches" }', '{ icon: Heart, label: "Matches", color: "text-[#EB8D3A]", bg: "bg-[#EB8D3A]/10", path: "/matches" }');
content = content.replace('{ icon: MessageCircle, label: "Chat", color: "text-green-500", bg: "bg-green-500/10", badge: unreadChatCount > 0 ? unreadChatCount.toString() : undefined, path: "/chat" }', '{ icon: MessageCircle, label: "Chat", color: "text-green-600", bg: "bg-green-500/10", badge: unreadChatCount > 0 ? unreadChatCount.toString() : undefined, path: "/chat" }');
content = content.replace('{ icon: Eye, label: "Profile", color: "text-blue-500", bg: "bg-blue-500/10", path: "/profile" }', '{ icon: User, label: "Profile", color: "text-blue-500", bg: "bg-blue-500/10", path: "/profile" }');

content = content.replace(
  'className="flex items-center justify-center gap-1 p-1.5 px-2 rounded-full bg-card border border-border/40 hover:border-border transition-all cursor-pointer shadow-sm flex-1 min-w-0 relative"',
  'className="flex items-center justify-center gap-1 p-1.5 px-2 rounded-full bg-white/40 border border-white/30 hover:border-white/50 transition-all cursor-pointer shadow-sm flex-1 min-w-0 relative active:scale-[0.98]"'
);
content = content.replace('bg-pink-500 rounded-full flex items-center justify-center text-[7px] font-bold text-white shadow-sm">', 'bg-[#CC3917] rounded-full flex items-center justify-center text-[7px] font-bold text-white shadow-sm">');

// 7. Redesign Top Matches View All Link, unlocking matches and match items
content = content.replace('text-pink-500 uppercase tracking-wider hover:underline cursor-pointer">View All', 'text-[#E5772E] uppercase tracking-wider hover:underline cursor-pointer">View All');
content = content.replace('bg-pink-500/10 rounded-full flex items-center justify-center mb-4', 'bg-[#E5772E]/10 rounded-full flex items-center justify-center mb-4');
content = content.replace('text-pink-500" />', 'text-[#E5772E]" />');
content = content.replace('bg-card border border-border/40 rounded-[1.5rem] p-6 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] flex flex-col items-center justify-center', 'glass p-6 text-center flex flex-col items-center justify-center');
content = content.replace(
  `<Link href="/journey">
                          <Button className="h-10 text-xs bg-gradient-to-r from-pink-500 to-[#9B4DFF] hover:opacity-90 rounded-full px-8 font-bold text-white shadow-lg">
                             Start Journey
                          </Button>
                        </Link>`,
  `<Link href="/journey" className="w-full">
                          <Button className="w-full">
                             Start Journey
                          </Button>
                        </Link>`
);
content = content.replace('bg-card border border-border/40 relative overflow-hidden active:scale-[0.98] transition-transform shadow-[0_4px_12px_rgb(0,0,0,0.05)] cursor-pointer group', 'bg-white/40 border border-white/30 relative overflow-hidden active:scale-[0.98] transition-transform shadow-[0_8px_24px_rgba(0,0,0,0.05)] cursor-pointer group');
content = content.replace('bg-pink-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider shadow-md', 'bg-[#E5772E] text-white text-[7px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider shadow-md');

fs.writeFileSync(filePath, content, 'utf8');
console.log("Success!");
