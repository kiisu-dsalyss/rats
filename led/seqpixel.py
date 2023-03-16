import argparse
import time
from rpi_ws281x import PixelStrip, Color
import RPi.GPIO as GPIO
import threading

# LED strip configuration:
LED_COUNT = 8      # Number of LED pixels.
LED_PIN = 18       # GPIO pin connected to the pixels (18 uses PWM!).
LED_FREQ_HZ = 800000  # LED signal frequency in hertz (usually 800khz)
LED_DMA = 10       # DMA channel to use for generating signal (try 10)
LED_BRIGHTNESS = 255   # Set to 0 for darkest and 255 for brightest
LED_INVERT = False   # True to invert the signal (when using NPN transistor level shift)
LED_CHANNEL = 0       # set to '1' for GPIOs 13, 19, 41, 45 or 53

lock = threading.Lock()

# def light_led(strip, index, color, fade_time):
#     """Light up one LED at a time, turning off the previous LED"""
#     prev_index = (index - 1) % strip.numPixels()
#     strip.setPixelColor(prev_index, Color(0, 0, 0))
#     strip.setPixelColor(index, color)
#     strip.show()
#     time.sleep(fade_time / 1000)

def light_led(strip, color, fade_time, iterations=10):
    """Movie theater light style chaser animation."""
    for j in range(iterations):
        for q in range(3):
            for i in range(0, strip.numPixels(), 3):
                strip.setPixelColor(i + q, color)
            strip.show()
            time.sleep(fade_time / 1000.0)
            for i in range(0, strip.numPixels(), 3):
                strip.setPixelColor(i + q, 0)

def process_request(args):
    # Create PixelStrip object with appropriate configuration.
    strip = PixelStrip(LED_COUNT, LED_PIN, LED_FREQ_HZ, LED_DMA, LED_INVERT, LED_BRIGHTNESS, LED_CHANNEL)
    # Initialize the library (must be called once before other functions).
    strip.begin()

    # Convert hex color code to integer value
    color = int(args.color, 16)

    # Light up each LED in sequence
    light_led(strip, Color((color >> 16) & 0xFF, (color >> 8) & 0xFF, color & 0xFF), args.fade_time)


    # Turn off all LEDs
    for i in range(strip.numPixels()):
        strip.setPixelColor(i, Color(0, 0, 0))
    strip.show()
    
    # Clean up GPIO pins
    GPIO.cleanup()

    # Release the lock
    lock.release()
    strip.cleanup()

if __name__ == '__main__':
    # Clean up GPIO pins
    parser = argparse.ArgumentParser(description='Set NeoPixel sequence')
    parser.add_argument('color', help='Hex color code (e.g. FF0000 for red)')
    parser.add_argument('fade_time', type=int, help='Time to fade between LEDs in milliseconds')
    parser.add_argument('--direction', type=str, default='forward', help='Direction of sequence (forward or reverse)')
    args = parser.parse_args()

    # Acquire the lock before processing the request
    lock.acquire()
    GPIO.cleanup()
    # Create a new thread to process the request
    t = threading.Thread(target=process_request, args=(args,))
    t.start()