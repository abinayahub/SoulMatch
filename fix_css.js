const fs = require('fs');
let content = fs.readFileSync('artifacts/soulmatch/src/index.css', 'utf8');

const darkTheme = `
/* DARK MODE */
:root, .dark {
  --button-outline: rgba(255,255,255, .10);
  --badge-outline: rgba(255,255,255, .05);

  --opaque-button-border-intensity: 9; 

  --elevate-1: rgba(255,255,255, .04);
  --elevate-2: rgba(255,255,255, .09);

  --background: 240 10% 8%;
  --foreground: 0 0% 95%;
  --border: 240 10% 20%;
  
  --card: 240 10% 12%;
  --card-foreground: 0 0% 95%;
  --card-border: 240 10% 22%;
  
  --sidebar: 240 10% 10%;
  --sidebar-foreground: 0 0% 95%;
  --sidebar-border: 240 10% 20%;
  --sidebar-primary: 346 80% 55%;
  --sidebar-primary-foreground: 0 0% 100%;
  --sidebar-accent: 240 10% 16%;
  --sidebar-accent-foreground: 0 0% 95%;
  --sidebar-ring: 346 80% 55%;

  --popover: 240 10% 12%;
  --popover-foreground: 0 0% 95%;
  --popover-border: 240 10% 22%;

  --primary: 346 80% 55%;
  --primary-foreground: 0 0% 100%;

  --secondary: 240 10% 16%;
  --secondary-foreground: 0 0% 95%;

  --muted: 240 10% 16%;
  --muted-foreground: 240 5% 65%;

  --accent: 240 10% 16%;
  --accent-foreground: 0 0% 95%;

  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 0 0% 98%;

  --input: 240 10% 20%;
  --ring: 346 80% 55%;
  --chart-1: 346 80% 55%;
  --chart-2: 240 10% 20%;
  --chart-3: 173 58% 39%;
  --chart-4: 43 74% 66%;
  --chart-5: 27 87% 67%;

  --app-font-sans: 'Inter', sans-serif;
  --app-font-serif: Georgia, serif;
  --app-font-mono: Menlo, monospace;
  --radius: .5rem; 
  --shadow-2xs: 0px 1px 2px 0px rgba(0,0,0,0.5);
  --shadow-xs: 0px 1px 3px 0px rgba(0,0,0,0.5), 0px 1px 2px 0px rgba(0,0,0,0.3);
  --shadow-sm: 0px 4px 6px -1px rgba(0,0,0,0.5), 0px 2px 4px -1px rgba(0,0,0,0.3);
  --shadow: 0px 10px 15px -3px rgba(0,0,0,0.5), 0px 4px 6px -2px rgba(0,0,0,0.4);
  --shadow-md: 0px 20px 25px -5px rgba(0,0,0,0.6), 0px 10px 10px -5px rgba(0,0,0,0.5);
  --shadow-lg: 0px 25px 50px -12px rgba(0,0,0,0.7);
  --shadow-xl: 0px 35px 60px -15px rgba(0,0,0,0.8);
  --shadow-2xl: 0px 50px 100px -20px rgba(0,0,0,0.8);
  --tracking-normal: 0em;
  --spacing: 0.25rem;

  --sidebar-primary-border: hsl(var(--sidebar-primary));
  --sidebar-primary-border: hsl(from hsl(var(--sidebar-primary)) h s calc(l + var(--opaque-button-border-intensity)) / alpha);
  --sidebar-accent-border: hsl(var(--sidebar-accent));
  --sidebar-accent-border: hsl(from hsl(var(--sidebar-accent)) h s calc(l + var(--opaque-button-border-intensity)) / alpha);
  --primary-border: hsl(var(--primary));
  --primary-border: hsl(from hsl(var(--primary)) h s calc(l + var(--opaque-button-border-intensity)) / alpha);
  --secondary-border: hsl(var(--secondary));
  --secondary-border: hsl(from hsl(var(--secondary)) h s calc(l + var(--opaque-button-border-intensity)) / alpha);
  --muted-border: hsl(var(--muted));
  --muted-border: hsl(from hsl(var(--muted)) h s calc(l + var(--opaque-button-border-intensity)) / alpha);
  --accent-border: hsl(var(--accent));
  --accent-border: hsl(from hsl(var(--accent)) h s calc(l + var(--opaque-button-border-intensity)) / alpha);
  --destructive-border: hsl(var(--destructive));
  --destructive-border: hsl(from hsl(var(--destructive)) h s calc(l + var(--opaque-button-border-intensity)) / alpha);
}
`;

content = content.replace(/\/\* LIGHT MODE \*\/[\s\S]*?\}\s*/, darkTheme);

fs.writeFileSync('artifacts/soulmatch/src/index.css', content);
console.log('Updated index.css variables to dark theme.');
