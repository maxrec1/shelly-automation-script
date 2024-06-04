// TableWithLastEntry.js

import React, { useEffect, useState } from 'react';

function TableWithLastEntry({ tableName }) {
  const [lastEntry, setLastEntry] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLastEntry = async () => {
      try {
        const apiUrl = `http://185.164.4.216:5000/api/${tableName}`;
        const response = await fetch(apiUrl);

        if (!response.ok) {
          throw new Error(`Failed to fetch last entry for table ${tableName}`);
        }

        const data = await response.json();
        //console.log('Fetched last entry for table', tableName, data);

        if (data.length > 0) {
          // Convert the date string to a Date object
          const formattedData = {
            ...data[data.length - 1],
            date: new Date(data[data.length - 1].date).toLocaleDateString(), // Format the date
          };
          setLastEntry(formattedData);
        } else {
          console.warn(`No data received for table ${tableName}`);
        }
      } catch (error) {
        console.error(`Error fetching last entry for table ${tableName}:`, error);
        setError(error);
      }
    };

    fetchLastEntry();

    // Set up polling for each table
    const pollingInterval = setInterval(fetchLastEntry, 60000); // Fetch every minute

    return () => clearInterval(pollingInterval); // Cleanup on unmount
  }, [tableName]);

  return (
    <div className="table-container">
      <h2>{tableName}</h2>
      {error && <p>Error: {error.message}</p>}
      {lastEntry ? (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>City</th>
              <th>Day</th>
              <th>Date</th>
              <th>Time</th>
              <th>isHoliday</th>
              <th>isActive</th>
              <th>Power [Wh]</th>
              <th>CO2 [g]</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              {Object.values(lastEntry).map((value, index) => (
                <td key={index}>{value}</td>
              ))}
            </tr>
          </tbody>
        </table>
      ) : (
        <p>Loading last entry...</p>
      )}
    </div>
  );
}

export default TableWithLastEntry;