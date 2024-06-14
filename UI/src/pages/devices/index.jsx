import React from "react";
import { Box, useTheme } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../theme";
// import { mockDataContacts } from "../../data/mockData"; // Comment out or remove the mock data import

import Header from "../../components/Header";

const Devices = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const columns = [
    { field: "id", headerName: "Id", width: 50 },
    { field: "registrarId", headerName: "Registrar Id", width: 100 },
    { field: "name", headerName: "Name", width: 100 }, // Update field key to 'name'
    { field: "client", headerName: "Client", width: 100 }, // Update field key to 'client'
    { field: "location", headerName: "Location", width: 100 }, // Update field key to 'location'
    { field: "date", headerName: "Date", width: 100 }, // Update field key to 'date'
    { field: "time", headerName: "Time", width: 100 }, // Update field key to 'time'
    { field: "holiday", headerName: "Holiday", width: 100 }, // Update field key to 'holiday'
    { field: "active", headerName: "Active", width: 100 }, // Update field key to 'active'
    { field: "power", headerName: "Power", width: 100 }, // Update field key to 'power'
    { field: "co2", headerName: "CO2", width: 100 }, // Update field key to 'co2'
  ];
  
  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="DEVICES" subtitle="Welcome to your Devices" />
      </Box>
      <Box
        m="8px 0 0 0"
        width="100%"
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
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
            color: `${colors.grey[100]} !important`,
          },
        }}
      >
        <DataGrid
          rows={[]} // Provide an empty array for rows
          columns={columns}
          components={{ Toolbar: GridToolbar }}
        />
      </Box>
    </Box>
  );
};

export default Devices;
