#!/usr/bin/env python3
"""
Check Python architecture
Verifies that Python is 64-bit for x64 builds
"""

import sys
import struct

bits = struct.calcsize("P") * 8

print(f"Python architecture: {bits}-bit")

if bits == 64:
    print("[OK] Python is 64-bit (required for x64 builds)")
    sys.exit(0)
else:
    print("[ERROR] Python is 32-bit (64-bit required for x64 builds)")
    sys.exit(1)
