import fs from 'fs';
import path from 'path';
import pkg from 'pg';
const { Client } = pkg;

const email = process.argv[2];
if (!email || email === 'your-email@example.com') {
  console.log('Please provide your actual email address. Example: node --env-file=../../.env make_admin.mjs johndoe@gmail.com');
  process.exit(1);
}

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  try {
    await client.connect();
    const res = await client.query("UPDATE users SET role = 'admin' WHERE email = $1 RETURNING *", [email]);
    if (res.rowCount > 0) {
      console.log(`Successfully made ${email} an admin!`);
    } else {
      console.log(`Could not find a user with the email ${email}.`);
    }
  } catch (e) {
    console.error("Error updating user:", e);
  } finally {
    await client.end();
  }
}
run();
