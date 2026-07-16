// Read PostgreSQL heap file and extract email-to-hash pairs from dead tuples
const fs = require('fs');
const heapFile = process.env.TEMP + '\\users_heap.bin';
const buf = fs.readFileSync(heapFile);
const text = buf.toString('latin1');

// Find all bcrypt hashes  
const hashRe = /\$2b\$12\$[./A-Za-z0-9]{53}/g;
const emailRe = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;

// Extract all positions
let hashMatches = [];
let m;
while ((m = hashRe.exec(text)) !== null) {
  hashMatches.push({ pos: m.index, hash: m[0] });
}

let emailMatches = [];
while ((m = emailRe.exec(text)) !== null) {
  emailMatches.push({ pos: m.index, email: m[0] });
}

// Filter to only known user emails
const knownEmails = [
  'kavi@gmail.com', '22csec01@gmail.com', 'mani@gmail.com', 'shivani@gmail.com',
  'hariasvi21@gmail.com', 'haridarsan01@gmail.com', 'kishore@gmail.com', 'nila@gmail.com',
  'tr400573@gmail.com', 'john@gmail.com', 'sruthi2026@gmail.com', 'anitha@gmail.com',
  'mahima@gmail.com', 'karthi@gmail.com', 'nivetha@gmail.com', 'sandhiya2003@gmail.com',
  'sandhiya2004@gmail.com', 'testuser@soulmatch.com'
];

emailMatches = emailMatches.filter(e => knownEmails.includes(e.email));

// For each email, find the nearest hash (within 8000 bytes)
console.log('\nEmail → Hash mapping from heap:\n');
const used = new Set();
for (const em of emailMatches) {
  let best = null, bestDist = Infinity;
  for (const hm of hashMatches) {
    const dist = Math.abs(hm.pos - em.pos);
    if (dist < 8000 && dist < bestDist) {
      bestDist = dist;
      best = hm;
    }
  }
  if (best && !used.has(best.hash)) {
    used.add(best.hash);
    console.log(`${em.email.padEnd(30)} → ${best.hash}`);
  }
}
