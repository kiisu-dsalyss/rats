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


app.get('/transport', handleRequest(transport.endpoint, transport.parseTransportResponse));
app.get('/region', handleRequest(region.endpoint, region.parseRegionResponse));
app.get('/lyrics', handleRequest(lyrics.endpoint, lyrics.parseLyricsResponse));

app.listen(config.port, () => {
  console.log(`Reaper API Teleprompter Service (RATS) listening on port ${config.port}`);
});
