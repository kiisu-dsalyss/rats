const config = require('./secrets/config');
const express = require('express');
const lyrics = require('./endpoints/lyrics');
const request = require('request');
const region = require('./endpoints/region');
const transport = require('./endpoints/transport');

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

const handleSongRequest = (req, res) => {
  const trackId = req.query.track;

  // Set the expiration time for the cache (1 minute in this example)
  const cacheExpiration = Date.now() + (1 * 60 * 1000);

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
          // Update the cache with the new response
          cache[`lyrics${trackId}`] = {
            timestamp: cacheExpiration,
            data: lyrics.parseLyricsResponse(body),
          };
          resolve(lyrics.parseLyricsResponse(body));
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
          // Update the cache with the new response
          cache[`regions`] = {
            timestamp: cacheExpiration,
            data: region.parseRegionResponse(body),
          };
          resolve(region.parseRegionResponse(body));
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
        resolve(transport.parseTransportResponse(body));
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
app.get('/transport', handleRequest(transport.endpoint, transport.parseTransportResponse));
app.get('/region', handleRequest(region.endpoint, region.parseRegionResponse));
app.get('/lyrics', handleRequest(lyrics.endpoint, lyrics.parseLyricsResponse));

app.listen(config.port, () => {
  console.log(`Reaper API Teleprompter Service (RATS) listening on port ${config.port}`);
});
