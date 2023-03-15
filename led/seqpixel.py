import argparse
import time
from rpi_ws281x import PixelStrip, Color
import RPi.GPIO as GPIO

# LED strip configuration:
LED_COUNT = 8      # Number of LED pixels.
LED_PIN = 18       # GPIO pin connected to the pixels (18 uses PWM!).
LED_FREQ_HZ = 800000  # LED signal frequency in hertz (usually 800khz)
LED_DMA = 10       # DMA channel to use for generating signal (try 10)
LED_BRIGHTNESS = 255   # Set to 0 for darkest and 255 for brightest
LED_INVERT = False   # True to invert the signal (when using NPN transistor level shift)
LED_CHANNEL = 0       # set to '1' for GPIOs 13, 19, 41, 45 or 53

def light_led(strip, index, color, fade_time):
    """Light up one LED at a time, turning off the previous LED"""
    prev_index = (index - 1) % strip.numPixels()
    strip.setPixelColor(prev_index, Color(0, 0, 0))
    strip.setPixelColor(index, color)
    strip.show()
    time.sleep(fade_time / 1000)

if __name__ == '__main__':
    # Clean up GPIO pins
    GPIO.cleanup()
    parser = argparse.ArgumentParser(description='Set NeoPixel sequence')
    parser.add_argument('color', help='Hex color code (e.g. FF0000 for red)')
    parser.add_argument('fade_time', type=int, help='Time to fade between LEDs in milliseconds')
    parser.add_argument('--direction', type=str, default='forward', help='Direction of sequence (forward or reverse)')
    args = parser.parse_args()

    # Create PixelStrip object with appropriate configuration.
    strip = PixelStrip(LED_COUNT, LED_PIN, LED_FREQ_HZ, LED_DMA, LED_INVERT, LED_BRIGHTNESS, LED_CHANNEL)
    # Initialize the library (must be called once before other functions).
    strip.begin()

    # Convert hex color code to integer value
    color = int(args.color, 16)

    # Light up each LED in sequence
    if args.direction == 'forward':
        i = 0
        while True:
            light_led(strip, i, Color((color >> 16) & 0xFF, (color >> 8) & 0xFF, color & 0xFF), args.fade_time)
            i = (i + 1) % strip.numPixels()
    elif args.direction == 'reverse':
        i = strip.numPixels() - 1
        while True:
            light_led(strip, i, Color((color >> 16) & 0xFF, (color >> 8) & 0xFF, color & 0xFF), args.fade_time)
            i = (i - 1) % strip.numPixels()

    # Clean up GPIO pins
    GPIO.cleanup()

