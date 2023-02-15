// Get references to the songInfo table and the config menu element
const songInfoTable = document.getElementById('songInfo');
const configMenu = document.getElementById('configMenu');
const serverUrl = 'http://localhost:8081';

// Set a variable to hold the timeout ID
let timeoutId;

// Add event listener for the "click" event on the document
document.addEventListener('click', (event) => {
  // Set a timeout for 3 seconds to show the config menu
  timeoutId = setTimeout(async () => {
    // Fetch the configuration data from the API
    const response = await fetch(`${serverUrl}/config`);
    const data = await response.json();
    // Populate the form fields with the configuration data
    document.getElementById('baseUrl').value = data.baseUrl;
    document.getElementById('rcvport').value = data.rcvport;
    document.getElementById('ip').value = data.ip;
    document.getElementById('clientport').value = data.clientport;
    document.getElementById('defaultTrack').value = data.defaultTrack;
    configMenu.style.display = 'block';
    songInfoTable.style.display = 'none'; // Hide the songInfo table
  }, 3000);
});

// Add event listener for the "mouseup" event on the document
document.addEventListener('mouseup', (event) => {
  // If the mouse button is released before 3 seconds, cancel the timeout
  clearTimeout(timeoutId);
  if (timeoutId) {
    configMenu.style.display = 'block'; // Show the config menu
    songInfoTable.style.display = 'none'; // Hide the songInfo table
  } else {
    configMenu.style.display = 'none'; // Hide the config menu
    songInfoTable.style.display = 'table'; // Show the songInfo table
  }
});

// Get a reference to the save button element
const saveButton = document.getElementById('save-button');

// Add a click event listener to the save button
saveButton.addEventListener('click', async () => {
  // Get the updated configuration data from the form fields
  const baseUrl = document.getElementById('baseUrl').value;
  const rcvport = document.getElementById('rcvport').value;
  const ip = document.getElementById('ip').value;
  const clientport = document.getElementById('clientport').value;
  const defaultTrack = document.getElementById('defaultTrack').value;

  // Send a POST request to the server with the updated configuration data
  const response = await fetch(`${serverUrl}/config`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ baseUrl, rcvport, ip, clientport, defaultTrack })
  });

  location.reload()
});
