const osc = require('osc');
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8082, protocol: 'ws' });
let oscTransport = {};

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
  });
  // Send the OSC messages to connected clients
  udpPort.on("message", function (oscMessage) {
        ws.send(JSON.stringify(oscMessage));
  });
});

function startOSC(){
  // Set up an OSC server to listen for messages on port 8000
  const udpPort = new osc.UDPPort({
      localAddress: "127.0.0.1",
      localPort: 9000
  });
  const desiredAddresses = ["/beat/str"];
  udpPort.on("message", function (oscMessage) {
      if (desiredAddresses.includes(oscMessage.address)) {
//           console.log("Received OSC message:", oscMessage.address, oscMessage.args);
        oscTransport = {
          measure: oscMessage.args[0]
        }
      }
  });
  udpPort.on("ready", function () {
      console.log("OSC server is listening for messages on port 8081");
  });
  udpPort.open();
}

startOSC();