// Get references to the songInfo table and the config menu element
const songInfoTable = document.getElementById('songInfo');
const configMenu = document.getElementById('configMenu');
const serverUrl = 'http://localhost:8081';

// Add event listener for the "dblclick" event on the document
document.addEventListener('dblclick', async (event) => {
  // Fetch the configuration data from the API
  const response = await fetch(`${serverUrl}/config`);
  const data = await response.json();

  // Populate the form fields with the configuration data
  document.getElementById('baseUrl').value = data.baseUrl;
  document.getElementById('rcvport').value = data.rcvport;
  document.getElementById('ip').value = data.ip;
  document.getElementById('clientport').value = data.clientport;
  document.querySelector(`input[name="defaultTrack"][value="${data.defaultTrack}"]`).checked = true;

  // Show the config menu and hide the songInfo table
  configMenu.style.display = 'block';
  songInfoTable.style.display = 'none';
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
  const defaultTrack = document.querySelector('input[name="defaultTrack"]:checked').value;

  // Send a POST request to the server with the updated configuration data
  const response = await fetch(`${serverUrl}/config`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ baseUrl, rcvport, ip, clientport, defaultTrack })
  });

  location.reload();
});
