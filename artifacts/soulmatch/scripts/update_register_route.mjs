import fs from 'fs';

let content = fs.readFileSync('src/pages/register.tsx', 'utf8');

// The original redirection logic: window.location.href = "/dashboard";
content = content.replace(
  /window\.location\.href = "\/dashboard";\s*return;/g,
  'window.location.href = "/registration-success";\n        return;'
);

fs.writeFileSync('src/pages/register.tsx', content, 'utf8');
console.log('register.tsx updated');
