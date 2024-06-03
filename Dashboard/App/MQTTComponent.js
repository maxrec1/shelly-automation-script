import React, { useEffect } from 'react';
import mqtt from 'mqtt';

const MQTTComponent = () => {

  useEffect(() => {
    // MQTT broker options including credentials
    const options = {
      host: 'mqtt://test-vzwgj6.a01.euc1.aws.hivemq.cloud',
      port: 8883,
      username: 'microdain1',
      password: 'Fenix2017',
    };

    // Connect to MQTT broker with options
    const mqttClient = mqtt.connect(options);

    // Publish a message on app launch
    mqttClient.on('connect', () => {
      mqttClient.publish('your/topic', 'Hello, MQTT!');
      mqttClient.end(); // Close the connection after publishing the message
    });

  }, []); // Empty dependency array means this effect runs only once on mount

  return (
    <div>
      <h1>MQTT Messages</h1>
    </div>
  );
};

export default MQTTComponent;
