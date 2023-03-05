const express = require('express');
const bodyParser = require('body-parser');
const config = require('./secrets/config');
const lyrics = require('./endpoints/lyrics');
const request = require('request');
const region = require('./endpoints/region');
const fs = require('fs');
const os = require('os');
const Wifi = require('rpi-wifi-connection');
const wifi = new Wifi();

const baseUrl = config.baseUrl;
console.log(baseUrl);
var osc = require("osc"),
    WebSocket = require("ws");

var getIPAddresses = function () {
    ipAddresses = [config.ip]
    return ipAddresses;
};

// Bind to a UDP socket to listen for incoming OSC events.
var udpPort = new osc.UDPPort({
    localAddress: "0.0.0.0",
    localPort: config.rcvport
});

udpPort.on("ready", function () {
    var ipAddresses = getIPAddresses();
    console.log("Listening for OSC over UDP.");
    ipAddresses.forEach(function (address) {
        console.log("Rats Host:", address + ", Port:", udpPort.options.localPort);
    });
    console.log(`Client App: http://localhost:${config.clientport}`);
});

udpPort.open();

// Create an Express-based Web Socket server to which OSC messages will be relayed.
var appResources = __dirname + "/web",
    app = express(),
    server = app.listen(config.clientport),
    wss = new WebSocket.Server({
        server: server
    });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // allow requests from any domain
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use("/", express.static(appResources, {}));

const handleRequest = (endpoint, parseResponse) => (req, res) => {
  const trackId = req.query.track || '';
  const fullUrl = baseUrl + endpoint + trackId;
  request(fullUrl, (error, response, body) => {
    if (error) {
      res.status(500).json({ error: 'Error accessing URL' });
    } else {
      const parsedResponse = parseResponse(body);
      res.json(parsedResponse);
      res.end();
    }
  });
};

app.get('/region', handleRequest(region.endpoint, region.parseRegionResponse));
app.get('/lyrics', handleRequest(lyrics.endpoint, lyrics.parseLyricsResponse));
// Set up a route to serve the config data as JSON
app.get('/config', (req, res) => {
  res.json(config);
});
// Get the local IP address of the device
app.get('/ip', (req, res) => {
  const networkInterfaces = os.networkInterfaces();
  let ipAddress = '';
  for (const interfaceName of Object.keys(networkInterfaces)) {
    const networkInterface = networkInterfaces[interfaceName];
    for (const networkAddress of networkInterface) {
      if (networkAddress.family === 'IPv4' && !networkAddress.internal) {
        ipAddress = networkAddress.address;
        break;
      }
    }
    if (ipAddress) {
      break;
    }
  }
  if (ipAddress) {
    res.json({ ip: ipAddress });
  } else {
    res.status(500).json({ error: 'Unable to determine IP address' });
  }
});

// Set up a route to connect to a WiFi network
app.post('/wifi', async (req, res) => {
  const { ssid, password } = req.body;

  try {
    // Connect to the WiFi network
    await wifi.connectToAP(ssid, password);

    // Send a success response
    res.status(200).json({ message: `Connected to ${ssid}` });
  } catch (error) {
    console.error(error);

    // Send an error response
    res.status(500).json({ error: error.message });
  }
});

// Update config
app.put('/config', (req, res) => {
  const { ip, baseUrl, rcvport, clientport, defaultTrack } = req.body;

  // Validate the input here

  const newConfig = {
    ip,
    baseUrl,
    rcvport,
    clientport,
    defaultTrack
  };
  console.log(newConfig);

  // Write the new configuration data to the config.js file
  fs.writeFile('./secrets/config.js', `module.exports = ${JSON.stringify(newConfig)}`, (err) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Error updating configuration file',
       });
    } else {
      res.status(200).json({ message: 'Configuration file updated successfully' });
    }
  });

  // Update the config variable with the new configuration data
  config.ip = newConfig.ip;
  config.baseUrl = newConfig.baseUrl;
  config.rcvport = newConfig.rcvport;
  config.clientport = newConfig.clientport;
  config.defaultTrack = newConfig.defaultTrack;
});


app.listen(config.port, () => {
});

wss.on("connection", function (socket) {
    console.log("A Web Socket connection has been established!");
    var socketPort = new osc.WebSocketPort({
        socket: socket
    });

    var relay = new osc.Relay(udpPort, socketPort, {
        raw: true
    });
});
