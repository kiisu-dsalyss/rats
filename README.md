# Reaper API Teleprompter Service (RATS)

RATS is an API that provides access to information about REAPER media production software through a REST API.

## Endpoints

The following endpoints are available:

- `/region`: This endpoint returns the region names in the project file.

- `/transport`: This endpoint returns the transport state for REAPER, including the current position.

- `/lyrics`: This endpoint returns the lyrics for the specified track. To specify a track, include a `track` query parameter in the request, e.g. `GET /lyrics?track=1`.

- `/song`: This endpoint returns a combination of the transport, region, and lyrics information for the specified track. To specify a track, include a `track` query parameter in the request, e.g. `GET /songs?track=1`.

## Usage

To use RATS, send a GET request to one of the above endpoints. The API is hosted on localhost at port 3000.

For example, to get the transport information, send a GET request to `localhost:3000/transport`.

## Setup

To set up RATS, follow these steps:

1. Clone this repository.
2. Run `npm install` to install the dependencies.
3. Run `node setup.js` to create the secrets directory and config.js file. Follow the prompts in the terminal to input the base URL and port for the API.
4. Start the server by running `node rats.js`.

### Requirements

- Node.js v12.0.0 or higher
- REAPER v6.11 or higher

## Teleprompter

In the teleprompter sub-directory there is an `index.html` showing usage of the RATS service. (Tested with Chrome only so far)