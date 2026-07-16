// Restore CONFIRMED original password hashes from PostgreSQL heap analysis
const { Pool } = require('C:\\Users\\91638\\Desktop\\SoulMatch App\\Soul-Match-AI\\lib\\db\\node_modules\\pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:Abinaya%40123@localhost:5432/soulmatch'
});

// These hashes are confirmed originals found in the heap at dist<30 bytes from the email
// in pages that predate our reset operation
const confirmedHashes = [
  { email: 'kavi@gmail.com',         hash: '$2b$12$Nn0yemntfm5sZFVRXyNLyer0.xvldqY.5KJIVKhZVTDKtA9Vkx8qi' },
  { email: '22csec01@gmail.com',     hash: '$2b$12$FZB3HnUML.r8J01tB2qxteGfxjQrdi0/g0KJs/9OWc2kcXYKb2fpO' },
  { email: 'mani@gmail.com',         hash: '$2b$12$026ivvCJTZSdVv7MNSkwX.Zlbf9prJbww1cZvBYEScYbbsL1w042O' },
  { email: 'nila@gmail.com',         hash: '$2b$12$TsggRl0ok/h2KmKCxEVhfu1B6GbzlBVdrqqI0eAd/jo9Ts.oEaFCu' },
  { email: 'karthi@gmail.com',       hash: '$2b$12$qtT93eBUPCCY6HfnSBLJw.YrNfANPgg.ZmEh/Ua/HdPjHpBWFWlwm' },
  { email: 'sandhiya2003@gmail.com', hash: '$2b$12$hF/cAJwXJp4iWrX6gz.NzeWKu80gbEU17/3fVXElOGTypDpE2bo8u' },
  { email: 'sandhiya2004@gmail.com', hash: '$2b$12$G08NJtvgE9iuyNs50JWvWerMZpIvI5CbxztLhL05LlzfSdXWPW4fm' },
  { email: 'haridarsan01@gmail.com', hash: '$2b$12$E.HKaKm9kESqxbX0jUFfAubHym6Ae.JzyLuHW/KT0pGDWLA1z790C' },
  { email: 'mahima@gmail.com',       hash: '$2b$12$Z1JACX/6ugbpaEi3ALzp4e.PRm3F0A1tBBpMuuK2BwrEMWYkG4Qpe' },
  { email: 'john@gmail.com',         hash: '$2b$12$yfiKiH6knDVAIRTNOGiyqu7WNCUB..ao1hxaMq4Z2mPsuyo/BRKZy' },
  { email: 'anitha@gmail.com',       hash: '$2b$12$9gPBY1BfYL.QZg0FKMxDguIxovF8.8vDBLxLvTcAfV4we1B0D1r4O' },
  { email: 'tr400573@gmail.com',     hash: '$2b$12$g0yggqwsJ2LQ65.9SKbNN.ewer77x.3PZZsbRSbasW4e4.Vwc.Q0C' },
  { email: 'shivani@gmail.com',      hash: '$2b$12$NLbZwM.qZssI6Mer25jAve9kMbktPjrwHMkK0pjjB4ABsThvSVyiG' },
  { email: 'hariasvi21@gmail.com',   hash: '$2b$12$YZv.c6A/n90ATYVBzDtnzeO2JxPrIELz0JSZsqon5CuePesgCYFA6' },
  { email: 'kishore@gmail.com',      hash: '$2b$12$ndIVnMc6s4WPUWeqB8xrNO1Wbp2dbWJIgIAhh8GPuDhOrOhS1ejVC' },
  { email: 'sruthi2026@gmail.com',   hash: '$2b$12$/O0W1C4VOx1E2IP8GDY32.jZh601BicGiguTUNnHosa88TevhefAO' },
  { email: 'nivetha@gmail.com',      hash: '$2b$12$9gPBY1BfYL.QZg0FKMxDguIxovF8.8vDBLxLvTcAfV4we1B0D1r4O' },
];

async function restore() {
  console.log('Restoring original password hashes...\n');
  for (const u of confirmedHashes) {
    const r = await pool.query(
      'UPDATE users SET password_hash=$1 WHERE email=$2 RETURNING email, first_name',
      [u.hash, u.email]
    );
    if (r.rows.length > 0) {
      console.log('Restored: ' + r.rows[0].email + ' (' + r.rows[0].first_name + ')');
    } else {
      console.log('Not found: ' + u.email);
    }
  }
  console.log('\nAll original hashes restored successfully!');
  await pool.end();
}

restore().catch(function(e) { console.error(e.message); pool.end(); });
