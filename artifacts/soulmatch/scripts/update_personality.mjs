import fs from 'fs';

const path = 'c:/Users/91638/Desktop/SoulMatch App/Soul-Match-AI/artifacts/soulmatch/src/pages/personality.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add style tags and adjust main wrapper
content = content.replace(
  /<div className="min-h-screen bg-transparent pb-24">/,
  `<div className="w-full min-h-screen pb-safe font-sans relative flex flex-col" style={{ background: 'linear-gradient(135deg, #F8F3F7 0%, #FAF1ED 100%)' }}>
        <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ background: 'radial-gradient(circle at 0% 0%, #F4F1FF 0%, transparent 50%), radial-gradient(circle at 100% 100%, #FFFDFC 0%, transparent 50%)' }} />
        <style>{\`
          .premium-glass-card {
            background: rgba(255, 255, 255, 0.48) !important;
            backdrop-filter: blur(28px) !important;
            -webkit-backdrop-filter: blur(28px) !important;
            box-shadow: 0 16px 40px rgba(0, 0, 0, 0.08) !important;
          }
        \`}</style>`
);

// 2. Adjust Header
content = content.replace(
  /<nav className="sticky top-\[calc\(4rem\+env\(safe-area-inset-top,0px\)\)\] z-50 bg-transparent\/95 backdrop-blur-md border-b border-border\/40 py-4">/,
  `<nav className="sticky top-[calc(4rem+env(safe-area-inset-top,0px))] z-50 bg-transparent/85 backdrop-blur-md py-4">`
);

content = content.replace(
  /<button \s*onClick=\{\(\) => navigate\("\/dashboard"\)\}\s*className="w-8 h-8 rounded-full bg-muted\/60 flex items-center justify-center hover:bg-muted\/80 transition-colors"\s*>/,
  `<button onClick={() => navigate("/dashboard")} className="p-2 -ml-2 rounded-full hover:bg-black/5 active:scale-95 transition-all text-[#252525]">`
);

// 3. Replace Card Classes
const oldCardRegex = /className="bg-card border border-border\/80 dark:border-white\/15 border-black\/15 rounded-2xl p-4 shadow-sm(.*?)"/g;
content = content.replace(oldCardRegex, (match, p1) => {
  return `className="premium-glass-card border border-white/35 rounded-[28px] relative overflow-hidden p-4${p1}"`;
});

// 4. Update Colors and Progress Bars
content = content.replace(/text-muted-foreground/g, 'text-[#707070]');
content = content.replace(/text-foreground/g, 'text-[#252525]');
content = content.replace(/bg-foreground\/5/g, 'bg-[#252525]/5');

// Update traits colors
content = content.replace(/text-\[#E5772E\]/g, 'text-[#F6A8B7]');
content = content.replace(/text-blue-500/g, 'text-[#F6A8B7]');
content = content.replace(/text-orange-500/g, 'text-[#F6A8B7]');

content = content.replace(/bg-\[#E5772E\]\/15/g, 'bg-[#F6A8B7]/15');
content = content.replace(/bg-blue-500\/15/g, 'bg-[#F6A8B7]/15');
content = content.replace(/bg-orange-500\/15/g, 'bg-[#F6A8B7]/15');

content = content.replace(/border-\[#E5772E\]\/25/g, 'border-[#F6A8B7]/25');
content = content.replace(/border-blue-500\/25/g, 'border-[#F6A8B7]/25');
content = content.replace(/border-orange-500\/25/g, 'border-[#F6A8B7]/25');

content = content.replace(/bg-\[#E5772E\]"/g, 'bg-[#F6A8B7]"');
content = content.replace(/bg-blue-500"/g, 'bg-[#F6A8B7]"');
content = content.replace(/bg-orange-500"/g, 'bg-[#F6A8B7]"');
content = content.replace(/fill-\[#E5772E\]/g, 'fill-[#F6A8B7]');

content = content.replace(/from-\[#E5772E\]\/5/g, 'from-[#F6A8B7]/10');
content = content.replace(/bg-slate-200 dark:bg-slate-800/g, 'bg-[#F6A8B7]/20');

// Header Typography
content = content.replace(
  /<h1 className="text-base font-bold text-\[#252525\] tracking-tight">Personality Analysis<\/h1>/,
  `<h1 className="text-[20px] font-bold text-[#252525] tracking-tight">Personality Analysis</h1>`
);

fs.writeFileSync(path, content, 'utf8');
console.log('personality.tsx updated successfully.');
