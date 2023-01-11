const osc = require('osc');
const config = require('./secrets/config');
const express = require('express');
const lyrics = require('./endpoints/lyrics');
const request = require('request');
const region = require('./endpoints/region');
const transport = require('./endpoints/transport');

let oscTransport = {};

const app = express();
let baseUrl = config.baseUrl;
if (!baseUrl.startsWith('http://')) {
  baseUrl = `http://${baseUrl}`;
}

const handleRequest = (endpoint, parseResponse) => {
  return (req, res) => {
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
};

const combineEndpointResponses = (transportResponse, regionResponse, lyricsResponse) => {
  return {
    transport: transportResponse,
    region: regionResponse,
    lyrics: lyricsResponse
  };
}

const cache = {};

let numRequests = 0;
let startTime = process.hrtime();

const handleSongRequest = (req, res) => {
  // Inside your request handling function
  numRequests += 1;
  // Calculate the elapsed time since the startTime
  const elapsedTime = process.hrtime(startTime);
  // Calculate the number of seconds that have elapsed
  const elapsedSeconds = elapsedTime[0] + elapsedTime[1] / 1e9;
  // Calculate the number of requests per second
  const requestsPerSecond = numRequests / elapsedSeconds;
//   console.log(`Number of requests per second: ${requestsPerSecond}\r`);
  const trackId = req.query.track;
  // Set the expiration time for the cache (1 minute in this example)
  const cacheExpiration = Date.now() + (0.5 * 60 * 1000);
  // Check the cache for saved responses from the lyrics and regions endpoints
  const lyricsResponse = cache[`lyrics${trackId}`];
  const regionResponse = cache[`regions`];

  // If a cached response is available and has not expired, use it instead of sending a new request
  let lyricsPromise;
  if (lyricsResponse && lyricsResponse.timestamp > Date.now()) {
    lyricsPromise = Promise.resolve(lyricsResponse.data);
  } else {
    lyricsPromise = new Promise((resolve, reject) => {
      request(`${baseUrl}${lyrics.endpoint}${trackId}`, (error, response, body) => {
        if (error) {
          reject(error);
        } else {
          let lyricsData = lyrics.parseLyricsResponse(body);
          // Update the cache with the new response
          cache[`lyrics${trackId}`] = {
            timestamp: cacheExpiration,
            data: lyricsData,
          };
          resolve(lyricsData);
        }
      });
    });
  }

  let regionPromise;
  if (regionResponse && regionResponse.timestamp > Date.now()) {
    regionPromise = Promise.resolve(regionResponse.data);
  } else {
    regionPromise = new Promise((resolve, reject) => {
      request(`${baseUrl}${region.endpoint}`, (error, response, body) => {
        if (error) {
          reject(error);
        } else {
          let regionData = region.parseRegionResponse(body);
          // Update the cache with the new response
          cache[`regions`] = {
            timestamp: cacheExpiration,
            data: regionData,
          };
          resolve(regionData);
        }
      });
    });
  }

  // Send a request to the transport endpoint (no caching is used for this endpoint)
  const transportPromise = new Promise((resolve, reject) => {
    request(`${baseUrl}${transport.endpoint}`, (error, response, body) => {
      if (error) {
        reject(error);
      } else {
        resolve(oscTransport);
      }
    });
  });

  // Wait for all the promises to resolve and then combine the responses
  Promise.all([transportPromise, regionPromise, lyricsPromise])
  .then(([transportResponse, regionResponse, lyricsResponse]) => {
    res.json(combineEndpointResponses(transportResponse, regionResponse, lyricsResponse));
  })
  .catch((error) => {
    res.status(500).json({ error: 'Error accessing endpoints' });
  });
};


app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // allow requests from any domain
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/song', handleSongRequest);
app.get('/transport', (req, res) => {
  res.send(oscTransport)
})
app.get('/region', handleRequest(region.endpoint, region.parseRegionResponse));
app.get('/lyrics', handleRequest(lyrics.endpoint, lyrics.parseLyricsResponse));

app.listen(config.port, () => {
  console.log(`Reaper API Teleprompter Service (RATS) listening on port ${config.port}`);
});

function startOSC() {
  // Set up an OSC server to listen for messages on port 9000
  const udpPort = new osc.UDPPort({
    localAddress: "127.0.0.1",
    localPort: 9000
  });
  const desiredAddresses = ["/beat/str", "/time"];
  oscTransport = {
    measure: null,
    time: null
  };
  udpPort.on("message", function (oscMessage) {
//     console.log(oscMessage);
    if (desiredAddresses.includes(oscMessage.address)) {
      if(oscMessage.address === "/beat/str"){
        oscTransport.measure = oscMessage.args[0];
      } else if(oscMessage.address === "/time"){
        oscTransport.time = oscMessage.args[0];
      }
    }
  });
  udpPort.on("ready", function () {
    console.log("OSC server is listening for messages on port 9000");
  });
  udpPort.open();
}



startOSC();
