**Reaper API Teleprompter Service (RATS): RATS** is an API that provides access to information about REAPER media production software through a REST API.

**Endpoints** The following endpoints are available:

 - `/region` This endpoint returns the region information for the current
   track. The response includes the position and length of the region in
   seconds.
   
   `/transport` This endpoint returns the transport state for REAPER. The
   response includes the current position in seconds and the status of
   the transport (playing or stopped).
   
   `/lyrics` This endpoint returns the lyrics for the current track.

Usage To use RATS, send a GET request to one of the above endpoints. The endpoint can be accessed on localhost:3000.

For example, to get the transport information, send a GET request to localhost:3000/transport.

Setup To set up RATS, follow these steps:

Clone this repository Run `npm install` to install the dependencies Run `node setup.js` to create the secrets directory and config.js file Follow the prompts in the terminal to input the base URL and port for the API Start the server by running `node rats.js` Requirements Node.js v12.0.0 or higher REAPER v6.11 or higher
