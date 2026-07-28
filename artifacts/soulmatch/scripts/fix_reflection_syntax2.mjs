import fs from 'fs';
const path = 'c:/Users/91638/Desktop/SoulMatch App/Soul-Match-AI/artifacts/soulmatch/src/components/dashboard/DailyReflection.tsx';
let content = fs.readFileSync(path, 'utf8');

// The original replacement string lacked a closing `}` for `style={{...}}`.
// It looked like: `" style={{... boxShadow: '...' } `
const badRegex = /border border-white\/35 rounded-\[28px\] relative overflow-hidden" style=\{\{ background: 'rgba\(255,255,255,0\.48\)', backdropFilter: 'blur\(28px\)', WebkitBackdropFilter: 'blur\(28px\)', boxShadow: '0 16px 40px rgba\(0,0,0,0\.08\)' \} /g;

content = content.replace(badRegex, 'premium-glass-card border border-white/35 rounded-[28px] relative overflow-hidden ');

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed JSX syntax error in DailyReflection.tsx');
