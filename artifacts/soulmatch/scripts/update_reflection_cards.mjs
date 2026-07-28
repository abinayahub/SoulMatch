import fs from 'fs';
import path from 'path';

const file = 'c:/Users/91638/Desktop/SoulMatch App/Soul-Match-AI/artifacts/soulmatch/src/components/dashboard/DailyReflection.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace standard cards
const cardRegex = /bg-card border border-border\/80 dark:border-white\/10 rounded-2xl/g;
content = content.replace(cardRegex, `border border-white/35 rounded-[28px] relative overflow-hidden" style={{ background: 'rgba(255,255,255,0.48)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)', boxShadow: '0 16px 40px rgba(0,0,0,0.08)' }`);

// Replace option cards
const optionCardRegex = /className=\{\`flex flex-col items-center justify-center h-\[90px\] rounded-2xl bg-card border transition-all cursor-pointer[\s\S]*?\}\`/g;
const newOptionCard = `className="flex flex-col items-center justify-center h-[90px] rounded-[20px] border transition-all cursor-pointer"
                style={{ 
                  background: isSelected ? 'rgba(246,168,183,0.12)' : 'rgba(255,255,255,0.48)', 
                  backdropFilter: 'blur(28px)', 
                  WebkitBackdropFilter: 'blur(28px)', 
                  borderColor: isSelected ? '#F6A8B7' : 'rgba(255,255,255,0.35)', 
                  boxShadow: isSelected ? '0 0 15px rgba(246,168,183,0.3)' : '0 8px 30px rgba(0,0,0,0.06)',
                  transform: isSelected ? 'scale(0.97)' : 'scale(1)'
                }}`;
content = content.replace(optionCardRegex, newOptionCard);

// Replace Question Text
content = content.replace(
  /className="text-base font-bold text-foreground mt-4 mb-3 leading-snug text-center"/g,
  'className="text-[20px] font-bold text-[#252525] mt-4 mb-5 text-center" style={{ lineHeight: "1.45" }}'
);

// Replace Bottom CTA Button
const buttonRegex = /className=\{\`\$\{[\s\S]*?\} bg-gradient-to-r from-\[#E5772E\] to-\[#CC3917\] w-full text-white rounded-xl h-\[48px\] shadow-\[0_4px_15px_rgba\(236,72,153,0\.3\)\] flex items-center justify-center gap-2 font-bold text-base shrink-0\`\}/g;
const newButton = `className={\`\${
            !selected ? "opacity-50 cursor-not-allowed" : "hover:opacity-90 active:scale-95"
          } w-full text-[#252525] rounded-full h-[48px] border border-white/40 flex items-center justify-center gap-2 font-bold text-[16px] shrink-0 transition-all\`}
          style={{ background: 'linear-gradient(135deg, #F8C7C8, #F8D9D2, #F7E8EE)', boxShadow: '0 4px 12px rgba(246, 168, 183, 0.15)' }}`;
content = content.replace(buttonRegex, newButton);

const buttonRegex2 = /className="bg-gradient-to-r from-\[#E5772E\] to-\[#CC3917\] hover:opacity-90 text-white rounded-xl h-\[48px\] shadow-\[0_4px_15px_rgba\(236,72,153,0\.3\)\] flex items-center justify-center gap-2 font-bold text-base w-full"/g;
const newButton2 = `className="hover:opacity-90 active:scale-95 w-full text-[#252525] rounded-full h-[48px] border border-white/40 flex items-center justify-center gap-2 font-bold text-[16px] shrink-0 transition-all" style={{ background: 'linear-gradient(135deg, #F8C7C8, #F8D9D2, #F7E8EE)', boxShadow: '0 4px 12px rgba(246, 168, 183, 0.15)' }}`;
content = content.replace(buttonRegex2, newButton2);

// Colors replacement
content = content.replace(/text-muted-foreground/g, 'text-[#707070]');
content = content.replace(/text-foreground/g, 'text-[#252525]');
content = content.replace(/#E5772E/g, '#F6A8B7');
content = content.replace(/#EB8D3A/g, '#F6A8B7');
content = content.replace(/orange-500/g, '[#F6A8B7]');
content = content.replace(/orange-400/g, '[#F6A8B7]');
content = content.replace(/#CC3917/g, '#F8C7C8');

fs.writeFileSync(file, content, 'utf8');
console.log('DailyReflection.tsx updated successfully.');
