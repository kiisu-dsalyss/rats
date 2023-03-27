import sys
import time
from rpi_ws281x import PixelStrip, Color

# Configuration
LED_COUNT = 8         # Number of LED pixels
LED_PIN = 18          # GPIO pin connected to the pixels (18 uses PWM)
LED_FREQ_HZ = 800000  # LED signal frequency in hertz (usually 800kHz)
LED_DMA = 10          # DMA channel to use for generating signal
LED_BRIGHTNESS = 255  # Set to 0 for darkest and 255 for brightest
LED_INVERT = False    # True to invert the signal (when using NPN transistor level shift)
LED_CHANNEL = 0       # set to '1' for GPIOs 13, 19, 41, 45 or 53

def colorWipe(strip, hex_color):
    r = int(hex_color[1:3], 16)
    g = int(hex_color[3:5], 16)
    b = int(hex_color[5:], 16)
    for i in range(strip.numPixels()):
        strip.setPixelColor(i, Color(r, g, b))
    strip.show()

def colorChase(strip, color, wait_ms=50):
    r = int(color[1:3], 16)
    g = int(color[3:5], 16)
    b = int(color[5:], 16)
    for i in range(strip.numPixels()):
        strip.setPixelColor(i, Color(0, 0, 0))
    for i in range(strip.numPixels()):
        strip.setPixelColor(i, Color(r, g, b))
        strip.show()
        time.sleep(wait_ms / 1000.0)
    for i in range(strip.numPixels()):
        strip.setPixelColor(i, Color(0, 0, 0))
    strip.show()


if __name__ == '__main__':
    if len(sys.argv) != 2:
        print("Usage: python neopixel_control.py <hex_color>")
        sys.exit(1)

    hex_color = sys.argv[1]
    # Create NeoPixel object with appropriate configuration.
    strip = PixelStrip(LED_COUNT, LED_PIN, LED_FREQ_HZ, LED_DMA, LED_INVERT, LED_BRIGHTNESS, LED_CHANNEL)
    
    # Initialize the library (must be called once before other functions).
    strip.begin()

    # Set the color and show it on the strip
    colorWipe(strip, color)
    time.sleep(1)
    colorChase(strip, color)
#     colorWipe(strip, Color(0, 0, 0))  # Turn off the strip after the chase