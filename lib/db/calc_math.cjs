const kavi = {"Family Values":17,"Communication Style":11,"Adventure & Travel":21,"Career Focus":19,"Kindness & Empathy":10,"Social Engagement":18,"Personal Growth":20};
const hari = {"Family Values":10,"Communication Style":15,"Adventure & Travel":20,"Career Focus":15,"Kindness & Empathy":1,"Social Engagement":7,"Personal Growth":20};
const mani = {"Family Values":20,"Communication Style":21,"Adventure & Travel":9,"Career Focus":20,"Kindness & Empathy":21,"Social Engagement":2,"Personal Growth":21};
const kishore = {"Family Values":9,"Communication Style":8,"Adventure & Travel":23,"Career Focus":12,"Kindness & Empathy":25,"Social Engagement":0,"Personal Growth":26};

function printDetailedMath(name, scores) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  console.log(`\n--- Detailed Math: Kavi vs ${name} ---`);
  
  const categories = Object.keys(kavi);
  for (const c of categories) {
    const valA = kavi[c] || 0;
    const valB = scores[c] || 0;
    dotProduct += valA * valB;
    normA += valA * valA;
    normB += valB * valB;
    
    // Print individual match approximation
    const maxDiff = Math.max(valA, valB);
    const diff = Math.abs(valA - valB);
    const match = maxDiff === 0 ? 100 : Math.round((1 - (diff / maxDiff)) * 100);
    console.log(`${c} Match: |${valA} - ${valB}| -> ${match}%`);
  }
  
  const final = Math.round((dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))) * 100);
  console.log(`Dot Product: ${dotProduct}`);
  console.log(`Norm Kavi: sqrt(${normA}) = ${Math.sqrt(normA).toFixed(2)}`);
  console.log(`Norm ${name}: sqrt(${normB}) = ${Math.sqrt(normB).toFixed(2)}`);
  console.log(`Final Cosine Similarity: ${final}%`);
}

printDetailedMath('Hari', hari);
printDetailedMath('Mani', mani);
printDetailedMath('Kishore', kishore);
