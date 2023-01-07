var updateInterval = null;
var lastMatch = null;

function updateLyrics(response) {
  var position = response.transport.measure
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
      document.getElementById("notes").innerHTML = ( match || lastMatch || "----");
       
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
  document.getElementById("measure").innerHTML = "measure: " + position + " <b>" + (match || lastMatch || "") + "</b>";
}

function decimalToHex(decimal) {
  decimal = decimal || 0;
  var hex = decimal.toString(16);
  while (hex.length < 6) {
    hex = "0" + hex;
  }
  return hex.substring(1);
}

function getComplimentaryColor(color) {
  // Convert the color to RGB
  var r = parseInt(color.substring(0, 2), 16);
  var g = parseInt(color.substring(2, 4), 16);
  var b = parseInt(color.substring(4, 6), 16);

  // Convert the RGB values to HSL
  r /= 255;
  g /= 255;
  b /= 255;
  var max = Math.max(r, g, b);
  var min = Math.min(r, g, b);
  var h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  // Calculate the complimentary hue
  h = (h + 0.5) % 1;

  // Convert the HSL values back to RGB
  r = g = b = l;
  var m2 = l <= 0.5 ? l * (s + 1) : l + s - l * s;
  var m1 = l * 2 - m2;
  r = hue2rgb(m1, m2, h + 1/3);
  g = hue2rgb(m1, m2, h);
  b = hue2rgb(m1, m2, h - 1/3);

  // Convert the RGB values back to a hex string
  r = Math.round(r * 255).toString(16).padStart(2, "0");
  g = Math.round(g * 255).toString(16).padStart(2, "0");
  b = Math.round(b * 255).toString(16).padStart(2, "0");
  var color = `#${r}${g}${b}`;
  return color;
}

function hue2rgb(m1, m2, h) {
  if (h < 0) h += 1;
  if (h > 1) h -= 1;
  if (h < 1/6) return m1 + (m2 - m1) * h * 6;
  if (h < 1/2) return m2;
  if (h < 2/3) return m1 + (m2 - m1) * (2/3 - h) * 6;
  return m1;
}

function updateBanner(bannerElementId, regionName, regionColor, decimalToHex) {
  // Update the banner element
  var backColor = decimalToHex(regionColor);
  document.getElementById(bannerElementId).style.color = getComplimentaryColor(backColor);
  document.getElementById(bannerElementId).innerHTML = regionName || "";
  document.getElementById(bannerElementId).style.backgroundColor = regionColor ? "#" + backColor : "#808080";
}


function updatePreviousRegionBanner(response, decimalToHex) {
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

  // Update the previous region banner element
  updateBanner("previousRegionBanner", previousRegionName, previousRegionColor, decimalToHex);
}

function updateCurrentRegionBanner(response, decimalToHex) {
  // Find the current region
  var currentRegionName = null;
  var currentRegionColor = null;
  for (var regionName in response.region) {
    var region = response.region[regionName];
    if (+response.transport.time >= +region.Start && +response.transport.time < +region.End) {
      currentRegionName = regionName;
      currentRegionColor = region.Color;
      break;
    } 
  }

  // Update the current region banner element
  updateBanner("activeRegion", currentRegionName, currentRegionColor, decimalToHex);
}

function updateNextRegionBanner(response, decimalToHex) {
  // Find the index of the current region
  var currentRegionIndex = -1;
  for (var regionName in response.region) {
    currentRegionIndex++;
    var region = response.region[regionName];
    if (+response.transport.time >= +region.Start && +response.transport.time < +region.End) {
      break;
    }
  }

  // Get the next region
  var nextRegionName = null;
  var nextRegionColor = null;
  var regionNames = Object.keys(response.region);
  if (currentRegionIndex < regionNames.length - 1) {
    nextRegionName = regionNames[currentRegionIndex + 1];
    nextRegionColor = response.region[nextRegionName].Color;
  }

  // Update the next region banner element
  updateBanner("nextRegion", nextRegionName, nextRegionColor, decimalToHex);
}

