const fs = require('fs');
const path = 'c:/Users/91638/Downloads/Soul-Match-AI/Soul-Match-AI/artifacts/soulmatch/src/pages/my-story.tsx';
let content = fs.readFileSync(path, 'utf-8');

// Add import
content = content.replace(
  'import { motion, AnimatePresence } from "framer-motion";',
  'import { motion, AnimatePresence } from "framer-motion";\nimport { apiRequest } from "@/lib/api";'
);

// Remove DAILY_PROMPTS array
content = content.replace(/const DAILY_PROMPTS = \[\s*[\s\S]*?\];/m, '');

// Replace memo with useQuery
const newLogic = `
  const dailyPollQuery = useQuery({
    queryKey: ["/api/journey/daily-poll"],
    queryFn: () => {
      const token = getAccessToken();
      const headers = token ? { Authorization: \`Bearer \${token}\` } : {};
      return apiRequest<any>("/journey/daily-poll", { headers: headers as any });
    },
  });

  const todayPrompt = dailyPollQuery.data?.poll?.question || "What made you smile today?";
`;

content = content.replace(/\/\/ Get prompt based on day of year[\s\S]*?}, \[\]\);/m, newLogic.trim());

fs.writeFileSync(path, content, 'utf-8');
console.log('Update complete!');
