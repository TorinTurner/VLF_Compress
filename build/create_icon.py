#!/usr/bin/env python3
"""
Simple script to create a basic ICO file for Windows builds.
Creates a 256x256 icon with a simple compression-themed design.
"""

import struct
import math

def create_simple_ico(filename, size=256):
    """Create a simple ICO file with a compression-themed design."""

    # Create a simple image data (RGBA format)
    # We'll create a circle with gradient representing compression
    image_data = bytearray()

    center_x, center_y = size // 2, size // 2
    radius = size // 2 - 10

    for y in range(size):
        for x in range(size):
            # Calculate distance from center
            dx = x - center_x
            dy = y - center_y
            distance = math.sqrt(dx*dx + dy*dy)

            if distance < radius:
                # Inside circle - create a gradient effect
                intensity = int(255 * (1 - distance / radius))
                # Blue-to-purple gradient for compression theme
                r = min(255, intensity + 50)
                g = max(0, intensity - 50)
                b = 255
                a = 255  # Alpha
            else:
                # Outside circle - transparent
                r, g, b, a = 0, 0, 0, 0

            # BMP format is BGRA
            image_data.extend([b, g, r, a])

    # Create BMP header for ICO
    bmp_header_size = 40  # BITMAPINFOHEADER size
    image_size = len(image_data)

    # BMP Info Header (BITMAPINFOHEADER)
    bmp_info = struct.pack('<I', bmp_header_size)  # Header size
    bmp_info += struct.pack('<i', size)  # Width
    bmp_info += struct.pack('<i', size * 2)  # Height (doubled for icon)
    bmp_info += struct.pack('<H', 1)  # Planes
    bmp_info += struct.pack('<H', 32)  # Bits per pixel
    bmp_info += struct.pack('<I', 0)  # Compression (BI_RGB)
    bmp_info += struct.pack('<I', image_size)  # Image size
    bmp_info += struct.pack('<i', 0)  # X pixels per meter
    bmp_info += struct.pack('<i', 0)  # Y pixels per meter
    bmp_info += struct.pack('<I', 0)  # Colors used
    bmp_info += struct.pack('<I', 0)  # Important colors

    # ICO file header
    ico_header = struct.pack('<H', 0)  # Reserved
    ico_header += struct.pack('<H', 1)  # Type (1 = ICO)
    ico_header += struct.pack('<H', 1)  # Number of images

    # ICO directory entry
    ico_dir = struct.pack('<B', 0)  # Width (0 means 256)
    ico_dir += struct.pack('<B', 0)  # Height (0 means 256)
    ico_dir += struct.pack('<B', 0)  # Color palette size
    ico_dir += struct.pack('<B', 0)  # Reserved
    ico_dir += struct.pack('<H', 1)  # Color planes
    ico_dir += struct.pack('<H', 32)  # Bits per pixel

    image_offset = 6 + 16  # Header + directory entry
    image_data_size = len(bmp_info) + len(image_data)

    ico_dir += struct.pack('<I', image_data_size)  # Image data size
    ico_dir += struct.pack('<I', image_offset)  # Image data offset

    # Write ICO file
    with open(filename, 'wb') as f:
        f.write(ico_header)
        f.write(ico_dir)
        f.write(bmp_info)
        f.write(image_data)

    print(f"Created {filename} ({size}x{size} pixels)")

if __name__ == '__main__':
    create_simple_ico('build/icon.ico')
