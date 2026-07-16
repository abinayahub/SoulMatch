import 'dotenv/config';
import pkg from 'pg';
const { Client } = pkg;
// Connect to the default 'postgres' database
const client = new Client({ connectionString: process.env.DATABASE_URL });
client.connect()
  .then(async () => { 
    console.log('Connected to default postgres database. Creating soulmatch...'); 
    try {
      await client.query('CREATE DATABASE soulmatch;');
      console.log('Database soulmatch created successfully!');
    } catch (e) {
      if (e.message.includes('already exists')) {
        console.log('Database soulmatch already exists!');
      } else {
        console.error('Failed to create database:', e.message);
      }
    }
    client.end(); 
  })
  .catch(err => { console.error('Connection failed:', err.message); process.exit(1); });
