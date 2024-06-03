const mqtt = require('mqtt');

// your credentials
const options = {
  username: 'microdain1',
  password: 'Fenix2017',
};

// connect to your cluster, insert your host name and port
const client = mqtt.connect('tls://test-vzwgj6.a01.euc1.aws.hivemq.cloud:8883', options);

// prints a received message
client.on('message', function(topic, message) {
  console.log(String.fromCharCode.apply(null, message)); // need to convert the byte array to string
});

// reassurance that the connection worked
client.on('connect', () => {
  console.log('Connected!');
});

// prints an error message
client.on('error', (error) => {
  console.log('Error:', error);
});

// subscribe and publish to the same topic
client.subscribe('messages');
client.publish('messages', 'Hello, this message was received!');
