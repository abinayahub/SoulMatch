const fs = require('fs');
const file = 'artifacts/soulmatch/src/pages/profile-user.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add useAuth import if missing
if (!content.includes('useAuth')) {
    content = content.replace('import { getAccessToken } from "@/lib/auth-context";', 'import { getAccessToken, useAuth } from "@/lib/auth-context";');
}

// 2. Add const { user } = useAuth(); if missing
if (!content.includes('const { user } = useAuth();')) {
    content = content.replace('const queryClient = useQueryClient();', 'const queryClient = useQueryClient();\n  const { user } = useAuth();');
}

// 3. Unify Summary Cards (Personality Match & Values Match)
const summaryStartStr = '{/* Personality Match */}';
const summaryEndStr = '{/* Detailed Analysis Sections */}';

if (content.includes(summaryStartStr) && content.includes(summaryEndStr)) {
    const summaryStart = content.indexOf(summaryStartStr);
    const summaryEnd = content.indexOf(summaryEndStr);

    const unifiedSummaryCard = `
                      {/* Unified Summary Card (Personality & Values) */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-card border border-border rounded-3xl p-6 relative overflow-hidden group shadow-sm mb-6"
                      >
                        {/* Premium Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        
                        <div className="relative flex flex-col md:flex-row gap-6 items-stretch">
                          {/* Personality Match */}
                          <div className="flex-1 flex items-start gap-4">
                            <div className="bg-primary/10 p-3 rounded-2xl shrink-0 border border-primary/20">
                              <Brain className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1">
                              <div className="text-[11px] font-bold text-muted-foreground mb-1 flex items-center gap-1.5 uppercase tracking-wider">
                                Personality Match
                              </div>
                              <div className="flex items-baseline gap-2 mb-1">
                                <span className="text-3xl font-black text-foreground tracking-tight">
                                  {data.aiPersonalityMatch}%
                                </span>
                                <span className="text-sm font-bold text-primary">
                                  {getMatchQuality(data.aiPersonalityMatch)}
                                </span>
                              </div>
                              
                              <p className="text-[10px] text-muted-foreground leading-relaxed pr-2">
                                Based on a deep analysis of personality traits, emotional connection, and core behavioral patterns.
                              </p>
                            </div>
                          </div>

                          {/* Divider */}
                          <div className="hidden md:block w-px bg-border/80 mx-2 self-stretch rounded-full"></div>
                          <div className="md:hidden h-px bg-border/80 w-full rounded-full"></div>

                          {/* Values Match */}
                          <div className="flex-1 flex items-start gap-4">
                            <div className="bg-purple-500/10 p-3 rounded-2xl shrink-0 border border-purple-500/20">
                              <BookOpen className="w-6 h-6 text-purple-500" />
                            </div>
                            <div className="flex-1">
                              <div className="text-[11px] font-bold text-muted-foreground mb-1 flex flex-wrap items-center gap-1.5 uppercase tracking-wider">
                                Values & Stories
                                {data.sConfidenceData && data.sConfidenceData.level !== "High" && (
                                  <span
                                    className={\`text-[9px] px-1.5 py-0.5 rounded-md font-bold tracking-normal \${
                                      data.sConfidenceData.level === "Low"
                                        ? "text-red-500 bg-red-500/10 border border-red-500/20"
                                        : "text-yellow-500 bg-yellow-500/10 border border-yellow-500/20"
                                    }\`}
                                    title={\`Confidence is based on \${data.sConfidenceData.stories} overlapping stories.\`}
                                  >
                                    {data.sConfidenceData.level} Confidence
                                    <span className="ml-1 opacity-70">· {data.sConfidenceData.stories} shared {data.sConfidenceData.stories === 1 ? 'story' : 'stories'}</span>
                                  </span>
                                )}
                              </div>
                              <div className="flex items-baseline gap-2 mb-1">
                                <span className="text-3xl font-black text-foreground tracking-tight">
                                  {!data.hasStories ? (
                                    data.sConfidenceData && data.sConfidenceData.categoriesAnalyzed > 0 ? (
                                      <span className="text-base text-yellow-500 font-bold">Limited Data</span>
                                    ) : (
                                      <span className="text-base text-yellow-500 font-bold">Pending</span>
                                    )
                                  ) : \`\${data.aiStoryMatch}%\`}
                                </span>
                                {data.hasStories && (
                                  <span className="text-sm font-bold text-purple-500">{getMatchQuality(data.aiStoryMatch)}</span>
                                )}
                              </div>
                              
                              <div className="text-[10px] text-muted-foreground leading-relaxed pr-2">
                                {!data.hasStories ? (
                                  data.sConfidenceData && data.sConfidenceData.categoriesAnalyzed > 0 ? (
                                    <>
                                      <span className="font-semibold block mb-0.5">{data.sConfidenceData.categoriesAnalyzed} of {data.sConfidenceData.totalCategories} categories analyzed.</span>
                                      <span className="italic opacity-80">
                                        Only {data.sConfidenceData.stories} shared {data.sConfidenceData.stories === 1 ? 'story category is' : 'story categories are'} currently available. As both users share more stories, the match will become more accurate.
                                      </span>
                                    </>
                                  ) : (
                                    "Complete at least 5 stories to unlock your Values Match."
                                  )
                                ) : (
                                  "Analyzed through shared daily reflections and personal stories indicating lifestyle alignment."
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
    `;
    content = content.substring(0, summaryStart) + unifiedSummaryCard + '\n' + content.substring(summaryEnd);
}

