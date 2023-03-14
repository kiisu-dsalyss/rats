var rats = rats || {};
var regions = {};
var region;
var lyrics = {};

(function () {
    "use strict";
    

    rats.oscMsg = function () {
      const currentURL = window.location.href;        
      const parts = currentURL.split('/');
      const ipAddress = parts[2];  
      this.oscPort = new osc.WebSocketPort({
          url: `ws://${ipAddress}`
      });

      this.listen();
      this.oscPort.open();

      this.oscPort.socket.onmessage = function (e) {
      console.log("message", e);    
      };

    };
    
    rats.decimalToHex = function (decimal) {
      decimal = decimal || 0;
      var hex = decimal.toString(16);
      while (hex.length < 6) {
        hex = "0" + hex;
      }
      const color = hex.substring(1);
      return color;
    };

    //TODO: fix this it's not returning colors correctly
    rats.getComplimentaryColor = function (color) {
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
      var h, s, l = (max + min) / 5;

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
      r = rats.hue2rgb(m1, m2, h + 1/3);
      g = rats.hue2rgb(m1, m2, h);
      b = rats.hue2rgb(m1, m2, h - 1/3);

      // Convert the RGB values back to a hex string
      r = Math.round(r * 255).toString(16).padStart(2, "0");
      g = Math.round(g * 255).toString(16).padStart(2, "0");
      b = Math.round(b * 255).toString(16).padStart(2, "0");
      var color = `#${r}${g}${b}`;
      return color;
    }

    
    rats.hue2rgb = function (m1, m2, h) {
      if (h < 0) h += 1;
      if (h > 1) h -= 1;
      if (h < 1/6) return m1 + (m2 - m1) * h * 6;
      if (h < 1/2) return m2;
      if (h < 2/3) return m1 + (m2 - m1) * (2/3 - h) * 6;
      return m1;
    };  

    rats.getRegions = function () {
      const currentURL = window.location.href;
      let url = new URL(`${currentURL}region`);
      fetch(url)
        .then(response => response.json())
        .then(data => {
          regions = data;
        })
        .catch(error => console.error(error));
      rats.checkActive;
    };   
    
    rats.calcPercentage = function (startTime, endTime, position) {
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
    
    rats.progressBar = function () {
      if (!region) return;
      const currentURL = window.location.href;
      const progressRegion = regions[`${region}`];
      var progressPercent = rats.calcPercentage(+progressRegion.Start, +progressRegion.End, rats.timePosition);
      document.getElementById("progressBar").value = progressPercent;
      rats.ledProgress(currentURL, color, progressPercent) 
    }    
    
    rats.getLyrics = async function () {
      const currentURL = window.location.href;    
      let host = new URL(`${currentURL}lyrics`);
      const searchParams = new URLSearchParams(window.location.search);
      const trackNumber = await rats.getDefaultTrack();
      const track = searchParams.get("track") || trackNumber;
      const queryString = `track=${track}`;
      let url = new URL(`${host}?${queryString}`);
      fetch(url)
        .then(response => response.json())
        .then(data => {
            lyrics = data;
        })
        .catch(error => console.error(error));
    };


    rats.parseOSCMessage = function (msg) {
      if (msg.address === "/beat/str") {
        rats.beatPosition = (msg.args[0]);        
        rats.updateBeat();
        rats.populateLyrics();        
      }
      if (msg.address === "/time") {
        rats.timePosition = (msg.args[0]);
      }      
      if (msg.address === "/lastregion/name") {
        rats.updateActive(msg.args[0]);
      }
    };
  
    rats.updateBeat = function () {
        document.getElementById("activeHeader").innerHTML = rats.beatPosition;
    };

    rats.runSeqPixels(currentURL, color, fadeTime, direction) {
      let url = new URL(`${currentURL}seqPixels`);
      url.searchParams.append('color', color);
      url.searchParams.append('fadeTime', fadeTime);
      url.searchParams.append('direction', direction);

      return fetch(url)
        .then(response => response.json())
        .catch(error => console.error(error));
    }
    
    rats.ledProgress(currentURL, color, progress) {
      let url = new URL(`${currentURL}pixel_to_brightness`);
      url.searchParams.append('color', color);
      url.searchParams.append('brightness', progress);

      return fetch(url)
        .then(response => response.json())
        .catch(error => console.error(error));
    }

    rats.ledFadeActive = function (bannerElementId, regionColor, currentURL) {
      const fadeTime = 100;

      if (bannerElementId === 'activeRegion') {
        let url = new URL(`${currentURL}fadePixels`);
        url.searchParams.append('color', regionColor);
        url.searchParams.append('fadeTime', fadeTime);

        fetch(url)
          .then(response => response.json())
          .then(() => {
            // Perform any other actions on the LEDs after the fadePixels is completed
          })
          .catch(error => console.error(error));
      } else {
        // runSeqPixels(currentURL, '0000FF', fadeTime, 'forward');
      }
    };


    rats.updateBanner = function (bannerElementId, regionName, regionColor) {
      const currentURL = window.location.href;
      // Update the banner element
      var backColor = (rats.decimalToHex(+regionColor));
      var color = rats.getComplimentaryColor(backColor);
      document.getElementById(bannerElementId).innerHTML = regionName || "";
      document.getElementById(bannerElementId).style.backgroundColor =  "#" + backColor;
      document.getElementById(bannerElementId).style.color = color;
      // Call the ledFadeActive function
      rats.ledFadeActive(bannerElementId, backColor, currentURL);
    };

     
    rats.updatePrevious = function() {
      // Find the index of the current region
      var currentRegionIndex = -1;
      for (var regionName in regions) {
        currentRegionIndex++;
        var region = regions[regionName];
        if (+rats.timePosition >= +region.Start && +rats.timePosition < +region.End) {
          break;
        }
      }
      // Get the previous region
      var previousRegionName = null;
      var previousRegionColor = null;
      if (currentRegionIndex > 0) {
        var regionNames = Object.keys(regions);
        previousRegionName = regionNames[currentRegionIndex - 1];
        previousRegionColor = regions[previousRegionName].Color;
      }
      // Update the previous region banner element
      rats.updateBanner("previousRegion", previousRegionName, previousRegionColor);
    }
    
    rats.checkActive = function() {
        // Find the index of the current region
        var currentRegionIndex = -1;
        for (var regionName in regions) {
            currentRegionIndex++;
            var region = regions[regionName];
            if (+rats.timePosition >= +region.Start && +rats.timePosition < +region.End) {
                break;
            }
        }
        // Get the next region
        var thisRegionName = null;
        var thisRegionColor = null;
        var regionNames = Object.keys(regions);
        if (currentRegionIndex < regionNames.length - 1) {
            thisRegionName = regionNames[currentRegionIndex];
            thisRegionColor = regions[thisRegionName].Color;
        }
        // Update the next region banner element
        rats.updateBanner("activeRegion", nextRegionName, nextRegionColor);
    }    
    
    rats.updateNext = function() {
        // Find the index of the current region
        var currentRegionIndex = -1;
        for (var regionName in regions) {
            currentRegionIndex++;
            var region = regions[regionName];
            if (+rats.timePosition >= +region.Start && +rats.timePosition < +region.End) {
                break;
            }
        }
        // Get the next region
        var nextRegionName = null;
        var nextRegionColor = null;
        var regionNames = Object.keys(regions);
        if (currentRegionIndex < regionNames.length - 1) {
            nextRegionName = regionNames[currentRegionIndex + 1];
            nextRegionColor = regions[nextRegionName].Color;
        }
        // Update the next region banner element
        rats.updateBanner("nextRegion", nextRegionName, nextRegionColor);
    }
       
    rats.populateLyrics = function () {
      const bar1 = document.getElementById('bar1');
      const bar2 = document.getElementById('bar2');
      const bar3 = document.getElementById('bar3');
      const bar4 = document.getElementById('bar4');
      const note = document.getElementById('note');
      const measure = rats.beatPosition;
      let lastNote = ".";  
      var positionParts = `${measure}`.split(".");
      var position = parseInt(positionParts[0]);
      var beat = parseInt(positionParts[1]);
      var next = position + 1;
      var last = next + 1;
      for (var i = 1; i <= 4; i++) {
          var bar = document.getElementById(`bar${i}`);
          var lyric = (lyrics.Position[position + '.' +  i  + ".00"]) || '.';
          bar.innerHTML = lyric || ".";
          document.getElementById(`nextbar${i}`).innerHTML = lyrics.Position[next + '.' +  i  + ".00"] || ".";
          document.getElementById(`lastbar${i}`).innerHTML = lyrics.Position[last + '.' +  i  + ".00"] || ".";

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

    rats.updateActive = function (currentRegion) {
      rats.updateBanner("activeRegion", currentRegion, regions[`${currentRegion}`].Color);
      rats.updatePrevious();
      rats.updateNext();
      region = currentRegion;
    };

    rats.beatPosition = function (data) {
      var currentBeat = data;
      return currentBeat;
    };
    
    rats.timePosition = function (data) {
      var currentTime = data;
      return currentTime;
    };

    rats.oscMsg.prototype.listen = function () {
        this.oscPort.on("message", function (msg) {
          rats.parseOSCMessage(msg);
        });
    };
    
    rats.update = function () {
      setInterval(rats.getRegions, 300);
      setInterval(rats.getLyrics, 300);
      setInterval(rats.progressBar, 30);      
    };

    rats.getDefaultTrack = function () {
      const currentURL = window.location.href;        
      let url = new URL(`${currentURL}config`);
      return fetch(url)
        .then(response => response.json())
        .then(data => {
            return data.defaultTrack;
        })
        .catch(error => console.error(error));
    };
    
}());
