const songInfoTable = document.getElementById('songInfo');
const configMenu = document.getElementById('configMenu');
const serverUrl = 'http://localhost:8081';

let configMenuOpen = false;

document.addEventListener('dblclick', async (event) => {
  if (configMenuOpen) {
    return;
  }

  const response = await fetch(`${serverUrl}/config`);
  const data = await response.json();

  document.getElementById('baseUrl').value = data.baseUrl;
  document.getElementById('rcvport').value = data.rcvport;
  document.getElementById('ip').value = data.ip;
  document.getElementById('clientport').value = data.clientport;
  document.querySelector(`input[name="defaultTrack"][value="${data.defaultTrack}"]`).checked = true;

  configMenu.style.display = 'block';
  songInfoTable.style.display = 'none';
  configMenuOpen = true;

  document.removeEventListener('dblclick', onDblClick);
});

const saveButton = document.getElementById('save-button');

saveButton.addEventListener('click', async () => {
  const baseUrl = document.getElementById('baseUrl').value;
  const rcvport = document.getElementById('rcvport').value;
  const ip = document.getElementById('ip').value;
  const clientport = document.getElementById('clientport').value;
  const defaultTrack = document.querySelector('input[name="defaultTrack"]:checked').value;

  const response = await fetch(`${serverUrl}/config`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ baseUrl, rcvport, ip, clientport, defaultTrack })
  });

  location.reload();
});

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

function onDblClick(event) {
  // Handle double click
}

function addDblClickListener() {
  document.addEventListener('dblclick', onDblClick);
}
