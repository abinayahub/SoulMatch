const fs = require('fs');
const path = 'c:/Users/91638/Downloads/Soul-Match-AI/Soul-Match-AI/artifacts/soulmatch/src/pages/dashboard.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Insert state for the dashboard mood
const hookStr = `  const [dashboardMood, setDashboardMood] = useState<string | null>(null);`;
if (!content.includes('dashboardMood')) {
  content = content.replace(
    '  const { data: personalityProfile } = useGetPersonalityProfile',
    hookStr + '\n  const { data: personalityProfile } = useGetPersonalityProfile'
  );
}

// 2. Replace the Left Column content
const startTag = `            {/* Left Column (2/3): Today's Question */}`;
const endTag = `            {/* Right Column (1/3): Journey Progress */}`;

const startIndex = content.indexOf(startTag);
const endIndex = content.indexOf(endTag);

if (startIndex !== -1 && endIndex !== -1) {
  const replacement = `            {/* Left Column (2/3): Today's Reflection */}
            <div className="xl:col-span-2 bg-[#11111a] border border-white/5 rounded-[2rem] p-6 lg:p-8 flex flex-col relative overflow-hidden">
               <div className="w-full flex items-center justify-between mb-2">
                 <div>
                   <h3 className="text-xl font-bold flex items-center gap-2 text-white">Today's Reflection <Heart className="w-5 h-5 fill-pink-500 text-pink-500" /></h3>
                   <p className="text-white/50 text-sm mt-1">A quick daily check-in to stay connected with yourself.</p>
                 </div>
                 {dailyPollQuery.data?.isLocked && dailyPollQuery.data?.unlockedAt && (
                   <span className="text-xs text-pink-500 font-medium bg-pink-500/10 px-3 py-1.5 rounded-full flex items-center gap-1">
                     <Clock className="w-3.5 h-3.5" /> Next reflection in <CountdownTimer targetDate={dailyPollQuery.data.unlockedAt} />
                   </span>
                 )}
               </div>
               
               <div className="flex-1 flex flex-col md:flex-row mt-6 gap-8 z-10 relative">
                 {/* Left side abstract image */}
                 <div className="w-full md:w-1/3 relative rounded-2xl overflow-hidden shrink-0 flex items-center justify-center bg-black/40 min-h-[160px]">
                   <div className="absolute inset-0 bg-gradient-to-br from-pink-500/30 to-purple-600/30 mix-blend-overlay"></div>
                   {/* We simulate the blob with CSS gradients and a nice image */}
                   <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-screen" alt="Reflection Blob" />
                   <div className="absolute inset-0 bg-gradient-to-t from-[#11111a] to-transparent opacity-80" />
                   <Smile className="w-16 h-16 text-pink-400 absolute opacity-80 animate-pulse" />
                 </div>

                 {/* Right side question & moods */}
                 <div className="flex-1 flex flex-col justify-center w-full">
                    
                    {dailyPollQuery.isLoading ? (
                      <div className="flex-1 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
                      </div>
                    ) : dailyPollQuery.data?.isLocked ? (
                      <div className="flex-1 flex flex-col items-center justify-center w-full py-4 text-center">
                         <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                           <CheckCircle2 className="w-6 h-6 text-green-500" />
                         </div>
                         <h2 className="text-xl font-bold text-white mb-2">Reflection Complete</h2>
                         <p className="text-white/60 text-sm mb-4">Great job! You've checked in for today.</p>
                         {dailyPollQuery.data?.lastPoll && (
                            <div className="bg-white/5 rounded-xl px-4 py-3 text-center mb-4">
                               <span className="text-white/80 text-sm italic">"{dailyPollQuery.data.lastPoll.question}"</span>
                            </div>
                         )}
                         <Link href="/my-story">
                           <Button className="bg-white/10 hover:bg-white/20 text-white rounded-xl">
                             Go to My Story
                           </Button>
                         </Link>
                      </div>
                    ) : dailyPollQuery.data?.poll ? (
                      <>
                        <h2 className="text-2xl font-bold text-white mb-6 relative inline-block self-start">
                           {dailyPollQuery.data.poll.question}
                           <span className="absolute -bottom-2 left-0 w-1/3 h-1 bg-pink-500 rounded-full shadow-[0_0_8px_rgba(236,72,153,0.8)]"></span>
                           <span className="absolute -bottom-2 left-1/3 w-1/4 h-1 bg-purple-500 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.8)]"></span>
                        </h2>
                        
                        <div className="flex flex-wrap gap-2 lg:gap-3 mb-8">
                           {[
                             { id: "Amazing", emoji: "😃", color: "text-green-500", border: "border-green-500" },
                             { id: "Good", emoji: "🙂", color: "text-blue-500", border: "border-blue-500" },
                             { id: "Okay", emoji: "😐", color: "text-orange-500", border: "border-orange-500" },
                             { id: "Bad", emoji: "☹️", color: "text-purple-500", border: "border-purple-500" },
                             { id: "Exhausting", emoji: "😫", color: "text-red-500", border: "border-red-500" },
                           ].map((mood, i) => (
                             <div 
                               key={i} 
                               onClick={() => setDashboardMood(mood.id)}
                               className={\`flex flex-col items-center justify-center flex-1 min-w-[70px] h-[85px] rounded-2xl bg-black/40 border-2 transition-all cursor-pointer hover:bg-white/5 \${dashboardMood === mood.id ? mood.border + ' shadow-[0_0_15px_rgba(255,255,255,0.1)]' : 'border-white/5'}\`}
                             >
                                <span className="text-2xl lg:text-3xl mb-1">{mood.emoji}</span>
                                <span className={\`text-[10px] lg:text-xs font-semibold \${dashboardMood === mood.id ? mood.color : 'text-white/60'}\`}>{mood.id}</span>
                             </div>
                           ))}
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-between w-full mt-auto gap-4">
                           <div className="flex items-center gap-2 text-white/40 text-[10px] lg:text-xs text-center sm:text-left">
                              <Lock className="w-3.5 h-3.5 shrink-0" />
                              <span>Your response is private. This is not used for compatibility analysis.</span>
                           </div>
                           
                           <Button 
                             disabled={!dashboardMood}
                             onClick={() => {
                               if (dailyPollQuery.data?.poll && dashboardMood) {
                                 submitPollMutation.mutate({ pollId: dailyPollQuery.data.poll.id, answer: dashboardMood });
                               }
                             }}
                             className={\`\${!dashboardMood ? 'opacity-50' : 'hover:opacity-90'} bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl px-6 h-10 shadow-[0_4px_15px_rgba(236,72,153,0.3)] flex items-center gap-2 font-bold shrink-0\`}
                           >
                             Submit Reflection <ChevronRight className="w-4 h-4" />
                           </Button>
                        </div>
                      </>
                    ) : (
                      <div className="flex-1 flex items-center justify-center text-white/50">No poll available</div>
                    )}
                 </div>
               </div>
            </div>
`;
  content = content.substring(0, startIndex) + replacement + '\n' + content.substring(endIndex);
  fs.writeFileSync(path, content, 'utf8');
  console.log('Update complete!');
} else {
  console.log('Could not find boundaries');
}
