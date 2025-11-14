#!/usr/bin/env python3
"""
VLF Compress Core - File compression and decompression using Brotli + Base32 encoding
Designed for Very Low Frequency (VLF) communication where character efficiency is critical.
"""

import sys
import os
import argparse
import json
import base64
import brotli
from pathlib import Path


def compress_file(input_path, output_path):
    """
    Compress a file using Brotli compression and encode with Base32.

    Args:
        input_path: Path to the input file
        output_path: Path to save the compressed/encoded file

    Returns:
        dict: Statistics including file sizes, compression ratio, and character count
    """
    try:
        # Read the original file
        with open(input_path, 'rb') as file:
            original_data = file.read()

        original_size = len(original_data)

        # Compress using Brotli (quality 11 is maximum compression)
        compressed_data = brotli.compress(original_data, quality=11)
        compressed_size = len(compressed_data)

        # Encode the compressed data in Base32 (ASCII-safe)
        encoded_data = base64.b32encode(compressed_data).decode('ASCII')
        encoded_size = len(encoded_data)

        # Format encoded data for naval message remarks (69 characters per line)
        formatted_lines = []
        for i in range(0, len(encoded_data), 69):
            formatted_lines.append(encoded_data[i:i+69])
        formatted_data = '\n'.join(formatted_lines)

        # Write the formatted encoded ASCII string to output file
        with open(output_path, 'w') as file:
            file.write(formatted_data)

        # Calculate statistics
        compression_ratio = original_size / compressed_size if compressed_size > 0 else 0
        encoding_ratio = compressed_size / encoded_size if encoded_size > 0 else 0
        overall_ratio = original_size / encoded_size if encoded_size > 0 else 0

        # Calculate VLF transmission time
        # VLF typically uses 50 baud (Baudot encoding: 5 bits + start/stop bits = ~7.5 bits/char)
        # Characters per second: 50 baud / 7.5 bits/char ≈ 6.67 chars/sec
        chars_per_second = 50 / 7.5
        transmission_seconds = encoded_size / chars_per_second
        transmission_minutes = transmission_seconds / 60

        # Provide range (45-50 baud typical for VLF)
        min_chars_per_sec = 45 / 7.5
        max_chars_per_sec = 50 / 7.5
        min_time_minutes = encoded_size / max_chars_per_sec / 60
        max_time_minutes = encoded_size / min_chars_per_sec / 60

        stats = {
            'success': True,
            'original_size': original_size,
            'compressed_size': compressed_size,
            'encoded_size': encoded_size,
            'character_count': encoded_size,
            'compression_ratio': round(compression_ratio, 2),
            'encoding_overhead': round(1 / encoding_ratio, 2) if encoding_ratio > 0 else 0,
            'overall_ratio': round(overall_ratio, 2),
            'space_saved_percent': round((1 - encoded_size / original_size) * 100, 2) if original_size > 0 else 0,
            'vlf_transmission_time_minutes': round(transmission_minutes, 2),
            'vlf_transmission_range_minutes': f"{round(min_time_minutes, 2)}-{round(max_time_minutes, 2)}",
            'input_file': str(input_path),
            'output_file': str(output_path)
        }

        return stats

    except FileNotFoundError:
        return {
            'success': False,
            'error': f"Input file not found: {input_path}"
        }
    except PermissionError:
        return {
            'success': False,
            'error': f"Permission denied accessing files"
        }
    except Exception as e:
        return {
            'success': False,
            'error': f"Compression error: {str(e)}"
        }


