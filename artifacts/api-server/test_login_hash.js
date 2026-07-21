import bcrypt from "bcryptjs";

const hashes = {
  nivi: "$2b$12$K9/RatGHX4xaHCjT4Zoe5u08DGGMsgQSy6EV2K6ZyUa/31Oimvm6a",
  nivetha: "$2b$12$Eorv.rYgPgLE99MU05npHumN.pBM91XQlNtJNwBECPOUstHE9uwQm",
  karthikeyan: "$2b$12$WXz/ufBQZuupxmuj1eddFeIrzvX1gA3d/7UEJFwBjKPmzSKF5k7vS",
  testuser888: "$2b$12$F14oafHIH9YYYJ8wCH.dM.pGg6jrQUi6J7k./d3R.BKIyqlhjpkIy"
};

const candidatePasswords = [
  "SoulMatch@123",
  "password",
  "password123",
  "Abinaya@123",
  "Abi@123",
  "Abi@1234",
  "Test@123"
];

async function main() {
  for (const [name, hash] of Object.entries(hashes)) {
    console.log(`Checking hashes for ${name}...`);
    for (const pwd of candidatePasswords) {
      const match = await bcrypt.compare(pwd, hash);
      if (match) {
        console.log(`  MATCH FOUND: Password for ${name} is "${pwd}"`);
      }
    }
  }
}

main().catch(console.error);
