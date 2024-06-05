const mqtt = require('mqtt');
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const axios = require('axios');


const app = express();
const PORT = process.env.PORT || 5000;

// Your credentials
const options = {
  username: 'microdain1',
  password: 'Fenix2017',
};

// Connect to your MQTT broker
const client = mqtt.connect('tls://test-vzwgj6.a01.euc1.aws.hivemq.cloud:8883', options);

const pool = mysql.createPool({
  host: 'localhost',
  user: 'microdain',
  password: 'Fenix2017',
  database: 'shelly_database1',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Ensure the connection worked
client.on('connect', () => {
  console.log('Connected!');
});

// Print an error message
client.on('error', (error) => {
  console.log('Error:', error);
});

app.use(cors());
app.use(express.json()); // Middleware to parse JSON bodies

// Middleware to log only POST APIs
app.use((req, res, next) => {
  if (req.method === 'POST') {
    console.log(`${req.method} ${req.path}`);
  }
  next();
});

// Endpoint to get list of tables
app.get('/api/tables', async (req, res) => {
 try {
    const [rows] = await pool.query("SHOW TABLES");
    const tables = rows.map(row => Object.values(row)[0]);
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
    const [tables] = await pool.query("SHOW TABLES");
    const tableNames = tables.map(row => Object.values(row)[0]);

    if (!tableNames.includes(table)) {
      throw new Error(`Table '${table}' does not exist`);
    }

    const [rows] = await pool.query(`SELECT * FROM ??`, [table]);
    res.json(rows);
  } catch (error) {
    console.error(`Error fetching data from table ${table}:`, error);
    res.status(500).json({ error: `An error occurred while fetching data from table ${table}: ${error.message}` });
  }
});

// Define a variable to store the posted data
let scheduledEvents = {};

// POST endpoint to schedule events
app.post('/shellyplusplugs-:table/schedule', async (req, res) => {
  const table = req.params.table;
  const { events } = req.body;

  if (!events) {
    return res.status(400).json({ error: 'Events data is required' });
  }

  try {
    // Store the posted events data
    scheduledEvents[table] = events;

    // Respond with success message
    res.json({ success: true, message: 'Events scheduled successfully' });
  } catch (error) {
    console.error(`Error processing schedule request for table ${table}:`, error);
    res.status(500).json({ error: `An error occurred while processing schedule request for table ${table}: ${error.message}` });
  }
});

// GET endpoint to retrieve scheduled events
app.get('/shellyplusplugs-:table/schedule', async (req, res) => {
  const table = req.params.table;

  try {
    // Retrieve the scheduled events data for the specified table
    const events = scheduledEvents[table];

    if (!events) {
      return res.status(404).json({ error: `No events scheduled for table '${table}'` });
    }

    // Respond with the scheduled events data
    res.json(events);
  } catch (error) {
    console.error(`Error retrieving scheduled events for table ${table}:`, error);
    res.status(500).json({ error: `An error occurred while retrieving scheduled events for table ${table}: ${error.message}` });
  }
});



// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