// 4. Merge Profile Card & Profile Comparison
const profileCardStartStr = '{/* Profile Card */}';
const profileCardEndStr = "              {(user?.role === 'premium' || user?.role === 'admin') && (";

if (content.includes(profileCardStartStr) && content.includes(profileCardEndStr)) {
    let profileCardJSX = content.substring(
        content.indexOf(profileCardStartStr), 
        content.indexOf(profileCardEndStr)
    );

    const firstMotionDiv = profileCardJSX.indexOf('<motion.div');
    const firstMotionDivEnd = profileCardJSX.indexOf('>', firstMotionDiv) + 1;
    profileCardJSX = profileCardJSX.substring(0, firstMotionDiv) + '<div className="flex-1 flex flex-col w-full relative">' + profileCardJSX.substring(firstMotionDivEnd);

    const lastMotionDiv = profileCardJSX.lastIndexOf('</motion.div>');
    profileCardJSX = profileCardJSX.substring(0, lastMotionDiv) + '</div>\n' + profileCardJSX.substring(lastMotionDiv + 13);

    const compStartStr = '<div className="flex justify-between items-center mb-2 px-1">\n                         <h1 className="text-2xl font-bold text-foreground">Profile Comparison</h1>';
    const compEndStr = '</div>\n                        </div>\n                      </motion.div>';
    
    if (content.includes(compStartStr) && content.includes(compEndStr)) {
        const compStart = content.indexOf(compStartStr);
        const compEnd = content.indexOf(compEndStr) + compEndStr.length;

        let compJSX = content.substring(compStart, compEnd);

        const compMotionDiv = compJSX.indexOf('<motion.div');
        const compMotionDivEnd = compJSX.indexOf('>', compMotionDiv) + 1;
        compJSX = compJSX.substring(0, compMotionDiv) + '<div className="flex-1 w-full lg:border-l lg:border-border lg:pl-10 flex flex-col justify-center relative mt-8 lg:mt-0 pt-8 lg:pt-0 border-t lg:border-t-0 border-border">\n                          {(user?.role === "premium" || user?.role === "admin") ? (\n                            <>' + compJSX.substring(compMotionDivEnd);

        const compLastMotionDiv = compJSX.lastIndexOf('</motion.div>');
        compJSX = compJSX.substring(0, compLastMotionDiv) + '</>\n                          ) : (\n                            <div className="flex flex-col items-center justify-center h-full py-12 text-center space-y-4">\n                              <div className="w-16 h-16 rounded-full bg-pink-500/10 flex items-center justify-center mb-2">\n                                <Lock className="w-8 h-8 text-pink-500" />\n                              </div>\n                              <h3 className="text-xl font-bold text-foreground">Premium Analysis Locked</h3>\n                              <p className="text-sm text-muted-foreground max-w-[250px]">Upgrade to SoulMatch Premium for ₹99 to see your full compatibility breakdown with {p.firstName}.</p>\n                              <Button className="mt-4 bg-gradient-to-r from-pink-500 to-purple-600 border-0" onClick={() => window.location.href = "/premium"}>Unlock Premium</Button>\n                            </div>\n                          )}\n                        </div>\n' + compJSX.substring(compLastMotionDiv + 13);

        const popoverEnd = compJSX.indexOf('</Popover>');
        if (popoverEnd !== -1) {
            compJSX = compJSX.substring(0, compJSX.indexOf('<div className="flex justify-between items-center mb-2 px-1">')) + compJSX.substring(popoverEnd + 10);
        }

        const unifiedHero = `
          {/* Unified Hero Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-3xl p-6 lg:p-10 relative overflow-hidden mb-8 shadow-sm flex flex-col lg:flex-row gap-8 lg:gap-10 items-stretch justify-between"
          >
` + profileCardJSX + '\n' + compJSX + `
          </motion.div>
        `;

        content = content.substring(0, compStart) + content.substring(compEnd);
        content = content.replace(content.substring(content.indexOf(profileCardStartStr), content.indexOf(profileCardEndStr)), '');

        const gridStartStr = '<div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">';
        const gridStart = content.indexOf(gridStartStr);
        content = content.substring(0, gridStart) + unifiedHero + '\n          ' + content.substring(gridStart);
    }
}

fs.writeFileSync(file, content);
console.log('Successfully merged cards and added premium check!');
