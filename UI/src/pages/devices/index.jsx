import React, { useState, useEffect, useCallback } from "react";
import { Box, useTheme } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import mqtt from "mqtt";
import CircleIcon from '@mui/icons-material/Circle';

const Devices = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [rows, setRows] = useState([]);
  const [emissionValue, setEmissionValue] = useState(null);
  const [mqttClients, setMqttClients] = useState({});
  const [totalDevices, setTotalDevices] = useState(0);
  const [onlineDevices, setOnlineDevices] = useState(0);
  const [offlineDevices, setOfflineDevices] = useState(0);

  const columns = [
    { field: "id", headerName: "Id", width: 50 },
    {
      field: "name",
      headerName: "Name",
      width: 150,
      cellClassName: "name-column--cell",
      renderCell: (params) => (
        <Box display="flex" alignItems="center">
          {params.value}
          {(params.row.active === true || params.row.active === false) ? (
            <CircleIcon style={{ color: 'green', marginLeft: '8px', fontSize: 'small' }} />
          ) : (
            <CircleIcon style={{ color: 'red', marginLeft: '8px', fontSize: 'small' }} />
          )}
        </Box>
      ),
    },
    { field: "registrarId", headerName: "Registrar Id", width: 100 },
    { field: "client", headerName: "Client", width: 100 },
    { field: "city", headerName: "City", width: 100 },
    { field: "location", headerName: "Location", width: 100 },
    { field: "date", headerName: "Date", width: 100 },
    { field: "time", headerName: "Time", width: 100 },
    { field: "holiday", headerName: "Holiday", width: 100 },
    { field: "active", headerName: "Active", width: 100 },
    { field: "power", headerName: "Power", width: 100 },
    { field: "co2", headerName: "CO2", width: 100 },
  ];

  const fetchEmissionValue = useCallback(async () => {
    try {
      const response = await fetch('http://185.164.4.216:5000/api/emissions-previous-24h/austria');
      const data = await response.json();
      const average = data.average;
      setEmissionValue(average);
    } catch (error) {
      console.error("Error fetching emission value: ", error);
    }
  }, []);

  const subscribeToMQTTTopic = useCallback((table) => {
    if (mqttClients[table]) {
      return; // Already subscribed
    }

    const client = mqtt.connect("ws://185.164.4.216:9001", {
      username: "microdain",
      password: "Fenix2017"
    });

    const statusTopic = `shellyplusplugs-${table}/status/switch:0`;

    client.on('connect', () => {
      client.subscribe(statusTopic, (err) => {
        if (!err) {
          console.log(`Successfully subscribed to ${statusTopic}`);
        } else {
          console.error(`Error subscribing to topic:`, err);
        }
      });
    });

    client.on('message', (topic, message) => {
      const messageStr = message.toString();

      if (topic === statusTopic) {
        try {
          const parsedMessage = JSON.parse(messageStr);
          const outputStatus = parsedMessage.output;
          console.log(`Output status for ${table}: ${outputStatus}`);

          setRows(prevRows => prevRows.map(row =>
            row.name === table ? { ...row, active: outputStatus } : row
          ));
        } catch (error) {
          console.error(`Error parsing JSON message from ${statusTopic}:`, error);
        }
      }
    });

    client.on('error', (err) => {
      console.error(`MQTT client error:`, err);
    });

    setMqttClients(prevClients => ({
      ...prevClients,
      [table]: client
    }));

    return () => {
      client.end();
    };
  }, [mqttClients]);

  const fetchData = useCallback(async (average) => {
    try {
      const response = await fetch("http://185.164.4.216:5000/api/tables");
      const tables = await response.json();
      const fetchTableData = async (table) => {
        try {
          const tableResponse = await fetch(`http://185.164.4.216:5000/api/${table}`);
          const tableData = await tableResponse.json();
          if (tableData.length > 0) {
            const lastEntry = tableData[tableData.length - 1];
            return {
              name: table,
              registrarId: lastEntry.registrarId || "",
              client: lastEntry.client || "",
              city: lastEntry.city || "",
              location: lastEntry.location || "",
              date: new Date(lastEntry.date).toLocaleDateString() || "",
              time: lastEntry.time || "",
              holiday: lastEntry.isHoliday,
              active: "offline", // Initial value set to null
              power: (lastEntry.power !== null && lastEntry.power !== undefined ? `${lastEntry.power} Wh` : "0 Wh"),
              co2: (lastEntry.power !== null && lastEntry.power !== undefined && average !== null ? `${(lastEntry.power * average / 1000).toFixed(2)} g` : "0 g"),
            };
          }
          return null;
        } catch (error) {
          console.error(`Error fetching data for table ${table}:`, error);
          return null;
        }
      };

      const allTableData = await Promise.all(tables.map((table) => fetchTableData(table)));
      const validTableData = allTableData.filter(data => data !== null);
      const enumeratedData = validTableData.map((data, index) => ({
        id: index + 1,
        ...data,
      }));

      setRows(enumeratedData);
      tables.forEach(table => subscribeToMQTTTopic(table));

    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  }, [subscribeToMQTTTopic]);

  useEffect(() => {
    fetchEmissionValue(); // Fetch emission value
  }, [fetchEmissionValue]);

  useEffect(() => {
    if (emissionValue !== null) {
      fetchData(emissionValue); // Initial fetch with the emission value
    }
  }, [emissionValue, fetchData]);

  useEffect(() => {
    // Calculate the total number of devices
    const total = rows.length;
    
    // Calculate the number of online devices
    const online = rows.filter(row => row.active === true || row.active === false).length;
    
    // Calculate the number of offline devices
    const offline = rows.filter(row => row.active === "offline").length;
  
    // Update the state variables
    setTotalDevices(total);
    setOnlineDevices(online);
    setOfflineDevices(offline);
  }, [rows]);

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="DEVICES" subtitle="Welcome to your Devices" />
      </Box>
      <Box
        m="8px 0 0 0"
        height="80vh"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .name-column--cell": {
            color: colors.greenAccent[300],
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.blueAccent[700],
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
        }}
      >
        <DataGrid rows={rows} columns={columns} />
      </Box>
      <Box mt="20px">
        <Header title="EMISSION VALUE" subtitle="Emission value in the previous 24 hours for Austria" />
        {emissionValue !== null ? (
          <p>The average emission value is {emissionValue}.</p>
        ) : (
          <p>Loading emission value...</p>
        )}
      </Box>
      <Box mt="20px">
        <Header title="DEVICE COUNTS" subtitle="Summary of device status" />
        <p>Total Devices: {totalDevices}</p>
        <p>Online Devices: {onlineDevices}</p>
        <p>Offline Devices: {offlineDevices}</p>
      </Box>
    </Box>
  );
};

export default Devices;
