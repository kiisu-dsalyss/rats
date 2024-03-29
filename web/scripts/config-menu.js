// Get references to the songInfo table and the config menu element
const songInfoTable = document.getElementById('songInfo');
const configMenu = document.getElementById('configMenu');
const serverUrl = window.location.href;

const ipAddress = document.createElement('p');
configMenu.appendChild(ipAddress);

const updateIpAddress = async () => {
  try {
    const response = await fetch(`${serverUrl}ip`);
    const data = await response.json();
    ipAddress.textContent = `Device IP Address: ${data.ip}`;
  } catch (error) {
    console.error(error);
    ipAddress.textContent = 'Unable to determine IP address';
  }
};

updateIpAddress();

// Define the event listener function for the double click event
const eventListener = async (event) => {
  // Fetch the configuration data from the API
  const response = await fetch(`${serverUrl}config`);
  const data = await response.json();
  // Pull fresh IP address when menu opens
  updateIpAddress();

  // Populate the form fields with the configuration data
  document.getElementById('baseUrl').value = data.baseUrl;
  document.getElementById('rcvport').value = data.rcvport;
  document.getElementById('ip').value = data.ip;
  document.getElementById('clientport').value = data.clientport;
  document.querySelector(`input[name="defaultTrack"][value="${data.defaultTrack}"]`).checked = true;

  // Show the config menu and hide the songInfo table
  configMenu.style.display = 'block';
  songInfoTable.style.display = 'none';

  // Remove the dblclick event listener from the document
  document.removeEventListener('dblclick', eventListener);
};

// Add event listener for the "dblclick" event on the document
document.addEventListener('dblclick', eventListener);

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

  // Send a PUT request to the server with the updated configuration data
  const response = await fetch(`${serverUrl}config`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ baseUrl, rcvport, ip, clientport, defaultTrack })
  });

  location.reload();
});

// Add a click event listener to the cancel button
const cancelButton = document.getElementById('cancel-button');
cancelButton.addEventListener('click', () => {
  // Hide the config menu and show the songInfo table
  configMenu.style.display = 'none';
  songInfoTable.style.display = 'table';

  // Add back the dblclick event listener to the document
  document.addEventListener('dblclick', eventListener);
});
// Add a click event listener to the cancel button
cancelButton.addEventListener('click', () => {
  // Hide the config menu and show the songInfo table
  configMenu.style.display = 'none';
  songInfoTable.style.display = 'table';

  // Add back the dblclick event listener to the document
  document.addEventListener('dblclick', eventListener);
});

// Keyboard for configMenu
var keyboard = document.getElementById('virtualKeyboard');
var lastInput = null;

keyboard.addEventListener('click', function(event) {
  var key = event.target;
  var value = key.innerText;
  if (value === '←') {
    lastInput.value = lastInput.value.slice(0, -1);
  } else if (value === '↵') {
    lastInput.value += '\n';
  } else {
    lastInput.value += value;
  }
  console.log('You clicked the ' + value + ' key!');
  if (value === '↵') {
    keyboard.style.display = 'none';
  } else {
    setTimeout(function() {
      keyboard.style.display = 'flex';
    }, 100);
  }
});

var inputs = document.querySelectorAll('input[type="text"]');

for (var i = 0; i < inputs.length; i++) {
  inputs[i].addEventListener('click', function() {
    lastInput = this;
    keyboard.style.display = 'flex';
  });
}