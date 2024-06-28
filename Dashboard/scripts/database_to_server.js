const mqtt = require('mqtt');
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const axios = require('axios');
const cron = require('node-cron');
const bodyParser = require('body-parser');


const app = express();
const PORT = process.env.PORT || 5000;

// Your credentials
const options = {
  username: 'microdain',
  password: 'Fenix2017',
};

// Connect to your MQTT broker
const client = mqtt.connect('mqtt://185.164.4.216:1883', options);

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
  console.log('Connected to MQTT broker!');
});

// Print an error message
client.on('error', (error) => {
  console.log('MQTT Error:', error);
});

app.use(cors());
app.use(express.json()); // Middleware to parse JSON bodies

app.use(bodyParser.json());


// Middleware to log only POST APIs
app.use((req, res, next) => {
  if (req.method === 'POST') {
    console.log(`${req.method} ${req.path}`);
  }
  next();
});

app.get('/api/tables', async (req, res) => {
  try {
    const [rows] = await pool.query("SHOW TABLES");
    const tables = rows.map(row => Object.values(row)[0]);
    
    // Filter out 'locations' and 'clients' tables
    const filteredTables = tables.filter(table => table !== 'locations' && table !== 'clients');

    res.json(filteredTables);
  } catch (error) {
    console.error('Error fetching list of tables:', error);
    res.status(500).json({ error: 'An error occurred while fetching list of tables' });
  }
});

app.get('/api/:table', async (req, res) => {
  const table = req.params.table;
  try {
    const [tables] = await pool.query("SHOW TABLES");
    const tableNames = tables.map(row => Object.values(row)[0]);

    if (!tableNames.includes(table)) {
      throw new Error(`Table '${table}' does not exist`);
    }

    const [rows] = await pool.query(`SELECT * FROM ??`, [table]);

    // Verify that the rows include the client field
    console.log('Fetched rows:', rows);

    res.json(rows);
  } catch (error) {
    console.error(`Error fetching data from table ${table}:`, error);
    res.status(500).json({ error: `An error occurred while fetching data from table ${table}: ${error.message}` });
  }
});
app.post('/api/:table/update-data', async (req, res) => {
  const table = req.params.table;
  const { client, location } = req.body;

  try {
    const [tables] = await pool.query("SHOW TABLES");
    const tableNames = tables.map(row => Object.values(row)[0]);

    if (!tableNames.includes(table)) {
      throw new Error(`Table '${table}' does not exist`);
    }

    // Initialize the query and the values array
    let query = `UPDATE ?? SET`;
    let values = [table];

    // Check if client field is provided
    if (client !== undefined) {
      query += ` client = ?`;
      values.push(client);
    }

    // Check if location field is provided
    if (location !== undefined) {
      if (client !== undefined) {
        query += `,`;
      }
      query += ` location = ?`;
      values.push(location);
    }

    query += ` WHERE 1`;

    // Execute the query
    const [result] = await pool.query(query, values);

    if (result.affectedRows === 0) {
      res.status(404).json({ error: `No rows updated. Please check the table and the fields.` });
    } else {
      console.log(`Updated ${result.affectedRows} rows in table ${table} with client value ${client} and location value ${location}`);
      res.json({ success: true, message: 'Fields updated successfully in the database' });
    }
  } catch (error) {
    console.error(`Error updating fields in table ${table}:`, error);
    res.status(500).json({ error: `An error occurred while updating the fields in table ${table}: ${error.message}` });
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

      console.log('Message published to topic:', topic);
      res.json({ success: true, message: 'Message sent' });
    });
  } catch (error) {
    console.error(`Error processing request for table ${table}:`, error);
    res.status(500).json({ error: `An error occurred while processing request for table ${table}: ${error.message}`});
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
    console.log('Events scheduled for table:', table);
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

// Variable to store the last fetched emission data
let lastEmissionData = null;

// Function to fetch emission data
const fetchEmissionData = async () => {
  try {
    console.log('Fetching emission data...');
    const response = await axios.get('https://www.nowtricity.com/api/emissions-previous-24h/austria/', {
      headers: {
        'X-Api-Key': '715a941c830d34554db5b0d681dd774c'
      }
    });

    // Log the retrieved data

    // Extract the emissions data
    const emissions = response.data.emissions;

    // Calculate the average value
    const values = emissions.map(e => e.value);
    const total = values.reduce((acc, val) => acc + val, 0);
    const average = total / values.length;

    console.log('Average emission value:', average);

    // Store the fetched data
    lastEmissionData = { average };
  } catch (error) {
    console.error('Error fetching emission data:', error);
  }
};

// Schedule the task to run once a day at midnight
cron.schedule('0 0 * * *', fetchEmissionData);

// Endpoint to get the last emission value and calculate the average
app.get('/api/emissions-previous-24h/austria', async (req, res) => {
  if (lastEmissionData) {
    res.json(lastEmissionData);
  } else {
    res.status(500).json({ error: 'Emission data not available' });
  }
});

// Endpoint to create a new client
app.post('/api/clients', async (req, res) => {
  const { companyName, contactPerson, email, contact, locations } = req.body;

  if (!companyName || !locations || locations.length === 0) {
    return res.status(400).json({ error: 'Company Name and at least one location are required' });
  }

  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    // Check if the client already exists
    const [existingClient] = await connection.query(
      'SELECT * FROM clients WHERE companyName = ? OR email = ?',
      [companyName, email]
    );

    if (existingClient.length > 0) {
      await connection.rollback();
      return res.status(409).json({ error: 'Client with the same company name or email already exists' });
    }

    // Insert new client
    const [clientResult] = await connection.query(
      'INSERT INTO clients (companyName, contactPerson, email, contact) VALUES (?, ?, ?, ?)',
      [companyName, contactPerson, email, contact]
    );

    const clientId = clientResult.insertId;

    for (const location of locations) {
      await connection.query(
        'INSERT INTO locations (clientId, locationName, address, contactPerson) VALUES (?, ?, ?, ?)',
        [clientId, location.locationName, location.address, location.contactPerson]
      );
    }

    await connection.commit();
    res.status(201).json({ success: true, message: 'Client created successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating client:', error);
    res.status(500).json({ error: 'An error occurred while creating the client' });
  } finally {
    connection.release();
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  // Fetch initial emission data on startup
  fetchEmissionData();
});
