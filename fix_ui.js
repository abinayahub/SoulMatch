const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory() && !file.includes('node_modules')) results = results.concat(walk(file));
    else if (file.endsWith('.tsx') || file.endsWith('.ts')) results.push(file);
  });
  return results;
}

const files = walk('artifacts/soulmatch/src');
let changedCount = 0;

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let original = content;

  // Replace manual background colors
  content = content.replace(/hsl\(222 47% 5%\)/g, 'hsl(var(--background))');
  content = content.replace(/hsl\(222 47% 7%\)/g, 'hsl(var(--card))');
  content = content.replace(/rgba\(255,\s*255,\s*255,\s*0\.0[4-9]\)/g, 'hsl(var(--card))');
  content = content.replace(/rgba\(255,255,255,0\.0[4-9]\)/g, 'hsl(var(--card))');
  
  // Replace gradient styles directly with solid primary
  content = content.replace(/linear-gradient\(135deg,\s*hsl\(340 82% 60%\)\s*0%,\s*hsl\(280 70% 65%\)\s*100%\)/g, 'hsl(var(--primary))');
  content = content.replace(/linear-gradient\(135deg,\s*hsl\(340 82% 60%\),\s*hsl\(280 70% 65%\)\)/g, 'hsl(var(--primary))');
  content = content.replace(/linear-gradient\(145deg,\s*hsl\(222 47% 7%\)\s*0%,\s*hsl\(280 35% 10%\)\s*50%,\s*hsl\(340 35% 10%\)\s*100%\)/g, 'hsl(var(--card))');
  
  // Replace gradient utility classes
  content = content.replace(/gradient-primary/g, 'bg-primary text-primary-foreground shadow-md');
  content = content.replace(/gradient-text/g, 'text-primary');
  content = content.replace(/gradient-hero/g, 'bg-background');

  // Replace glass utilities with standard card styling
  content = content.replace(/glass-strong/g, 'bg-card border border-border shadow-lg rounded-2xl');
  content = content.replace(/glass/g, 'bg-card border border-border shadow-md rounded-2xl');
  
  // Replace glowing effects
  content = content.replace(/glow-primary/g, 'shadow-lg shadow-primary/20');
  content = content.replace(/glow-sm/g, 'shadow-sm shadow-primary/10');
  
  // Remove manual border white translucent
  content = content.replace(/border: [\"']1px solid rgba\(255,\s*255,\s*255,\s*0\.[0-9]+\)[\"']/g, 'border: "1px solid hsl(var(--border))"');

  if (content !== original) {
    fs.writeFileSync(f, content);
    changedCount++;
  }
});

console.log('Updated ' + changedCount + ' files.');
