var updateInterval = null;
var lastMatch = null;

function updateLyrics(position) {
  var lyrics = response.lyrics.Position;
  var lyricsTable = document.getElementById("lyrics");

  // Add a variable to store the last successful match
  var match = null;
  for (var time in lyrics) {
    // Split the time string into an array of three elements
    var timeParts = time.split('.');

    // Split the position string into an array of three elements
    var positionParts = position.split('.');

    // Compare the first and second elements of the arrays
    if (timeParts[0] == positionParts[0] && timeParts[1] == positionParts[1]) {
      match = lyrics[time];
      if (match === null) {
        match = lastMatch;
      }
      if (match !== null) {
        lastMatch = match;
      }
      break;
    }
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
  document.getElementById("position").innerHTML = "measure: " + position + " <b>" + (match || lastMatch || "") + "</b>";
}

function decimalToHex(decimal) {
  var hex = decimal.toString(16);
  while (hex.length < 6) {
    hex = "0" + hex;
  }
  return hex.substring(1);
}

function update() {
  // Find the index of the current region
  var currentRegionIndex = -1;
  for (var regionName in response.region) {
    currentRegionIndex++;
    var region = response.region[regionName];
    if (+response.transport.time >= +region.Start && +response.transport.time < +region.End) {
      break;
    }
  }

  // Get the previous region
  var previousRegionName = null;
  var previousRegionColor = null;
  if (currentRegionIndex > 0) {
    var regionNames = Object.keys(response.region);
    previousRegionName = regionNames[currentRegionIndex - 1];
    previousRegionColor = response.region[previousRegionName].Color;
  }

  // Update the previousRegionBanner element
  document.getElementById("previousRegionBanner").innerHTML = previousRegionName || "";
  document.getElementById("previousRegionBanner").style.backgroundColor = previousRegionColor ? "#" + decimalToHex(previousRegionColor) : "#808080";

  var xhttp = new XMLHttpRequest();
  lastMatchedPosition = null;
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      response = JSON.parse(this.responseText);
      for (var regionName in response.region) {
        var region = response.region[regionName];
          console.log("response.transport.time: " + response.transport.time);
        if (+response.transport.time >= +region.Start && +response.transport.time < +region.End) {
          console.log("response.transport.time: " + response.transport.time);
          console.log("region.Start: " + region.Start);
          console.log("region.End: " + region.End);
          console.log("regionName: " + regionName);
          var activeRegionElement = document.getElementById("activeRegion");
          activeRegionElement.innerHTML = regionName;
          var color = +region.Color;
          activeRegionElement.style.backgroundColor = "#" + decimalToHex(color);
          break;
        }
      }      
      document.getElementById("response").innerHTML = JSON.stringify(response, null, 2);
      if (response.transport.playing == "1") {
        document.getElementById("position").innerHTML = "measure: " + response.transport.measure;
        document.getElementById("lyrics").innerHTML = "";
        updateLyrics(response.transport.measure);
      } else {
        document.getElementById("position").innerHTML = "";
        document.getElementById("lyrics").innerHTML = "";
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
    updateInterval = setInterval(update, 300); // update every 50 milliseconds
    document.getElementById("update-button").innerHTML = "Stop Updates";
  }
}
