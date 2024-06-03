// ToggleSwitch.js

import React, { useState } from 'react';
import Switch from 'react-switch';

function ToggleSwitch({ tableName }) {
  const [isActive, setIsActive] = useState(false);

  const handleToggle = (checked) => {
    setIsActive(checked);
  };

  return (
    <div className="toggle-switch-container">
      <label htmlFor={`switch-${tableName}`}>
        Power
      </label>
      <div className="switch-container"> {/* Add this wrapper div */}
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
