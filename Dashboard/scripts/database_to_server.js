const mqtt = require('mqtt');
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

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
    console.log('Request Body:', req.body); // Log request body
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

// Dynamic endpoint to send MQTT message
app.post('/shellyplusplugs-:table/command/switch:0', async (req, res) => {
  const table = req.params.table;
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const [tables] = await pool.query("SHOW TABLES");
    const tableNames = tables.map(row => Object.values(row)[0]);

    if (!tableNames.includes(table)) {
      throw new Error(`Table '${table}' does not exist`);
    }

    const topic = `shellyplusplugs-${table}/command/switch:0`;
    client.publish(topic, message, (err) => {
      if (err) {
        console.error('Failed to publish message:', err);
        return res.status(500).json({ error: 'Failed to publish message' });
      }

      res.json({ success: true, message: 'Message sent' });
    });
  } catch (error) {
    console.error(`Error processing request for table ${table}:`, error);
    res.status(500).json({ error: `An error occurred while processing request for table ${table}: ${error.message}`});
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
