const config = require('./secrets/config');
const lyrics = require('./endpoints/lyrics');
const request = require('request');
const region = require('./endpoints/region');
const express = require('express');

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


app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // allow requests from any domain
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use("/", express.static(appResources, {}));

const handleRequest = (endpoint, parseResponse) => (req, res) => {
  const trackId = req.query.track || '';
  const fullUrl = baseUrl + endpoint + trackId;
  console.log(`Request to: ${fullUrl}`);
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
