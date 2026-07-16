const fs = require('fs');
const path = require('path');

const subjects = [
  "The right match", "True love", "A deep connection", "Genuine affection", "Real intimacy",
  "A soulful bond", "Patience", "Self-improvement", "Growth", "Healing",
  "A healthy relationship", "Finding your person", "Authenticity", "Vulnerability", "Trust",
  "Mutual respect", "Shared values", "Understanding", "Compassion", "A strong foundation"
];
const verbs = [
  "will feel like", "brings", "creates", "requires", "is built on",
  "starts with", "leads to", "encourages", "inspires", "demands"
];
const objects = [
  "peace, not drama.", "a safe harbor in a storm.", "endless support.", "growth and understanding.",
  "a foundation of trust.", "mutual respect and care.", "a journey of discovery.", "unconditional love.",
  "the patience to understand.", "the courage to be vulnerable."
];

const quotes = [];
for (let s of subjects) {
  for (let v of verbs) {
    for (let o of objects) {
      if (quotes.length < 105) {
        quotes.push(`${s} ${v} ${o}`);
      }
    }
  }
}

const images = [];
for (let i = 0; i < 35; i++) {
  images.push(`https://picsum.photos/id/${100 + i}/800/600`);
}

const fileContent = `
export const motivationQuotes = ${JSON.stringify(quotes, null, 2)};
export const motivationImages = ${JSON.stringify(images, null, 2)};
`;

fs.writeFileSync(path.join(__dirname, 'artifacts/soulmatch/src/lib/dailyMotivationData.ts'), fileContent);
console.log('Generated dailyMotivationData.ts');
