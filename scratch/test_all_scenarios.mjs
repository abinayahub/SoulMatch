function calculateMasterTraits(optionsList) {
  const qScores = { Connection: 0, Growth: 0, Stability: 0, Exploration: 0 };
  
  for (const opt of optionsList) {
    if (opt === 'A') qScores.Connection += 10;
    else if (opt === 'B') qScores.Growth += 10;
    else if (opt === 'C') qScores.Stability += 10;
    else if (opt === 'D') qScores.Exploration += 10;
  }

  const totalPts = qScores.Connection + qScores.Growth + qScores.Stability + qScores.Exploration;

  let connection = 0;
  let growth = 0;
  let stability = 0;
  let exploration = 0;

  if (totalPts > 0) {
    connection = Math.round((qScores.Connection / totalPts) * 100);
    growth = Math.round((qScores.Growth / totalPts) * 100);
    stability = Math.round((qScores.Stability / totalPts) * 100);
    exploration = Math.round((qScores.Exploration / totalPts) * 100);

    const currentSum = connection + growth + stability + exploration;
    if (currentSum !== 100 && currentSum > 0) {
      const diff = 100 - currentSum;
      if (connection >= growth && connection >= stability && connection >= exploration) connection += diff;
      else if (growth >= stability && growth >= exploration) growth += diff;
      else if (stability >= exploration) stability += diff;
      else exploration += diff;
    }
  }

  return { qScores, totalPts, percentages: { connection, growth, stability, exploration } };
}

const scenarios = [
  { name: "Scenario 1: All answers = Option A", options: ['A', 'A', 'A', 'A', 'A'] },
  { name: "Scenario 2: All answers = Option B", options: ['B', 'B', 'B', 'B', 'B'] },
  { name: "Scenario 3: All answers = Option C", options: ['C', 'C', 'C', 'C', 'C'] },
  { name: "Scenario 4: All answers = Option D", options: ['D', 'D', 'D', 'D', 'D'] },
  { name: "Scenario 5: Mixed answers (A, A, B, C, D)", options: ['A', 'A', 'B', 'C', 'D'] },
];

console.log("=================================================");
console.log("=== MASTER TRAIT MAPPING TEST SUITE VERIFICATION ===");
console.log("=================================================\n");

for (const sc of scenarios) {
  console.log(`--- ${sc.name} ---`);
  const res = calculateMasterTraits(sc.options);
  console.log(`Answers: [${sc.options.join(', ')}]`);
  console.log(`Raw Scores: Connection=${res.qScores.Connection}, Growth=${res.qScores.Growth}, Stability=${res.qScores.Stability}, Exploration=${res.qScores.Exploration} (Total = ${res.totalPts})`);
  console.log(`Final Percentages: Connection=${res.percentages.connection}%, Growth=${res.percentages.growth}%, Stability=${res.percentages.stability}%, Exploration=${res.percentages.exploration}%\n`);
}
