const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'microdain',
  password: 'Fenix2017',
  database: 'shelly_database1',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Enable CORS
app.use(cors());

// Endpoint to get list of tables
app.get('/api/tables', async (req, res) => {
  try {
    // Fetch list of tables from the database schema
    const [rows] = await pool.query("SHOW TABLES");
    const tables = rows.map(row => Object.values(row)[0]); // Extract table names from the rows
    res.json(tables);
  } catch (error) {
    console.error('Error fetching list of tables:', error);
    res.status(500).json({ error: 'An error occurred while fetching list of tables' });
  }
});

// API endpoint to fetch data from a specific table
app.get('/api/:table', async (req, res) => {
  const table = req.params.table;
  try {
    console.log('Fetching data from table:', table); // Debugging

    // Fetch the list of tables first
    const [tables] = await pool.query("SHOW TABLES");
    const tableNames = tables.map(row => Object.values(row)[0]);

    // Check if the requested table exists
    if (!tableNames.includes(table)) {
      throw new Error(`Table '${table}' does not exist`);
    }

    // Fetch data from the specified table
    const [rows] = await pool.query(`SELECT * FROM ??`, [table]); // Use parameterized query to prevent SQL injection
    console.log('Data fetched:', rows); // Log the fetched data
    res.json(rows);
  } catch (error) {
    console.error(`Error fetching data from table ${table}:`, error);
    res.status(500).json({ error: `An error occurred while fetching data from table ${table}: ${error.message}` });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
