import argparse
import time
from rpi_ws281x import PixelStrip, Color

# LED strip configuration:
LED_COUNT = 8
LED_PIN = 18
LED_FREQ_HZ = 800000
LED_DMA = 10
LED_BRIGHTNESS = 255
LED_INVERT = False
LED_CHANNEL = 0

strip = PixelStrip(LED_COUNT, LED_PIN, LED_FREQ_HZ, LED_DMA, LED_INVERT, LED_BRIGHTNESS, LED_CHANNEL)
strip.begin()

def set_color(color, brightness=LED_BRIGHTNESS):
    """Set color of all pixels to given color"""
    for i in range(strip.numPixels()):
        strip.setPixelColor(i, color)
    strip.setBrightness(brightness)
    strip.show()

def fade_out(color, fade_steps):
    """Fade out the given color over the specified number of steps"""
    original_brightness = strip.getBrightness()
    for j in range(fade_steps, 0, -1):
        brightness = int(j * (original_brightness / fade_steps))
        r = (color >> 16) & 0xFF
        g = (color >> 8) & 0xFF
        b = color & 0xFF
        set_color(Color(r, g, b), brightness)
        time.sleep(0.01)
    for j in range(0, fade_steps):
        brightness = int(j * (original_brightness / fade_steps))
        r = (color >> 16) & 0xFF
        g = (color >> 8) & 0xFF
        b = color & 0xFF
        set_color(Color(r, g, b), brightness)
        time.sleep(0.01)

def main():
    parser = argparse.ArgumentParser(description='Fade NeoPixel color')
    parser.add_argument('color', help='Hex color code (e.g. FF0000 for red)')
    parser.add_argument('fade_time', type=int, help='Fade time in steps')
    args = parser.parse_args()

    # Convert hex color code to integer value
    color = int(args.color, 16)

    try:
        while True:
            fade_out(color, args.fade_time)
            time.sleep(0.01)
    except KeyboardInterrupt:
        set_color(Color(0, 0, 0))
        strip.show()

if __name__ == '__main__':
    main()
