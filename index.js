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
const { PythonShell } = require('python-shell'); // Add this line
const { exec } = require('child_process');

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

app.get('/config', (req, res) => {
  res.json(config);
});

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
    await wifi.connect({ ssid, psk: password });

    // Send a success response
    res.status(200).json({ message: `Connected to ${ssid}` });
  } catch (error) {
    console.error(error);

    // Send an error response
    res.status(500).json({ error: `Error connecting to ${ssid}` });
  }
});

// Endpoint to get a list of available WiFi networks
app.get('/wifi/scan', async (req, res) => {
  try {
    const networks = await wifi.scan();
    res.status(200).json({ networks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to scan for available WiFi networks.' });
  }
});


// Update config
app.put('/config', (req, res) => {
  const { ip, baseUrl, rcvport, clientport, defaultTrack } = req.body;

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

  // Add a new message event listener
  socket.on("message", function (message) {
    const data = JSON.parse(message);

    if (data.type === "neopixel" && data.color) {
      const hexColor = data.color;
      const options = {
        scriptPath: './python-scripts',
        args: [hexColor]
      };

      PythonShell.run('neopixel_control.py', options, (err, results) => {
        if (err) {
          console.error(err);
          socket.send(JSON.stringify({ error: 'Error running Python script' }));
        } else {
          socket.send(JSON.stringify({ message: 'NeoPixel color updated', results }));
        }
      });
    }
  });
});

// NeoPixel WebSocket server
const neopixelWss = new WebSocket.Server({ port: "8082" });

neopixelWss.on('connection', function (socket) {
    console.log("A NeoPixel Web Socket connection has been established!");

    socket.on('message', function (message) {
        const data = JSON.parse(message);

        if (data.type === 'neopixel') {
            const color = data.color;
            const pythonCommand = `sudo python3 ./python-scripts/neopixel_control.py "${color}"`;

            exec(pythonCommand, (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error}`);
                    return;
                }
                console.log(`stdout: ${stdout}`);
                console.error(`stderr: ${stderr}`);
            });
        }
    });
});
