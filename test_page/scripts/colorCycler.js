function cycleColors(element) {
  let r = 0, g = 0, b = 0;
  let direction = 1;

  function updateColor() {
    r += 10 * direction;
    g += 10 * direction;
    b += 10 * direction;
    element.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
    element.style.color = `rgb(${255 - r}, ${255 - g}, ${255 - b})`;
    if (r == 255 || r == 0) {
      direction *= -1;
    }
    setTimeout(updateColor, 50);
  }

  updateColor();
}

// Start cycling the colors for the active region element
cycleColors(activeHeader);
