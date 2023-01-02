**Reaper API Teleprompter Service (RATS): RATS** is an API that provides access to information about REAPER media production software through a REST API.

**Endpoints** The following endpoints are available:

 - `/region` The response includes the region names given in the project file
   
   `/transport` This endpoint returns the transport state for REAPER. The
   response includes the current position.
   
   `/lyrics` This endpoint returns the lyrics for the designated track. e.g. GET request to (localhost:3000/lyrics?track=1) 

Usage To use RATS, send a GET request to one of the above endpoints. The endpoint can be accessed on localhost:3000.

For example, to get the transport information, send a GET request to localhost:3000/transport.

Setup To set up RATS, follow these steps:

Clone this repository Run `npm install` to install the dependencies Run `node setup.js` to create the secrets directory and config.js file Follow the prompts in the terminal to input the base URL and port for the API Start the server by running `node rats.js` Requirements Node.js v12.0.0 or higher REAPER v6.11 or higher
