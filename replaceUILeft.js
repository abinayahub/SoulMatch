const fs = require('fs');

const path = 'artifacts/soulmatch/src/pages/profile-user.tsx';
let content = fs.readFileSync(path, 'utf8');

const startTag = '<div className="lg:col-span-5 space-y-6">';
const endTag = '            {/* Right Column: Insights */}';

const startIdx = content.indexOf(startTag);
const endIdx = content.indexOf(endTag);

if (startIdx === -1 || endIdx === -1) {
  console.log("Could not find start or end bounds.");
  if (startIdx === -1) console.log("Missing start tag");
  if (endIdx === -1) console.log("Missing end tag");
  process.exit(1);
}

const replacement = `<div className="lg:col-span-5 space-y-4">
              {/* Profile Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#15151A] border border-white/5 rounded-3xl p-5 relative"
              >
                {/* 92% match badge */}
                {p.compatibilityScore && (
                  <div className="absolute top-5 right-5 z-10">
                    <Badge className="bg-pink-500/10 text-pink-500 border border-pink-500/20 px-3 py-1 text-xs rounded-full">
                      {p.compatibilityScore}% match
                    </Badge>
                  </div>
                )}

                {/* Avatar */}
                <div className="mb-4">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border border-white/10 relative shadow-lg">
                    {photo ? (
                      <img
                        src={photo.url}
                        alt={p.firstName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#1C1C24] flex items-center justify-center">
                        <span className="text-3xl font-bold text-white/50">
                          {getInitials(p.firstName)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Name & Location */}
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-white mb-1">
                    {p.firstName}
                    {p.age ? \`, \${p.age}\` : ""}
                  </h1>
                  {(p.city || p.country) && (
                    <div className="flex items-center gap-1.5 text-white/50 text-xs">
                      <MapPin className="w-3.5 h-3.5" />
                      {[p.city, p.country].filter(Boolean).join(", ")}
                    </div>
                  )}
                </div>

                {/* Badges Row */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 rounded-md font-medium px-2 py-0.5 text-[10px]">
                    <Zap className="w-3 h-3 mr-1" />
                    Active recently
                  </Badge>
                  {p.journeyProgress !== undefined && p.journeyProgress > 0 && (
                    <Badge className="bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 rounded-md font-medium px-2 py-0.5 text-[10px]">
                      <Target className="w-3 h-3 mr-1" />
                      Completed {Math.min(30, p.journeyProgress)}/30
                    </Badge>
                  )}
                  {compatibilityData && (compatibilityData as any).personalityMatch > 80 && (
                    <Badge className="bg-pink-500/10 text-pink-400 border border-pink-500/20 hover:bg-pink-500/20 rounded-md font-medium px-2 py-0.5 text-[10px]">
                      <Heart className="w-3 h-3 mr-1" />
                      High Match
                    </Badge>
                  )}
                  {p.storyCount > 0 && (
                    <Badge className="bg-orange-500/10 text-orange-400 border border-orange-500/20 hover:bg-orange-500/20 rounded-md font-medium px-2 py-0.5 text-[10px]">
                      <BookOpen className="w-3 h-3 mr-1" />
                      {p.storyCount} Stories
                    </Badge>
                  )}
                </div>

                {/* Tags Row */}
                {p.traits && Array.isArray(p.traits) && p.traits.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {p.traits.map((tag: any, i: number) => (
                      <span
                        key={i}
                        className="text-[10px] px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/70 whitespace-nowrap"
                      >
                        {typeof tag === "string" ? tag : tag?.name || tag?.trait || "Trait"}
                      </span>
                    ))}
                  </div>
                )}

                {/* Metrics Grid */}
                <div className="grid grid-cols-3 gap-2 mb-6">
                  <div className="bg-[#1C1C24] border border-white/5 rounded-xl p-3 flex flex-col items-center justify-center text-center hover:bg-white/5 transition-colors">
                    <Flame className="w-4 h-4 text-purple-400 mb-1" />
                    <div className="text-sm font-bold text-white leading-tight">
                      {Math.min(30, p.journeyProgress || 0)}
                    </div>
                    <div className="text-[9px] text-white/50">Day Streak</div>
                  </div>
                  <div className="bg-[#1C1C24] border border-white/5 rounded-xl p-3 flex flex-col items-center justify-center text-center hover:bg-white/5 transition-colors">
                    <BookOpen className="w-4 h-4 text-orange-400 mb-1" />
                    <div className="text-sm font-bold text-white leading-tight">
                      {p.storyCount || 0}
                    </div>
                    <div className="text-[9px] text-white/50">Stories Shared</div>
                  </div>
                  <div className="bg-[#1C1C24] border border-white/5 rounded-xl p-3 flex flex-col items-center justify-center text-center hover:bg-white/5 transition-colors">
                    <Shield className="w-4 h-4 text-green-400 mb-1" />
                    <div className="text-sm font-bold text-green-400 leading-tight">
                      Verified
                    </div>
                    <div className="text-[9px] text-white/50">ID & Photo</div>
                  </div>
                </div>

                {/* About Section */}
                <div className="mb-6">
                  <div className="text-white/40 text-[9px] uppercase tracking-wider mb-2 flex items-center gap-1.5 font-bold">
                    <User className="w-3 h-3" /> ABOUT {p.firstName.toUpperCase()}
                  </div>
                  {p.bio ? (
                    <p className="text-xs text-white/80 leading-relaxed font-medium">
                      {p.bio}
                    </p>
                  ) : (
                    <p className="text-xs text-white/40 italic">No bio provided.</p>
                  )}
                </div>

                {/* Job / Education Icons */}
                <div className="flex items-center flex-wrap gap-4 mb-6">
                  {p.occupation && (
                    <div className="flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-white/40" />
                      <span className="text-xs text-white/70 font-medium">{p.occupation}</span>
                    </div>
                  )}
                  {p.education && (
                    <div className="flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-white/40" />
                      <span className="text-xs text-white/70 font-medium truncate">{p.education}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {!p.isMutualMatch && p.hasPendingInterest && !p.interestSentByViewer && (
                    <>
                      <Button
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white border-0 font-bold rounded-xl"
                        onClick={() => handleRespond("accept")}
                        disabled={respondInterest.isPending}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Accept
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 border-white/10 bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded-xl"
                        onClick={() => handleRespond("decline")}
                        disabled={respondInterest.isPending}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Decline
                      </Button>
                    </>
                  )}
                  {!p.isMutualMatch && (!p.hasPendingInterest || p.interestSentByViewer) && (
                    <Button
                      className={\`flex-1 \${isInterestSent ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white border-0"} font-bold rounded-xl\`}
                      onClick={handleSendInterest}
                      disabled={isInterestSent || sendInterest.isPending}
                    >
                      <Heart className="w-4 h-4 mr-2" />
                      {isInterestSent ? "Interest Sent" : "Send Interest"}
                    </Button>
                  )}
                  {p.isMutualMatch && (
                    <Button
                      className="flex-1 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white border-0 font-bold rounded-xl h-12"
                      onClick={handleChat}
                      disabled={chatLoading}
                    >
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Chat
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="border border-white/10 bg-white/5 hover:bg-white/10 text-white/70 w-12 h-12 shrink-0 rounded-xl"
                    onClick={handleReport}
                  >
                    <Flag className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>

              {/* Public Story Preview */}
              {Array.isArray(p.recentStories) && p.recentStories.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="bg-[#15151A] border border-white/5 rounded-3xl p-5"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="font-bold text-white text-sm">
                      Public Story Preview
                    </h2>
                    <Button
                      variant="link"
                      className="text-pink-500 hover:text-pink-400 h-auto p-0 text-xs font-semibold"
                    >
                      View all
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-2.5">
                    {p.recentStories.slice(0, 3).map((story: any, i: number) => (
                      <div
                        key={story.id ?? i}
                        className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#1C1C24] border border-white/5 group cursor-pointer"
                      >
                        {story.imageUrl ? (
                          <>
                            <img
                              src={story.imageUrl}
                              alt=""
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-2.5">
                              <div className="text-[9px] font-medium text-white/90 line-clamp-3 leading-snug">
                                {story.content}
                              </div>
                              <div className="flex items-center gap-1 mt-1.5 opacity-80">
                                <Heart className="w-2.5 h-2.5 text-pink-500" />
                                <span className="text-[8px] text-white font-medium">{story.likes || Math.floor(Math.random() * 50) + 1}</span>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="w-full h-full flex flex-col justify-end p-2.5">
                            <div className="text-[9px] font-medium text-white/90 line-clamp-3 leading-snug">
                              {story.content}
                            </div>
                            <div className="flex items-center gap-1 mt-1.5 opacity-80">
                              <Heart className="w-2.5 h-2.5 text-pink-500" />
                              <span className="text-[8px] text-white font-medium">{story.likes || Math.floor(Math.random() * 50) + 1}</span>
                            </div>
                          </div>
                        )}
                        <div className="absolute top-2 left-2 opacity-50">
                          <Book className="w-3 h-3 text-white" />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
\n`;

const newContent = content.substring(0, startIdx) + replacement + content.substring(endIdx);
fs.writeFileSync(path, newContent, 'utf8');
console.log("Left column replacement successful!");
