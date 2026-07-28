import fs from 'fs';
const path = 'c:/Users/91638/Desktop/SoulMatch App/Soul-Match-AI/artifacts/soulmatch/src/components/dashboard/DailyReflection.tsx';
let content = fs.readFileSync(path, 'utf8');

// Fix the bad style string. It injected `"` and `style={{...}}` leaving the original ` p-4...` exposed.
const badString = /border border-white\/35 rounded-\[28px\] relative overflow-hidden" style=\{\{ background: 'rgba\(255,255,255,0\.48\)', backdropFilter: 'blur\(28px\)', WebkitBackdropFilter: 'blur\(28px\)', boxShadow: '0 16px 40px rgba\(0,0,0,0\.08\)' \}\}/g;

content = content.replace(badString, 'border border-white/35 rounded-[28px] relative overflow-hidden premium-glass-card');

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed JSX syntax error in DailyReflection.tsx');
