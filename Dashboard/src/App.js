// App.js
import React, { useEffect, useState } from 'react';
import './App.css';
import { Chart, LinearScale, PointElement, LineElement, Title, CategoryScale } from 'chart.js';
import TableWithLastEntry from './TableWithLastEntry';
import ChartWithLastEntryButton from './ChartWithLastEntryButton';
import ToggleSwitch from './ToggleSwitch';
import WorkingTimesForm from './WorkingTimesForm';

Chart.register(LinearScale, PointElement, LineElement, Title, CategoryScale);

function App() {
  const [tables, setTables] = useState([]);
  const [error, setError] = useState(null);

  // Define yourSubmitFunction to handle form submission
  const yourSubmitFunction = (tableName, workingTimes) => {
    console.log(`Submitted working times for table ${tableName}:`, workingTimes);
  };

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const apiUrl = 'http://185.164.4.216:5000/api/tables';
        const response = await fetch(apiUrl);

        if (!response.ok) {
          throw new Error('Failed to fetch tables');
        }

        const tablesData = await response.json();
        console.log('Fetched tables:', tablesData);
        setTables(tablesData);
      } catch (error) {
        console.error('Error fetching tables:', error);
        setError(error);
      }
    };

    fetchTables();

    // Set up polling
    const pollingInterval = setInterval(fetchTables, 60000); // Fetch every minute

    return () => clearInterval(pollingInterval); // Cleanup on unmount
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Last Entry Data for Each Table</h1>
        {error && <p>Error: {error.message}</p>}
        {tables.length > 0 ? (
          tables.map(table => (
            <div key={table} className="table-wrapper">
              <TableWithLastEntry tableName={table} />
              <div className="chart-toggle-container">
                <div className="chart-container">
                  <ChartWithLastEntryButton tableName={table} />
                </div>
                <div className="toggle-switch-container">
                  <ToggleSwitch tableName={table} />
                </div>
              </div>
              <WorkingTimesForm onSubmit={yourSubmitFunction} tableName={table} /> {/* Pass tableName */}
            </div>
          ))
        ) : (
          <p>Loading data...</p>
        )}
      </header>
    </div>
  );
}

export default App;
