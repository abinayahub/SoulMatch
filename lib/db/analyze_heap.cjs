// Better heap analysis — for each user email, find ALL hashes within a 500-byte window
const fs = require('fs');
const buf = fs.readFileSync(process.env.TEMP + '\\users_heap.bin');
const text = buf.toString('latin1');

const hashRe = /\$2b\$12\$[./A-Za-z0-9]{53}/g;
const emailRe = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;

const knownEmails = [
  'kavi@gmail.com','22csec01@gmail.com','mani@gmail.com','shivani@gmail.com',
  'hariasvi21@gmail.com','haridarsan01@gmail.com','kishore@gmail.com','nila@gmail.com',
  'tr400573@gmail.com','john@gmail.com','sruthi2026@gmail.com','anitha@gmail.com',
  'mahima@gmail.com','karthi@gmail.com','nivetha@gmail.com','sandhiya2003@gmail.com',
  'sandhiya2004@gmail.com'
];

let hashes = [], emails = [], m;
while ((m = hashRe.exec(text)) !== null) hashes.push({ pos: m.index, hash: m[0] });
while ((m = emailRe.exec(text)) !== null) if (knownEmails.includes(m[0])) emails.push({ pos: m.index, email: m[0] });

// Remove duplicate emails keeping first occurrence per email per page (8192 byte pages)
const seen = {};
const dedup = [];
for (const e of emails) {
  const pageKey = e.email + '_' + Math.floor(e.pos / 8192);
  if (!seen[pageKey]) { seen[pageKey] = true; dedup.push(e); }
}

console.log('\nDetailed proximity analysis (window=1000 bytes):\n');
for (const em of dedup) {
  const nearby = hashes.filter(h => Math.abs(h.pos - em.pos) < 1000)
    .sort((a,b) => Math.abs(a.pos - em.pos) - Math.abs(b.pos - em.pos));
  if (nearby.length > 0) {
    console.log(em.email + ' (pos=' + em.pos + ')');
    nearby.slice(0, 3).forEach(h => console.log('  dist=' + Math.abs(h.pos-em.pos) + ' ' + h.hash));
    console.log('');
  }
}