def decompress_file(input_path, output_path):
    """
    Decompress a Base32-encoded Brotli-compressed file.

    Args:
        input_path: Path to the encoded file
        output_path: Path to save the decompressed file

    Returns:
        dict: Statistics including file sizes and character count
    """
    try:
        # Read the encoded data from the file
        with open(input_path, 'r') as file:
            encoded_data = file.read()

        # Remove all newlines/whitespace from formatted input
        encoded_data = encoded_data.replace('\n', '').replace('\r', '').replace(' ', '').replace('\t', '')

        encoded_size = len(encoded_data)

        # Handle incompatible symbols (# -> =)
        # This is for VLF transmission compatibility
        encoded_data = encoded_data.replace('#', '=')

        # Decode the Base32 encoded data
        compressed_data = base64.b32decode(encoded_data)
        compressed_size = len(compressed_data)

        # Decompress using Brotli
        decompressed_data = brotli.decompress(compressed_data)
        decompressed_size = len(decompressed_data)

        # Write the decompressed data to the output file
        with open(output_path, 'wb') as file:
            file.write(decompressed_data)

        # Calculate statistics
        compression_ratio = decompressed_size / compressed_size if compressed_size > 0 else 0
        overall_ratio = decompressed_size / encoded_size if encoded_size > 0 else 0

        stats = {
            'success': True,
            'encoded_size': encoded_size,
            'compressed_size': compressed_size,
            'decompressed_size': decompressed_size,
            'character_count': encoded_size,
            'compression_ratio': round(compression_ratio, 2),
            'overall_ratio': round(overall_ratio, 2),
            'input_file': str(input_path),
            'output_file': str(output_path)
        }

        return stats

    except FileNotFoundError:
        return {
            'success': False,
            'error': f"Input file not found: {input_path}"
        }
    except base64.binascii.Error as e:
        return {
            'success': False,
            'error': f"Invalid Base32 encoding: {str(e)}"
        }
    except brotli.error as e:
        return {
            'success': False,
            'error': f"Decompression error: {str(e)}"
        }
    except Exception as e:
        return {
            'success': False,
            'error': f"Decompression error: {str(e)}"
        }


def main():
    """Main CLI entry point"""
    parser = argparse.ArgumentParser(
        description='VLF Compress - Compress and decompress files for VLF communication',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  Compress a file:
    %(prog)s compress input.txt output.txt

  Decompress a file:
    %(prog)s decompress encoded.txt output.txt
        """
    )

    parser.add_argument(
        'command',
        choices=['compress', 'decompress'],
        help='Command to execute'
    )

    parser.add_argument(
        'input',
        help='Input file path'
    )

    parser.add_argument(
        'output',
        help='Output file path'
    )

    parser.add_argument(
        '--json',
        action='store_true',
        help='Output results as JSON'
    )

    args = parser.parse_args()

    # Execute command
    if args.command == 'compress':
        result = compress_file(args.input, args.output)
    else:
        result = decompress_file(args.input, args.output)

    # Output results
    if args.json:
        print(json.dumps(result, indent=2))
    else:
        if result['success']:
            print(f"\n{'='*60}")
            print(f"  {args.command.upper()} SUCCESSFUL")
            print(f"{'='*60}")

            if args.command == 'compress':
                print(f"\nInput File:       {result['input_file']}")
                print(f"Output File:      {result['output_file']}")
                print(f"\n{'--- FILE SIZES ---':^60}")
                print(f"Original Size:    {result['original_size']:,} bytes")
                print(f"Compressed Size:  {result['compressed_size']:,} bytes")
                print(f"Encoded Size:     {result['encoded_size']:,} characters")
                print(f"\n{'--- COMPRESSION STATISTICS ---':^60}")
                print(f"Compression Ratio:       {result['compression_ratio']}:1")
                print(f"Overall Ratio:           {result['overall_ratio']}:1")
                print(f"Space Saved:             {result['space_saved_percent']}%")
                print(f"Encoding Overhead:       {result['encoding_overhead']}x")
                print(f"Character Count:         {result['character_count']:,}")
                print(f"\n{'--- VLF TRANSMISSION TIME ---':^60}")
                print(f"Transmission Time (50 baud):  {result['vlf_transmission_time_minutes']} minutes")
                print(f"Estimated Range (45-50 baud): {result['vlf_transmission_range_minutes']} minutes")
            else:
                print(f"\nInput File:       {result['input_file']}")
                print(f"Output File:      {result['output_file']}")
                print(f"\n{'--- FILE SIZES ---':^60}")
                print(f"Encoded Size:       {result['encoded_size']:,} characters")
                print(f"Compressed Size:    {result['compressed_size']:,} bytes")
                print(f"Decompressed Size:  {result['decompressed_size']:,} bytes")
                print(f"\n{'--- DECOMPRESSION STATISTICS ---':^60}")
                print(f"Compression Ratio:  {result['compression_ratio']}:1")
                print(f"Overall Ratio:      {result['overall_ratio']}:1")

            print(f"\n{'='*60}\n")
            return 0
        else:
            print(f"\nERROR: {result['error']}", file=sys.stderr)
            return 1


if __name__ == '__main__':
    sys.exit(main())
