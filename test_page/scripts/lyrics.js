var updateInterval = null;

var lastMatchedRow = null;

function updateLyrics(position) {
  var lyrics = response.lyrics.Position;
  var lyricsTable = document.getElementById("lyrics");
  lyricsTable.innerHTML = ""; // clear the table

  // Add a variable to store the last successful match
  var lastMatch = null;
  var match = null;
  for (var time in lyrics) {
    // Split the time string into an array of three elements
    var timeParts = time.split('.');

    // Split the position string into an array of three elements
    var positionParts = position.split('.');

    // Compare the first and second elements of the arrays
    if (timeParts[0] == positionParts[0] && timeParts[1] == positionParts[1]) {
      match = lyrics[time];
      lastMatch = match; // Update the last successful match
      break;
    }
  }

  // If no new match was found, use the last successful match instead
  if (!match) {
    match = lastMatch;
  }

  for (var time in lyrics) {
    var row = lyricsTable.insertRow(-1); // insert a new row at the end of the table
    var timeCell = row.insertCell(0);
    var lyricsCell = row.insertCell(1);
    timeCell.innerHTML = time;
    lyricsCell.innerHTML = lyrics[time];
    if (lyrics[time] == match) {
      row.classList.add("highlight");
    }
  }

  document.getElementById("position").innerHTML = "Position: " + position + " <b>" + (match ? match : "") + "</b>";
}

function highlightRow(row, prevRow, reset) {
  if (prevRow) {
    if (reset) {
      prevRow.classList.remove("highlight");
    } else {
      prevRow.classList.add("previous-highlight");
      prevRow.classList.remove("highlight");
    }
  }
  row.classList.add("highlight");
}


function update() {
  var xhttp = new XMLHttpRequest();
  lastMatchedPosition = null;
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      response = JSON.parse(this.responseText);
      document.getElementById("response").innerHTML = JSON.stringify(response, null, 2);
      if (response.transport.playing == "1") {
        document.getElementById("position").innerHTML = "Position: " + response.transport.Position;
        document.getElementById("lyrics").innerHTML = "";
        updateLyrics(response.transport.Position);
      } else {
        document.getElementById("position").innerHTML = "";
        document.getElementById("lyrics").innerHTML = "";
//         lastMatchedPosition = null;
      }
    }
  };
  xhttp.open("GET", "http://localhost:3000/song?track=1", true);
  xhttp.send();
}

function toggleResponse() {
  var responseElement = document.getElementById("response");
  if (responseElement.style.display === "none") {
    responseElement.style.display = "block";
    document.getElementById("toggle-button").innerHTML = "Hide Response";
  } else {
    responseElement.style.display = "none";
    document.getElementById("toggle-button").innerHTML = "Show Response";
  }
}

function toggleUpdates() {
  if (updateInterval) {
    clearInterval(updateInterval);
    updateInterval = null;
    document.getElementById("update-button").innerHTML = "Start Updates";
  } else {
    updateInterval = setInterval(update, 100); // update every 50 milliseconds
    document.getElementById("update-button").innerHTML = "Stop Updates";
  }
}
