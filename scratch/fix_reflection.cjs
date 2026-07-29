const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'artifacts', 'soulmatch', 'src', 'pages', 'dashboard.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// We want to replace the Today's Reflection Preview Card block starting from Today's Reflection Preview Card comment down to the next comment or div
const startMarker = "{/* 3. Today's Reflection Preview Card */}";
const startIndex = content.indexOf(startMarker);
if (startIndex === -1) {
  console.error("Could not find start marker");
  process.exit(1);
}

const endMarker = "{/* 5. Personality Analysis */}";
const endIndex = content.indexOf(endMarker);
if (endIndex === -1) {
  console.error("Could not find end marker");
  process.exit(1);
}

const before = content.substring(0, startIndex);
const after = content.substring(endIndex);

const newCardContent = `{/* 3. Today's Reflection Preview Card */}
        {(() => {
           const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
           const dToday = new Date();
           const last7: { label: string; dateStr: string }[] = Array.from({ length: 7 }, (_, i) => {
             const d = new Date(dToday);
             d.setDate(dToday.getDate() - (6 - i));
             const dateStr = d.toISOString().split("T")[0];
             return { dateStr };
           });

           const historyMap = new Map<string, string>();
           history.forEach((h: any) => historyMap.set(h.date, h.answer));
           
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
                                {isAnswered ? "View Reflection" : "Write Reflection"} <ArrowRight className="w-3.5 h-3.5 ml-1" />
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
        })()}`;

fs.writeFileSync(filePath, before + newCardContent + after, 'utf8');
console.log("Replaced successfully!");
