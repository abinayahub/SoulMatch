const fs = require('fs');

const path = 'artifacts/soulmatch/src/pages/profile-user.tsx';
let content = fs.readFileSync(path, 'utf8');

// Find the start of the right column
const startTag = '<div className="lg:col-span-7 space-y-6">';
const startIdx = content.indexOf(startTag);

// Find the end div corresponding to the closing tags
const endTag = '            </div>\n          </div>\n        )}\n      </div>\n    </AppLayout>';
const endIdx = content.indexOf(endTag);

if (startIdx === -1 || endIdx === -1) {
  console.log("Could not find start or end bounds.");
  if (startIdx === -1) console.log("Missing start tag");
  if (endIdx === -1) console.log("Missing end tag");
  process.exit(1);
}

const replacement = `<div className="lg:col-span-7 space-y-6">
              {compLoading ? (
                <div className="space-y-6 animate-pulse">
                  <div className="h-64 bg-white/5 rounded-3xl" />
                  <div className="h-48 bg-white/5 rounded-3xl" />
                  <div className="h-48 bg-white/5 rounded-3xl" />
                </div>
              ) : !compatibilityData ? (
                <div className="text-center py-10 text-white/50 bg-white/5 rounded-3xl border border-white/10">
                  <Heart className="w-12 h-12 text-white/20 mx-auto mb-4" />
                  <p>Not enough data to calculate compatibility yet.</p>
                  <p className="text-xs mt-2">Interact more to unlock insights.</p>
                </div>
              ) : (
                (() => {
                  const data = compatibilityData as any;
                  
                  const traitBreakdowns = Array.isArray(data.traitBreakdowns)
                    ? data.traitBreakdowns
                    : [];
                  const storyBreakdowns = Array.isArray(data.storyBreakdowns)
                    ? data.storyBreakdowns
                    : [];

                  const getMatchQuality = (score) => {
                    if (score >= 80) return "High Match";
                    if (score >= 60) return "Moderate Match";
                    if (score >= 40) return "Fair Match";
                    return "Low Match";
                  };

                  const getMatchColor = (score) => {
                    if (score >= 80) return "text-green-400";
                    if (score >= 60) return "text-yellow-400";
                    if (score >= 40) return "text-orange-400";
                    return "text-red-400";
                  };

                  const lifestyleCats = ["Health & Lifestyle", "Social Engagement", "Adventure"];
                  let lifestyleSum = 0;
                  let lifestyleCount = 0;
                  storyBreakdowns.forEach((cat) => {
                    if (lifestyleCats.includes(cat.name) && !cat.insufficientData) {
                      lifestyleSum += cat.similarity;
                      lifestyleCount++;
                    }
                  });
                  const lifestyleMatch =
                    lifestyleCount > 0 ? Math.round(lifestyleSum / lifestyleCount) : 0;
                    
                  const getTraitSubtext = (name) => {
                    const map = {
                      Connection: "Emotional closeness",
                      Stability: "Dependability & consistency",
                      Growth: "Learning & self-improvement",
                      Exploration: "Curiosity & new experiences"
                    };
                    return map[name] || name;
                  };
                  
                  const getTraitIcon = (name) => {
                    const map = {
                      Connection: <Users className="w-4 h-4 text-white/50" />,
                      Stability: <Shield className="w-4 h-4 text-white/50" />,
                      Growth: <TrendingUp className="w-4 h-4 text-white/50" />,
                      Exploration: <Compass className="w-4 h-4 text-white/50" />
                    };
                    return map[name] || <User className="w-4 h-4 text-white/50" />;
                  };

                  const getStorySubtext = (name) => {
                    const map = {
                      "Family Values": "Family & traditions",
                      "Career Focus": "Ambition & goals",
                      "Personal Growth": "Mindset & development",
                      "Health & Lifestyle": "Wellness & habits",
                      "Social Engagement": "Friends & community",
                      "Adventure": "Travel & spontaneity"
                    };
                    return map[name] || name;
                  };

                  const getStoryIcon = (name) => {
                    const map = {
                      "Family Values": <Home className="w-4 h-4 text-white/50" />,
                      "Career Focus": <Briefcase className="w-4 h-4 text-white/50" />,
                      "Personal Growth": <Target className="w-4 h-4 text-white/50" />,
                      "Health & Lifestyle": <HeartPulse className="w-4 h-4 text-white/50" />,
                      "Social Engagement": <Globe className="w-4 h-4 text-white/50" />,
                      "Adventure": <Map className="w-4 h-4 text-white/50" />
                    };
                    return map[name] || <BookOpen className="w-4 h-4 text-white/50" />;
                  };

                  return (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center mb-2 px-1">
                         <h1 className="text-2xl font-bold text-white">Profile Comparison</h1>
                         <Button
                          variant="outline"
                          size="sm"
                          className="bg-white/5 border-white/10 text-white/70 rounded-full hover:bg-white/10 hover:text-white"
                        >
                          How it works? <HelpCircle className="w-4 h-4 ml-2" />
                        </Button>
                      </div>

                      {/* Hero Section */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-[#15151A] border border-white/5 rounded-3xl p-6 relative overflow-hidden"
                      >
                        <div className="flex items-center justify-between gap-4">
                          
                          {/* You */}
                          <div className="flex items-center gap-3 flex-1 justify-end relative z-10">
                            <div className="text-right hidden sm:block">
                              <div className="flex items-center justify-end gap-1.5 mb-1">
                                <h2 className="text-lg font-bold text-white">You</h2>
                                <User className="w-3.5 h-3.5 text-pink-500" />
                              </div>
                            </div>
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.3)] bg-[#1C1C24] shrink-0">
                              <div className="w-full h-full flex items-center justify-center font-bold text-xl text-pink-500">
                                You
                              </div>
                            </div>
                          </div>

                          {/* Center Circular Chart */}
                          <div className="relative flex flex-col items-center justify-center flex-shrink-0 mx-2 sm:mx-6">
                            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-[5px] border-l-pink-500 border-t-pink-500 border-r-blue-500 border-b-blue-500 shadow-[0_0_30px_rgba(236,72,153,0.2)] flex flex-col items-center justify-center bg-[#15151A] relative z-10">
                              <Heart className="w-4 h-4 text-pink-500/80 mb-0.5" />
                              <div className="text-2xl sm:text-3xl font-extrabold text-white leading-none mb-0.5">
                                {data.compatibilityScore}%
                              </div>
                              <div className="text-[8px] sm:text-[9px] uppercase tracking-wider text-white/50 text-center w-16">
                                Overall Compatibility
                              </div>
                            </div>
                            <div className="absolute -bottom-2 z-20">
                              <Badge className="bg-[#1C1C24] text-yellow-500 border border-yellow-500/30 px-2 py-0.5 text-[10px] font-medium whitespace-nowrap">
                                {getMatchQuality(data.compatibilityScore)}
                              </Badge>
                            </div>
                          </div>

                          {/* Matched User */}
                          <div className="flex items-center gap-3 flex-1 justify-start relative z-10">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)] bg-[#1C1C24] shrink-0">
                              {p.photos?.[0] ? (
                                <img src={p.photos[0].url} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center font-bold text-xl text-blue-500">
                                  {getInitials(p.firstName)}
                                </div>
                              )}
                            </div>
                            <div className="text-left hidden sm:block">
                              <div className="flex items-center justify-start gap-1.5 mb-1">
                                <h2 className="text-lg font-bold text-white">{p.firstName}</h2>
                                <User className="w-3.5 h-3.5 text-blue-500" />
                              </div>
                            </div>
                          </div>
                          
                        </div>
                      </motion.div>

                      {/* 3 Summary Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Personality Match */}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                          className="bg-[#15151A] border border-white/5 rounded-2xl p-4 flex items-center gap-3 relative overflow-hidden"
                        >
                          <div className="absolute bottom-0 left-0 w-full h-1 bg-pink-500/20">
                            <div className="h-full bg-pink-500" style={{ width: \`\${data.personalityMatch}%\` }}></div>
                          </div>
                          <div className="bg-pink-500/10 p-2.5 rounded-full">
                            <Heart className="w-5 h-5 text-pink-500 fill-pink-500/20" />
                          </div>
                          <div>
                            <div className="text-[11px] text-white/50 mb-0.5">Personality Match</div>
                            <div className="text-xl font-bold text-white leading-tight">{data.personalityMatch}%</div>
                            <div className="text-[10px] text-white/40">{getMatchQuality(data.personalityMatch)}</div>
                          </div>
                        </motion.div>

                        {/* Values Match */}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.15 }}
                          className="bg-[#15151A] border border-white/5 rounded-2xl p-4 flex items-center gap-3 relative overflow-hidden"
                        >
                          <div className="absolute bottom-0 left-0 w-full h-1 bg-purple-500/20">
                            <div className="h-full bg-purple-500" style={{ width: \`\${data.aiStoryMatch}%\` }}></div>
                          </div>
                          <div className="bg-purple-500/10 p-2.5 rounded-full">
                            <BookOpen className="w-5 h-5 text-purple-500" />
                          </div>
                          <div>
                            <div className="text-[11px] text-white/50 mb-0.5 flex items-center gap-1.5">
                              Values Match
                              {!data.hasStories && (
                                <span className="text-[8px] text-yellow-500 bg-yellow-500/10 px-1 py-0.5 rounded border border-yellow-500/20">Pending</span>
                              )}
                            </div>
                            <div className="text-xl font-bold text-white leading-tight">
                              {!data.hasStories ? "--" : \`\${data.aiStoryMatch}%\`}
                            </div>
                            <div className="text-[10px] text-white/40">
                              {!data.hasStories ? "Need more stories" : getMatchQuality(data.aiStoryMatch)}
                            </div>
                          </div>
                        </motion.div>

                        {/* Lifestyle Match */}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          className="bg-[#15151A] border border-white/5 rounded-2xl p-4 flex items-center gap-3 relative overflow-hidden"
                        >
                          <div className="absolute bottom-0 left-0 w-full h-1 bg-green-500/20">
                            <div className="h-full bg-green-500" style={{ width: \`\${lifestyleMatch}%\` }}></div>
                          </div>
                          <div className="bg-green-500/10 p-2.5 rounded-full border border-green-500/10">
                            <Star className="w-5 h-5 text-green-500" />
                          </div>
                          <div>
                            <div className="text-[11px] text-white/50 mb-0.5 flex items-center gap-1.5">
                              Lifestyle Match
                              {!data.hasStories && (
                                 <span className="text-[8px] text-yellow-500 bg-yellow-500/10 px-1 py-0.5 rounded border border-yellow-500/20">Pending</span>
                              )}
                            </div>
                            <div className="text-xl font-bold text-white leading-tight">
                              {!data.hasStories ? "--" : \`\${lifestyleMatch}%\`}
                            </div>
                            <div className="text-[10px] text-white/40">
                              {!data.hasStories ? "Need more stories" : getMatchQuality(lifestyleMatch)}
                            </div>
                          </div>
                        </motion.div>
                      </div>

                      {/* Personality Comparison */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        className="bg-[#15151A] border border-white/5 rounded-3xl p-5"
                      >
                        <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-white/5">
                          <User className="w-4 h-4 text-pink-500" />
                          <h3 className="text-base font-bold text-white">Personality Comparison</h3>
                        </div>

                        <div className="grid grid-cols-12 gap-3 text-[10px] font-semibold text-white/40 mb-3 px-1 uppercase">
                          <div className="col-span-5">Trait</div>
                          <div className="col-span-2 text-pink-500">You</div>
                          <div className="col-span-2 text-blue-500">{p.firstName}</div>
                          <div className="col-span-3 text-right">Similarity</div>
                        </div>

                        <div className="space-y-4">
                          {traitBreakdowns.map((trait, i) => (
                            <div key={i} className="grid grid-cols-12 gap-3 items-center px-1">
                              <div className="col-span-5 flex items-center gap-2.5">
                                {getTraitIcon(trait.name)}
                                <div>
                                  <div className="text-xs font-semibold text-white/90">{trait.name}</div>
                                  <div className="text-[9px] text-white/40">{getTraitSubtext(trait.name)}</div>
                                </div>
                              </div>
                              <div className="col-span-2 flex flex-col gap-1">
                                <span className="text-[10px] font-bold text-white">{trait.myScore}%</span>
                                <div className="h-1 bg-white/5 rounded-full overflow-hidden w-full max-w-[60px]">
                                  <div className="h-full bg-pink-500" style={{ width: \`\${trait.myScore}%\` }}></div>
                                </div>
                              </div>
                              <div className="col-span-2 flex flex-col gap-1">
                                <span className="text-[10px] font-bold text-white">{trait.theirScore}%</span>
                                <div className="h-1 bg-white/5 rounded-full overflow-hidden w-full max-w-[60px]">
                                  <div className="h-full bg-blue-500" style={{ width: \`\${trait.theirScore}%\` }}></div>
                                </div>
                              </div>
                              <div className="col-span-3 flex items-center justify-end gap-1.5">
                                <span className={\`text-xs font-bold \${getMatchColor(trait.similarity)}\`}>
                                  {trait.similarity}%
                                </span>
                                <Circle className={\`w-2.5 h-2.5 \${getMatchColor(trait.similarity)} fill-current\`} />
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-5 pt-3 border-t border-white/5 flex justify-end items-center gap-3 px-1">
                          <span className="text-xs text-white/40">Personality Match</span>
                          <span className="text-lg font-bold text-pink-500">{data.personalityMatch}%</span>
                        </div>
                      </motion.div>

                      {/* Life & Values Comparison */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-[#15151A] border border-white/5 rounded-3xl p-5"
                      >
                        <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/5">
                          <div className="flex items-center gap-2.5">
                            <BookOpen className="w-4 h-4 text-purple-500" />
                            <h3 className="text-base font-bold text-white">Life & Values Comparison</h3>
                          </div>
                          {data.hasStories ? (
                            <Badge variant="outline" className="bg-white/5 text-white/50 border-white/10 text-[9px]">
                              {p.storyCount < 10 ? "Low Match" : "High Match"} 
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 text-[9px]">
                              Low Confidence
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-12 gap-3 text-[10px] font-semibold text-white/40 mb-3 px-1 uppercase">
                          <div className="col-span-5">Category</div>
                          <div className="col-span-2 text-pink-500">You</div>
                          <div className="col-span-2 text-blue-500">{p.firstName}</div>
                          <div className="col-span-3 text-right">Similarity</div>
                        </div>

                        <div className="space-y-4">
                          {storyBreakdowns.map((cat, i) => (
                            <div key={i} className="grid grid-cols-12 gap-3 items-center px-1">
                              <div className="col-span-5 flex items-center gap-2.5">
                                {getStoryIcon(cat.name)}
                                <div>
                                  <div className="text-xs font-semibold text-white/90">{cat.name}</div>
                                  <div className="text-[9px] text-white/40">{getStorySubtext(cat.name)}</div>
                                </div>
                              </div>
                              <div className="col-span-2 flex flex-col gap-1">
                                <span className="text-[10px] font-bold text-white">{cat.myScore}%</span>
                                <div className="h-1 bg-white/5 rounded-full overflow-hidden w-full max-w-[60px]">
                                  <div className="h-full bg-pink-500" style={{ width: \`\${cat.myScore}%\` }}></div>
                                </div>
                              </div>
                              <div className="col-span-2 flex flex-col gap-1">
                                <span className="text-[10px] font-bold text-white">{cat.theirScore}%</span>
                                <div className="h-1 bg-white/5 rounded-full overflow-hidden w-full max-w-[60px]">
                                  <div className="h-full bg-blue-500" style={{ width: \`\${cat.theirScore}%\` }}></div>
                                </div>
                              </div>
                              <div className="col-span-3 flex items-center justify-end">
                                {cat.insufficientData ? (
                                  <span className="text-[9px] text-white/40 italic">Insufficient Data</span>
                                ) : (
                                  <span className={\`text-[11px] font-bold \${getMatchColor(cat.similarity)}\`}>
                                    {getMatchQuality(cat.similarity).split(" ")[0]} ({cat.similarity}%)
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="mt-5 pt-3 border-t border-white/5 flex justify-between items-center px-1">
                          <div className="flex items-center gap-1.5 text-[9px] text-white/40">
                            <HelpCircle className="w-3 h-3" />
                            Keep sharing more about yourself.
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-white/40">Values Match</span>
                            <span className="text-lg font-bold text-purple-500">
                              {!data.hasStories ? "--" : \`\${data.aiStoryMatch}%\`}
                            </span>
                          </div>
                        </div>
                      </motion.div>

                      {/* Tips & Upsell Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* How You Can Improve This Match */}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.35 }}
                          className="bg-[#15151A] border border-white/5 rounded-3xl p-5 flex flex-col h-full"
                        >
                          <div className="flex items-center gap-2.5 mb-5">
                            <div className="bg-yellow-500/10 p-1.5 rounded-lg border border-yellow-500/20">
                              <Target className="w-4 h-4 text-yellow-500" />
                            </div>
                            <h3 className="text-sm font-bold text-white">How You Can Improve This Match</h3>
                          </div>
                          
                          <div className="space-y-4 mb-5 flex-1">
                            <div className="flex gap-3">
                              <div className="bg-[#1C1C24] p-1.5 rounded-lg h-7 shrink-0 flex items-center justify-center">
                                <Home className="w-3.5 h-3.5 text-yellow-500" />
                              </div>
                              <div>
                                <div className="font-bold text-xs text-white/90">Learn about each other's family values</div>
                                <div className="text-[10px] text-white/50 mt-0.5">Understanding expectations builds strong foundations.</div>
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
                                <HeartPulse className="w-3.5 h-3.5 text-pink-500" />
                              </div>
                              <div>
                                <div className="font-bold text-xs text-white/90">Talk about your daily routine</div>
                                <div className="text-[10px] text-white/50 mt-0.5">Similar lifestyles lead to better understanding.</div>
                              </div>
                            </div>
                          </div>

                          <div className="bg-pink-500/5 border border-pink-500/20 rounded-xl p-3 flex gap-2.5 mt-auto">
                            <Heart className="w-4 h-4 text-pink-500 shrink-0" />
                            <div>
                              <div className="font-bold text-xs text-pink-500 mb-0.5">Tip</div>
                              <div className="text-[10px] text-white/60">Start meaningful conversations and get to know each other better.</div>
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
                            <div className="bg-orange-500/10 p-1.5 rounded-lg border border-orange-500/20">
                              <Lock className="w-4 h-4 text-orange-500" />
                            </div>
                            <h3 className="text-sm font-bold text-orange-500">Unlock Full Compatibility Insights</h3>
                          </div>
                          
                          <p className="text-xs text-white/90 mb-1 font-semibold">Get complete access to detailed insights</p>
                          <p className="text-[10px] text-white/50 mb-5">Help you understand each other better and build a stronger connection.</p>
                          
                          <div className="space-y-3 mb-5 flex-1">
                            <div className="flex gap-2.5 items-start">
                              <CheckCircle2 className="w-3.5 h-3.5 text-pink-500 mt-0.5 shrink-0" />
                              <div>
                                <div className="font-bold text-xs text-white/90">Detailed personality comparison</div>
                              </div>
                            </div>
                            <div className="flex gap-2.5 items-start">
                              <CheckCircle2 className="w-3.5 h-3.5 text-pink-500 mt-0.5 shrink-0" />
                              <div>
                                <div className="font-bold text-xs text-white/90">Values & lifestyle insights</div>
                              </div>
                            </div>
                            <div className="flex gap-2.5 items-start">
                              <CheckCircle2 className="w-3.5 h-3.5 text-pink-500 mt-0.5 shrink-0" />
                              <div>
                                <div className="font-bold text-xs text-white/90">Strengths & differences</div>
                              </div>
                            </div>
                            <div className="flex gap-2.5 items-start">
                              <CheckCircle2 className="w-3.5 h-3.5 text-pink-500 mt-0.5 shrink-0" />
                              <div>
                                <div className="font-bold text-xs text-white/90">Conversation starters</div>
                              </div>
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
                          </div>
                        </motion.div>
                      </div>

                    </div>
                  );
                })()
              )}
`;

const newContent = content.substring(0, startIdx) + replacement + endTag + content.substring(endIdx + endTag.length);
fs.writeFileSync(path, newContent, 'utf8');
console.log("Replacement successful!");
