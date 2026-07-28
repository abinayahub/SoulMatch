import fs from 'fs';
import path from 'path';

const file = 'c:/Users/91638/Desktop/SoulMatch App/Soul-Match-AI/artifacts/soulmatch/src/pages/activity.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace main container
content = content.replace(
  /<div className="w-full relative bg-transparent font-sans min-h-screen pt-4 pb-28">\s*<div className="max-w-md mx-auto w-full px-5">/g,
  `<div className="min-h-screen pb-28 font-sans relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #F8F3F7 0%, #FAF1ED 100%)' }}>
        <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ background: 'radial-gradient(circle at 0% 0%, #F4F1FF 0%, transparent 50%), radial-gradient(circle at 100% 100%, #FFFDFC 0%, transparent 50%)' }} />
        <div className="w-full relative z-10 pt-4 max-w-md mx-auto px-5">`
);

// Replace cards
const cardRegex = /className="bg-card border border-[\w/]+(?: dark:border-[\w/]+ border-[\w/]+)? shadow-sm rounded-\[24px\](?: relative)?"/g;
content = content.replace(cardRegex, `className="border border-white/35 rounded-[24px] relative overflow-hidden" style={{ background: 'rgba(255,255,255,0.48)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)', boxShadow: '0 16px 40px rgba(0,0,0,0.08)' }}`);

// Another variant of cards
const cardRegex2 = /className="bg-card border border-border shadow-sm rounded-\[24px\]"/g;
content = content.replace(cardRegex2, `className="border border-white/35 rounded-[24px] relative overflow-hidden" style={{ background: 'rgba(255,255,255,0.48)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)', boxShadow: '0 16px 40px rgba(0,0,0,0.08)' }}`);

// More variations
content = content.replace(/className="flex items-center justify-between bg-card border border-border\/60 dark:border-white\/10 border-black\/10 px-2\.5 py-1\.5 rounded-\[12px\]"/g, 
  `className="flex items-center justify-between border border-white/35 px-2.5 py-1.5 rounded-[12px]" style={{ background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(16px)' }}`);

// Colors
content = content.replace(/text-muted-foreground/g, 'text-[#707070]');
content = content.replace(/text-foreground/g, 'text-[#252525]');
content = content.replace(/text-primary/g, 'text-[#F6A8B7]');
content = content.replace(/bg-primary\/10/g, 'bg-[#F6A8B7]/10');
content = content.replace(/bg-muted/g, 'bg-white/40');
content = content.replace(/border-border/g, 'border-white/40');

fs.writeFileSync(file, content, 'utf8');
console.log('activity.tsx updated successfully.');
