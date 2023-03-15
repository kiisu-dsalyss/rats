import argparse
import time
from rpi_ws281x import PixelStrip, Color

# LED strip configuration:
LED_COUNT = 8      # Number of LED pixels.
LED_PIN = 18       # GPIO pin connected to the pixels (18 uses PWM!).
LED_FREQ_HZ = 800000  # LED signal frequency in hertz (usually 800khz)
LED_DMA = 10       # DMA channel to use for generating signal (try 10)
LED_BRIGHTNESS = 255   # Set to 0 for darkest and 255 for brightest
LED_INVERT = False   # True to invert the signal (when using NPN transistor level shift)
LED_CHANNEL = 0       # set to '1' for GPIOs 13, 19, 41, 45 or 53

def set_color(strip, color):
    """Set color of all pixels to given color"""
    for i in range(strip.numPixels()):
        strip.setPixelColor(i, color)
    strip.show()

def fade_out(strip, color, fade_steps):
    """Fade out the given color over the specified number of steps"""
    while True:
        for j in range(fade_steps, 0, -1):
            brightness = int(j * (255/fade_steps))
            r = (color >> 16) & 0xFF
            g = (color >> 8) & 0xFF
            b = color & 0xFF
            strip.setBrightness(brightness)
            for i in range(strip.numPixels()):
                strip.setPixelColor(i, Color(r, g, b))
            strip.show()
            time.sleep(0.01)
            # Check for new command every 0.1 seconds
            if time.monotonic() % 0.1 == 0:
                # Check for new command here
                if new_command_received():
                    return


def fade_to_brightness(strip, color, target_brightness):
    """Fade the given color to the specified brightness level"""
    target_brightness = max(min(target_brightness, 100), 0) # ensure target is between 0 and 100
    current_brightness = strip.getBrightness()
    fade_steps = abs(current_brightness - target_brightness)
    for j in range(fade_steps + 1):
        brightness = int(current_brightness + j * (target_brightness - current_brightness) / fade_steps)
        r = (color >> 16) & 0xFF
        g = (color >> 8) & 0xFF
        b = color & 0xFF
        strip.setBrightness(brightness)
        for i in range(strip.numPixels()):
            strip.setPixelColor(i, Color(r, g, b))
        strip.show()
        time.sleep(0.01)

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Set NeoPixel color')
    parser.add_argument('color', help='Hex color code (e.g. FF0000 for red)')
    parser.add_argument('time_ms', type=int, help='Time to display color in milliseconds')
    parser.add_argument('--fade_steps', type=int, default=100, help='Number of steps to fade out')
    args = parser.parse_args()

    # Create PixelStrip object with appropriate configuration.
    strip = PixelStrip(LED_COUNT, LED_PIN, LED_FREQ_HZ, LED_DMA, LED_INVERT, LED_BRIGHTNESS, LED_CHANNEL)
    # Initialize the library (must be called once before other functions).
    strip.begin()

    # Convert hex color code to integer value
    color = int(args.color, 16)

    # Set all pixels to given color
    set_color(strip, Color((color >> 16) & 0xFF, (color >> 8) & 0xFF, color & 0xFF))

    # Wait for specified time
    time.sleep(args.time_ms / 1000)

    # Fade out the LEDs
    fade_out(strip, color, args.fade_steps)

    # Turn off all LEDs
    set_color(strip, Color(0, 0, 0))