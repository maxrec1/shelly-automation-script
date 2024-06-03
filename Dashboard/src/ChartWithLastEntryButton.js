// ChartWithLastEntryButton.js

import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';

function ChartWithLastEntryButton({ tableName }) {
  const [chartData, setChartData] = useState(null);
  const [error, setError] = useState(null);
  const [showChart, setShowChart] = useState(false);

  const toggleChart = () => {
    setShowChart(!showChart);
  };

  useEffect(() => {
    const fetchLastEntry = async () => {
      try {
        const apiUrl = `http://185.164.4.216:5000/api/${tableName}`;
        const response = await fetch(apiUrl);

        if (!response.ok) {
          throw new Error(`Failed to fetch last entry for table ${tableName}`);
        }

        const data = await response.json();
       // console.log('Fetched last entry for chart', tableName, data);

        if (data.length > 0) {
          const consumedPowerData = data.map(entry => entry.power);
          setChartData(consumedPowerData);
        } else {
          console.warn(`No data received for table ${tableName}`);
        }
      } catch (error) {
        console.error(`Error fetching last entry for chart ${tableName}:`, error);
        setError(error);
      }
    };

    fetchLastEntry();

    const pollingInterval = setInterval(fetchLastEntry, 60000);

    return () => clearInterval(pollingInterval);
  }, [tableName]);

  return (
    <div className="chart-container" style={{ minHeight: showChart ? '300px' : 'auto' }}>
      <button onClick={toggleChart}>
        {showChart ? 'Hide Chart' : 'Show Chart'}
      </button>
      {showChart && (
        <>
          <h2>Consumed Power Chart</h2>
          {error && <p>Error: {error.message}</p>}
          {chartData ? (
            <Line
              data={{
                labels: chartData.map((_, index) => index + 1),
                datasets: [
                  {
                    label: 'Consumed Power [Wh]',
                    data: chartData,
                    fill: false,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1,
                  },
                ],
              }}
              options={{
                scales: {
                  x: {
                    type: 'linear',
                  },
                },
              }}
            />
          ) : (
            <p>Loading chart data...</p>
          )}
        </>
      )}
    </div>
  );
}

export default ChartWithLastEntryButton;
