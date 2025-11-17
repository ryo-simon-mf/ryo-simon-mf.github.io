#!/usr/bin/env python3
"""
Standardize link separators in JSON files.

This script standardizes all link separators to ' / ' (space-slash-space):
- '/' (no spaces) -> ' / '
- '/  ' or '  /' (inconsistent spaces) -> ' / '
- ', ' (comma-space) -> ' / '
- Multiple spaces -> ' / '

Only affects the "link" field in JSON files.
"""

import json
import re
from pathlib import Path

def standardize_link_separator(link_html):
    """Standardize link separators in HTML string."""
    if not link_html:
        return link_html

    # Pattern to match separators between </a> and <a tags
    # Matches: </a> + (various separators) + <a
    pattern = r'</a>\s*([/,])\s*<a'

    # Replace with standardized ' / '
    standardized = re.sub(pattern, r'</a> / <a', link_html)

    # Also handle case where there's just spaces between tags (t-s-a.json case)
    # Match: </a> + (2 or more spaces) + <a
    standardized = re.sub(r'</a>\s{2,}<a', r'</a> / <a', standardized)

    return standardized

def process_json_file(filepath):
    """Process a single JSON file to standardize link separators."""
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)

    original_link = data.get('link')

    # Skip if no link field
    if not original_link:
        return False

    standardized_link = standardize_link_separator(original_link)

    # Only update if changed
    if standardized_link != original_link:
        data['link'] = standardized_link

        # Write back with proper formatting
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
            f.write('\n')  # Add trailing newline

        return True

    return False

def main():
    # Get works-data directory
    project_root = Path(__file__).parent.parent
    works_data_dir = project_root / 'works-data'

    # Find all JSON files except index.json
    json_files = [f for f in works_data_dir.glob('*.json') if f.name != 'index.json']

    modified_count = 0

    print(f"Found {len(json_files)} JSON files to process")
    print()

    for filepath in sorted(json_files):
        if process_json_file(filepath):
            modified_count += 1
            print(f"✓ Standardized: {filepath.name}")

    print()
    print(f"Summary: Modified {modified_count} files")
    print(f"All link separators now use ' / ' (space-slash-space)")

if __name__ == '__main__':
    main()
