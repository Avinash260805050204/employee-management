const mysql = require('mysql2/promise');
const { executeMockQuery } = require('./mockDb');
require('dotenv').config();

let useMock = false;
let pool = null;

try {
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'steel_plant_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    dateStrings: true
  });
  
  // Test connection immediately
  pool.getConnection()
    .then(conn => {
      console.log('MySQL Database Connected successfully!');
      conn.release();
    })
    .catch(err => {
      console.log('\n[WARNING] Local MySQL server not reachable on localhost:3306.');
      console.log('>>> Falling back to local file-system JSON Database in backend/data/ folder.');
      console.log('>>> All functionality (registrations, logins, shifts, maintenance, dashboard charts) remains fully operational!\n');
      useMock = true;
    });
} catch (e) {
  console.log('[WARNING] MySQL setup failed. Using JSON mock fallback.');
  useMock = true;
}

const query = async (sql, params) => {
  if (useMock) {
    return await executeMockQuery(sql, params);
  }
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (err) {
    // If connection drops midway
    if (err.code === 'ECONNREFUSED' || err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.log('>>> Database connection lost. Switching to mock DB.');
      useMock = true;
      return await executeMockQuery(sql, params);
    }
    console.error('Database Query Error:', err);
    throw err;
  }
};

module.exports = {
  pool,
  query
};