function calcPercentage(startTime, endTime, position) {
  // Convert start time, end time, and position to seconds
  var startSeconds = startTime * 60;
  var endSeconds = endTime * 60;
  var positionSeconds = position * 60;

  // Calculate the length of the region in seconds
  var regionLength = endSeconds - startSeconds;

  // Calculate the amount of time that has passed in seconds
  var timePassed = positionSeconds - startSeconds;

  // Calculate the percentage of the region that has been played
  var percentagePlayed = (timePassed / regionLength) * 100;

  return percentagePlayed;
}

function getBarAndPercentage(position) {
  var positionParts = position.split(".");
  var bar = parseInt(positionParts[1]);
  var percentage = parseInt(positionParts[2]);
  if (percentage > 1) {
    percentage = 100;
  }
  return {
    bar: bar,
    percentage: percentage
  };
}

function populateFourBars(position, lyrics) {
  var positionParts = position.split(".");
  var measure = parseInt(positionParts[0]);
  var next = measure + 1;
  var last = next + 1;
  
  for (var i = 1; i <= 4; i++) {
    document.getElementById('bar' + i).innerHTML = lyrics[measure + '.' +  i  + ".00"] || ".";
    document.getElementById('nextbar' + i).innerHTML = lyrics[next + '.' +  i  + ".00"] || ".";
    document.getElementById('lastbar' + i).innerHTML = lyrics[last + '.' +  i  + ".00"] || ".";
  }
}

function getDotElements() {
  return {
    1: document.getElementById('dot1'),
    2: document.getElementById('dot2'),
    3: document.getElementById('dot3'),
    4: document.getElementById('dot4')
  };
}

function getBarElements() {
  return {
    1: document.getElementById('bar1'),
    2: document.getElementById('bar2'),
    3: document.getElementById('bar3'),
    4: document.getElementById('bar4')
  };
}


function processResponse(response) {
  // Convert regions object to array and store in variable
  var regions = [];
  for (var regionName in response.region) {
    var region = response.region[regionName];
    region.name = regionName;
    regions.push(region);
  }

  // Cache DOM references
  var dotElements = getDotElements();
  var barElements = getBarElements();

  var activeRegionElement = document.getElementById("activeRegion");
  var progressBarElement = document.getElementById("progressBar");
  var responseElement = document.getElementById("response");
  var measureElement = document.getElementById("measure");
  var lyricsElement = document.getElementById("lyrics");
  var notesElement = document.getElementById("notes");

  // Extract data from response and update DOM
  var dotProgress = getBarAndPercentage(response.transport.measure);
  dotElements[dotProgress.bar].value = 0;
  var prevDot = dotProgress.bar -1;
  if (prevDot === 0) { prevDot = 4 }
  dotElements[prevDot].value = 100;
  populateFourBars(response.transport.measure, response.lyrics.Position);
  barElements[dotProgress.bar].style.backgroundColor = "blue";
  barElements[prevDot].style.backgroundColor = "black";       
  for (var i = 0; i < regions.length; i++) {
    var region = regions[i];
    if (+response.transport.time >= +region.Start && +response.transport.time < +region.End) {
      activeRegionElement.innerHTML = region.name;
      var color = +region.Color;
      activeRegionElement.style.backgroundColor = "#" + decimalToHex(color);
      break;
    }
  }
  var progressPercent = calcPercentage(+region.Start, +region.End, +response.transport.time);
  progressBarElement.value = progressPercent;
  responseElement.innerHTML = JSON.stringify(response, null, 2);
  if (response.transport.playing == "1") {
    measureElement.innerHTML = "measure: " + response.transport.measure;
    lyricsElement.innerHTML = "";
    updateLyrics(response);        
  } else {
    notesElement.innerHTML = "";
    lyricsElement.innerHTML = "";
  }

  // Call updatePreviousRegionBanner and updateCurrentRegionBanner
  updatePreviousRegionBanner(response, decimalToHex);
  updateCurrentRegionBanner(response, decimalToHex);
  updateNextRegionBanner(response, decimalToHex);
}


function update() {
  var xhttp = new XMLHttpRequest();
  lastMatchedPosition = null;
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var response = JSON.parse(this.responseText);
      processResponse(response);
    }
  };
  xhttp.open("GET", "http://localhost:3000/song?track=1", true);
  xhttp.send();
//   resetAllDots(100);  
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
