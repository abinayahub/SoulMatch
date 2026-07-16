import fs from 'fs';

const text = fs.readFileSync('src/raw_questions.txt', 'utf-8');
const lines = text.split('\n').map(l => l.trim()).filter(l => l);

const categories = [
  'Personality',
  'Lifestyle',
  'Family Values',
  'Career Goals',
  'Communication Style'
];

let currentCategory = null;
let currentQuestion = null;
const allQuestions = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  // Try to identify category shifts based on headers
  if (line === 'Personality') currentCategory = 'Personality';
  else if (line === 'Lifestyle') currentCategory = 'Lifestyle';
  else if (line === 'Family Values' || line === 'Family Values --related this qn') currentCategory = 'Family Values';
  else if (line === 'Career Goals') currentCategory = 'Career Goals';
  else if (line === 'Communication related') currentCategory = 'Communication Style';

  // Match question starts: "Example X" or "Category Question X"
  const qMatch = line.match(/^(?:Example|Personality Question|Lifestyle Question|Family Values Question|Career Goals Question|Communication Style Question)\s+(\d+)$/i);
  if (qMatch) {
    if (currentQuestion && currentQuestion.question && currentQuestion.options.length > 0) {
      allQuestions.push(currentQuestion);
    }
    // If it's a new question, assume the next line is the question text
    let qText = lines[i+1];
    // if next line is empty or something weird, we search
    let offset = 1;
    while(qText && (qText.startsWith('A.') || qText.startsWith('B.') || qText.startsWith('C.') || qText.startsWith('D.'))) {
        offset++;
        qText = lines[i+offset];
    }

    currentQuestion = {
      category: currentCategory,
      question: lines[i+1],
      options: []
    };
    i++; // skip the question text line since we just consumed it
    continue;
  }

  // Options matching
  if (currentQuestion) {
    if (/^[A-D]\./.test(line)) {
      currentQuestion.options.push(line);
    }
  }
}

if (currentQuestion && currentQuestion.question && currentQuestion.options.length > 0) {
  allQuestions.push(currentQuestion);
}

// Group by category to assign days
const byCategory = {};
categories.forEach(c => byCategory[c] = []);

for (const q of allQuestions) {
  if (!byCategory[q.category]) byCategory[q.category] = [];
  byCategory[q.category].push(q);
}

const finalQuestions = [];

for (const cat of categories) {
  const qs = byCategory[cat];
  console.log(`${cat}: ${qs ? qs.length : 0} questions parsed.`);
  if (qs) {
    for (let day = 1; day <= 30; day++) {
      if (qs[day - 1]) {
        finalQuestions.push({
          day,
          category: cat,
          question: qs[day - 1].question,
          options: qs[day - 1].options,
          questionType: 'choice'
        });
      }
    }
  }
}

fs.writeFileSync('src/parsed_questions.json', JSON.stringify(finalQuestions, null, 2));
console.log(`Saved ${finalQuestions.length} questions to src/parsed_questions.json`);
