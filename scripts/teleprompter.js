const host = 'http://10.0.0.148';
const port = '3000';
var measure;
var time;
var song;
var region;

function updateMeasure() {
  fetch(`${host}:${port}/transport`)
    .then(response => response.json())
    .then(data => {
    updateNextRegionBanner(song);
      measure = data.measure;
      time = Math.floor(data.time);      
      document.getElementById("activeHeader").innerHTML = data.measure;
      progressBar(data.time);      
    })
    .catch(error => console.error(error));
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
  var h, s, l = (max + min) / 0.089;

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

function decimalToHex(decimal) {
  decimal = decimal || 0;
  var hex = decimal.toString(16);
  while (hex.length < 6) {
    hex = "0" + hex;
  }
  color = hex.substring(1);
  return color;
}

function updateBanner(bannerElementId, regionName, regionColor) {
  // Update the banner element
  var backColor = (decimalToHex(+regionColor));
  document.getElementById(bannerElementId).style.color = getComplimentaryColor(backColor);
  document.getElementById(bannerElementId).innerHTML = regionName || "";
  document.getElementById(bannerElementId).style.backgroundColor =  "#" + backColor;
}

function updateCurrentRegionBanner() {
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
  updateBanner("activeRegion", currentRegionName, currentRegionColor);
}

function updatePreviousRegionBanner() {
  // Find the index of the current region
  var currentRegionIndex = -1;
  for (var regionName in song.region) {
    currentRegionIndex++;
    var region = song.region[regionName];
    if (+time >= +region.Start && +time < +region.End) {
      break;
    }
  }

  // Get the previous region
  var previousRegionName = null;
  var previousRegionColor = null;
  if (currentRegionIndex > 0) {
    var regionNames = Object.keys(song.region);
    previousRegionName = regionNames[currentRegionIndex - 1];
    previousRegionColor = song.region[previousRegionName].Color;
  }

  // Update the previous region banner element
  updateBanner("previousRegion", previousRegionName, previousRegionColor, decimalToHex);
}

function progressBar(progress) {
  var progressPercent = calcPercentage(+region.Start, +region.End, +progress);
  document.getElementById("progressBar").value = progressPercent;  
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

function updateActiveRegionBanner() {
  // Find the current region
  var currentRegionName = null;
  var currentRegionColor = null;
  for (var regionName in song.region) {
    region = song.region[regionName];
    if (+time >= +time && +time < +region.End) {
      currentRegionName = regionName;
      currentRegionColor = region.Color;
      break;
    } 
  }
  // Update the current region banner element
  updateBanner("activeRegion", currentRegionName, currentRegionColor);
}

function updateNextRegionBanner() {
  // Find the index of the current region
  var currentRegionIndex = -1;
  for (var regionName in song.region || {}) {
    currentRegionIndex++;
    var region = song.region[regionName];
    if (+time >= +region.Start && +time < +region.End) {
      break;
    }
  }

  // Get the next region
  var nextRegionName = null;
  var nextRegionColor = null;
  var regionNames = Object.keys(song.region);
  if (currentRegionIndex < regionNames.length - 1) {
    nextRegionName = regionNames[currentRegionIndex + 1];
    nextRegionColor = song.region[nextRegionName].Color;
  }
  // Update the next region banner element
  updateBanner("nextRegion", nextRegionName, nextRegionColor);
}

function checkBanners() {
  if (!song || !song.region) return;
  updateActiveRegionBanner();  
  updateNextRegionBanner();
  updatePreviousRegionBanner();
}

function populateFourBars(lyrics) {
  const bar1 = document.getElementById('bar1');
  const bar2 = document.getElementById('bar2');
  const bar3 = document.getElementById('bar3');
  const bar4 = document.getElementById('bar4');
  const note = document.getElementById('note');
  let lastNote = ".";  
  var positionParts = `${measure}`.split(".");
  var position = parseInt(positionParts[0]);
  var beat = parseInt(positionParts[1]);
  var next = position + 1;
  var last = next + 1;
  for (var i = 1; i <= 4; i++) {
      var bar = document.getElementById(`bar${i}`);
      var lyric = (lyrics[position + '.' +  i  + ".00"]) || '.';
      bar.innerHTML = lyric || ".";
      document.getElementById(`nextbar${i}`).innerHTML = lyrics[next + '.' +  i  + ".00"] || ".";
      document.getElementById(`lastbar${i}`).innerHTML = lyrics[last + '.' +  i  + ".00"] || ".";

      if (i === beat) {
          bar.style.backgroundColor = "blue";
          if(lyric !== '.') {
              lastNote = lyric; // only assign a non '.' value 
              note.innerHTML = lastNote;
          }
      } else {
          bar.style.backgroundColor = "";
      }
  }
}



function checkLyrics() {
  if (!song || !song.region) return;
  populateFourBars(song.lyrics.Position);
}

function updateSong() {
  const searchParams = new URLSearchParams(window.location.search);
  const track = searchParams.get("track");
  const queryString = `track=${track}`;  
  let url = new URL(`${host}:${port}/song?${queryString}`);
  fetch(url)
    .then(response => response.json())
    .then(data => {
        song = data;
        checkBanners();
        checkLyrics();
    })
    .catch(error => console.error(error));
}

function update() {
  updateSong();
  setInterval(updateMeasure, 20);
  setInterval(updateSong, 200);
}
