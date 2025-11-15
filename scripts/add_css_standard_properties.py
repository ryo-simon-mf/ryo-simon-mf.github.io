#!/usr/bin/env python3
"""
Add standard CSS properties alongside -webkit- prefixed properties.
Improves browser compatibility by ensuring both prefixed and standard versions exist.
"""

import re
from pathlib import Path

# Mapping of webkit properties to their standard equivalents
WEBKIT_TO_STANDARD = {
    '-webkit-border-radius': 'border-radius',
    '-webkit-transition': 'transition',
    '-webkit-transform': 'transform',
    '-webkit-box-sizing': 'box-sizing',
    '-webkit-backface-visibility': 'backface-visibility',
    '-webkit-appearance': 'appearance',
}

def add_standard_properties(css_content):
    """
    Add standard CSS properties after -webkit- prefixed properties.

    Args:
        css_content (str): CSS file content

    Returns:
        tuple: (modified_content, count_of_additions)
    """
    lines = css_content.split('\n')
    modified_lines = []
    additions_count = 0

    for i, line in enumerate(lines):
        modified_lines.append(line)

        # Check if line contains a webkit property
        for webkit_prop, standard_prop in WEBKIT_TO_STANDARD.items():
            if webkit_prop in line and standard_prop not in line:
                # Extract the value part (everything after the webkit property)
                match = re.search(rf'{re.escape(webkit_prop)}:\s*([^;]+);', line)
                if match:
                    value = match.group(1)
                    indent = re.match(r'^(\s*)', line).group(1)

                    # Check if the next line already has the standard property
                    next_line_has_standard = False
                    if i + 1 < len(lines):
                        if standard_prop in lines[i + 1]:
                            next_line_has_standard = True

                    # Only add if not already present
                    if not next_line_has_standard:
                        standard_line = f'{indent}{standard_prop}: {value};'
                        modified_lines.append(standard_line)
                        additions_count += 1

    return '\n'.join(modified_lines), additions_count

def process_css_file(file_path):
    """
    Process a single CSS file to add standard properties.

    Args:
        file_path (Path): Path to CSS file

    Returns:
        int: Number of properties added
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        modified_content, count = add_standard_properties(content)

        if count > 0:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(modified_content)
            print(f"✓ {file_path}: Added {count} standard properties")
        else:
            print(f"- {file_path}: No webkit-only properties found")

        return count

    except Exception as e:
        print(f"✗ {file_path}: Error - {e}")
        return 0

def main():
    """Main function to process CSS files."""
    print("Adding standard CSS properties alongside webkit prefixes...\n")

    # Target our own CSS files (exclude external libraries like swiper)
    css_files = [
        Path('css/style.css'),
        Path('css/style_2.css'),
        Path('css/images.css'),
        Path('css/page-transitions.css'),
    ]

    # Filter to only existing files
    css_files = [f for f in css_files if f.exists()]

    print(f"Found {len(css_files)} CSS files to process\n")

    total_additions = 0
    modified_files = 0

    for css_file in css_files:
        count = process_css_file(css_file)
        if count > 0:
            total_additions += count
            modified_files += 1

    print(f"\n{'='*60}")
    print(f"Summary:")
    print(f"  Files processed: {len(css_files)}")
    print(f"  Files modified: {modified_files}")
    print(f"  Standard properties added: {total_additions}")
    print(f"{'='*60}")

    print(f"\nBrowser compatibility improved:")
    print(f"  - -webkit- prefixes: For older Safari/Chrome")
    print(f"  - Standard properties: For all modern browsers")
    print(f"  - Both versions ensure maximum compatibility")

if __name__ == '__main__':
    main()
