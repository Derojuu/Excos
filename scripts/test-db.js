import { getDb, closeDb } from '../lib/db.ts'; // Add .ts extension
// OR use .js if you want to keep it in JavaScript

async function testConnection() {
  try {
    console.log('Testing database connection...');
    const pool = await getDb();
    const result = await pool.request().query('SELECT 1 as test');
    console.log('Database connection test successful!');
    console.log('Test query result:', result.recordset);
    await closeDb();
  } catch (error) {
    console.error('Database connection test failed:', error);
    process.exit(1);
  }
}

testConnection().catch(console.error);