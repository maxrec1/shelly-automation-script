import React, { useState } from 'react';
import Switch from 'react-switch';

function ToggleSwitch({ tableName }) {
  const [isActive, setIsActive] = useState(false);

  const handleToggle = async (checked) => {
    setIsActive(checked);
    const message = checked ? 'on' : 'off';
    try {
      const apiUrl = `http://185.164.4.216:5000/shellyplusplugs-${tableName}/command/switch:0`; // Construct apiUrl
      const response = await fetch(apiUrl, { // Use apiUrl in fetch call
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error('Failed to toggle switch');
      }

      const data = await response.json();
      console.log(data); // Handle success response if needed
    } catch (error) {
      console.error('Error toggling switch:', error);
      // Handle error
    }
  };

  return (
    <div className="toggle-switch-container">
      <label htmlFor={`switch-${tableName}`}>
        Power
      </label>
      <div className="switch-container">
        <Switch
          id={`switch-${tableName}`}
          onChange={handleToggle}
          checked={isActive}
          uncheckedIcon={false}
          checkedIcon={false}
          offColor="#888"
          onColor="#0f0"
        />
      </div>
    </div>
  );
}

export default ToggleSwitch;
