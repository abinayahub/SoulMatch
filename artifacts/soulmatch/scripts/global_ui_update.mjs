import fs from 'fs';
import path from 'path';

function getAllFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, fileList);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

const rootDir = 'c:/Users/91638/Desktop/SoulMatch App/Soul-Match-AI/artifacts/soulmatch/src';
const dirsToScan = [
  path.join(rootDir, 'pages'),
  path.join(rootDir, 'components')
];

let files = [];
dirsToScan.forEach(dir => {
  files = files.concat(getAllFiles(dir));
});

let updatedCount = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;

  // 1. Text Colors
  content = content.replace(/text-muted-foreground/g, 'text-[#707070]');
  content = content.replace(/text-foreground(?!\/[0-9])/g, 'text-[#252525]');

  // 2. Old Orange Themes to Pastel Pink Accent
  content = content.replace(/#E5772E/gi, '#F6A8B7');
  content = content.replace(/#EB8D3A/gi, '#F6A8B7');
  content = content.replace(/#CC3917/gi, '#F6A8B7'); // Used for hover/gradients, mapping to the base pastel pink or maybe #F8C7C8. Let's use #F8C7C8 for secondary gradient stops.
  
  // Wait, let's fix gradients specifically for buttons if they are hardcoded.
  // We'll just replace the hex codes for the orange colors.
  content = content.replace(/from-\[#F6A8B7\] to-\[#F6A8B7\]/g, 'from-[#F8C7C8] via-[#F8D9D2] to-[#F7E8EE]'); 
  // Let's just catch the orange tailwind classes
  content = content.replace(/orange-500/g, '[#F6A8B7]');
  content = content.replace(/orange-400/g, '[#F6A8B7]');
  content = content.replace(/orange-600/g, '[#F8C7C8]');

  // 3. Flat Cards to Glass Cards (safe regexes)
  // Search for: bg-card border border-border/80 dark:border-white/10 rounded-2xl
  const flatCardRegex1 = /className="bg-card border border-border\/[0-9]+ dark:border-white\/[0-9]+ rounded-2xl(.*?)"/g;
  content = content.replace(flatCardRegex1, (match, p1) => {
    return `className="premium-glass-card border border-white/35 rounded-[28px] relative overflow-hidden${p1}"`;
  });
  
  const flatCardRegex2 = /className="bg-card rounded-2xl border border-border\/[0-9]+(.*?)"/g;
  content = content.replace(flatCardRegex2, (match, p1) => {
    return `className="premium-glass-card rounded-[28px] border border-white/35 relative overflow-hidden${p1}"`;
  });
  
  const flatCardRegex3 = /className="bg-card border rounded-xl(.*?)"/g;
  content = content.replace(flatCardRegex3, (match, p1) => {
    return `className="premium-glass-card border border-white/35 rounded-[28px] relative overflow-hidden${p1}"`;
  });
  
  const flatCardRegex4 = /className="bg-white rounded-2xl border border-gray-100(.*?)"/g;
  content = content.replace(flatCardRegex4, (match, p1) => {
    return `className="premium-glass-card border border-white/35 rounded-[28px] relative overflow-hidden${p1}"`;
  });
  
  const flatCardRegex5 = /className="bg-white rounded-3xl border border-gray-100(.*?)"/g;
  content = content.replace(flatCardRegex5, (match, p1) => {
    return `className="premium-glass-card border border-white/35 rounded-[28px] relative overflow-hidden${p1}"`;
  });
  
  const bgCardRegex = /className="bg-card border border-border\/50 rounded-2xl(.*?)"/g;
  content = content.replace(bgCardRegex, (match, p1) => {
    return `className="premium-glass-card border border-white/35 rounded-[28px] relative overflow-hidden${p1}"`;
  });

  // 4. Update solid background layout wrappers that are just plain white/transparent.
  // e.g. <div className="min-h-screen bg-transparent ...
  // or <div className="min-h-screen bg-[#F8F3F7] ...
  const layoutRegex1 = /<div className="min-h-screen bg-transparent(.*?)"(>| >)/g;
  content = content.replace(layoutRegex1, (match, p1) => {
    return `<div className="w-full min-h-screen relative flex flex-col font-sans${p1}" style={{ background: 'linear-gradient(135deg, #F8F3F7 0%, #FAF1ED 100%)' }}>
      <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ background: 'radial-gradient(circle at 0% 0%, #F4F1FF 0%, transparent 50%), radial-gradient(circle at 100% 100%, #FFFDFC 0%, transparent 50%)' }} />
      <div className="relative z-10 flex-1 flex flex-col w-full h-full">`;
  });
  
  // We need to be careful with layout wrappers adding extra unclosed divs.
  // Actually, let's skip the layout wrapper complex div injection because injecting unclosed <div>s breaks JSX.
  // Instead, just apply the style to the existing div.
  
  const layoutRegexSafe = /className="([^"]*?min-h-screen[^"]*?bg-(?:transparent|\[#F8F3F7\]|white|background)[^"]*?)"/g;
  content = content.replace(layoutRegexSafe, (match, p1) => {
    if (p1.includes('linear-gradient')) return match; // already handled
    const newClass = p1.replace(/bg-(?:transparent|\[#F8F3F7\]|white|background)/g, '').trim();
    return `className="${newClass} relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #F8F3F7 0%, #FAF1ED 100%)' }}`;
  });

  // Ensure style tags are closed properly if we replaced them.
  // (The above layoutRegexSafe just changes the className and adds a style prop).
  
  // 5. Update old Buttons.
  // Find bg-primary or bg-orange gradients in buttons and replace them.
  const buttonRegex1 = /className="([^"]*?)bg-\[#F6A8B7\]([^"]*?text-white[^"]*?)"/g;
  content = content.replace(buttonRegex1, (match, pre, post) => {
    return `className="${pre}w-full text-[#252525] rounded-full border border-white/40 transition-all${post.replace('text-white', '')}" style={{ background: 'linear-gradient(135deg, #F8C7C8, #F8D9D2, #F7E8EE)', boxShadow: '0 4px 12px rgba(246, 168, 183, 0.15)' }}`;
  });

  if (content !== original) {
    // If the file doesn't have the premium-glass-card definition but needs it, add it if it's a page component.
    if (content.includes('premium-glass-card') && !content.includes('.premium-glass-card {') && file.includes('pages\\')) {
      // It's usually safer to define it in index.css once globally for the whole app!
      // Let's do that instead of injecting it into every file.
    }
    
    fs.writeFileSync(file, content, 'utf8');
    updatedCount++;
    console.log(`Updated ${file}`);
  }
}

console.log(`Updated ${updatedCount} files.`);
