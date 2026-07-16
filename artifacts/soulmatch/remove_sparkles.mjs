import fs from 'fs';
import path from 'path';

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('Sparkles')) {
                // Remove <Sparkles ... />
                content = content.replace(/<Sparkles[^>]*\/>/g, '');
                // Remove Sparkles from imports
                content = content.replace(/Sparkles,\s*/g, '');
                content = content.replace(/,\s*Sparkles/g, '');
                content = content.replace(/import\s*{\s*Sparkles\s*}\s*from\s*['"]lucide-react['"];?\n?/g, '');
                // For cases like icon={Sparkles}
                content = content.replace(/icon={Sparkles}/g, '');
                // For { icon: Sparkles, ... }
                content = content.replace(/icon:\s*Sparkles\s*,?/g, '');
                
                fs.writeFileSync(fullPath, content);
                console.log('Processed', fullPath);
            }
        }
    }
}

processDir('C:/Users/91638/Downloads/Soul-Match-AI/Soul-Match-AI/artifacts/soulmatch/src/pages');
processDir('C:/Users/91638/Downloads/Soul-Match-AI/Soul-Match-AI/artifacts/soulmatch/src/components');
