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

const handleSongRequest = (req, res) => {
  const trackId = req.query.track;
  Promise.all([
    new Promise((resolve, reject) => {
      request(`${baseUrl}${transport.endpoint}`, (error, response, body) => {
        if (error) {
          reject(error);
        } else {
          resolve(transport.parseTransportResponse(body));
        }
      });
    }),
    new Promise((resolve, reject) => {
      request(`${baseUrl}${region.endpoint}`, (error, response, body) => {
        if (error) {
          reject(error);
        } else {
          resolve(region.parseRegionResponse(body));
        }
      });
    }),
    new Promise((resolve, reject) => {
      request(`${baseUrl}${lyrics.endpoint}${trackId}`, (error, response, body) => {
        if (error) {
          reject(error);
        } else {
          resolve(lyrics.parseLyricsResponse(body));
        }
      });
    })
  ])
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
