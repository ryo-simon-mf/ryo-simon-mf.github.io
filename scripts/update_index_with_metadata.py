#!/usr/bin/env python3
"""
Update index.json to include year and category metadata.

This allows thumbnail overlays without loading all work JSON files.
"""

import json
from pathlib import Path

def main():
    project_root = Path(__file__).parent.parent
    works_data_dir = project_root / 'works-data'
    index_file = works_data_dir / 'index.json'

    # Load current index.json
    with open(index_file, 'r', encoding='utf-8') as f:
        index_data = json.load(f)

    # Handle both old and new formats
    if 'works' in index_data:
        work_order = [w['id'] for w in index_data['works']]
    else:
        work_order = index_data['order']

    works_with_metadata = []

    print(f"Processing {len(work_order)} works...")
    print()

    # Load each work's metadata
    for work_id in work_order:
        work_file = works_data_dir / f'{work_id}.json'

        if not work_file.exists():
            print(f"⚠ Warning: {work_id}.json not found, skipping")
            continue

        with open(work_file, 'r', encoding='utf-8') as f:
            work_data = json.load(f)

        work_metadata = {
            'id': work_id,
            'title': work_data.get('title', ''),
            'year': work_data.get('year', ''),
            'category': work_data.get('category', '')
        }

        works_with_metadata.append(work_metadata)
        print(f"✓ {work_id}: {work_metadata['year']} / {work_metadata['title']}")

    # Update index.json structure
    new_index = {
        'works': works_with_metadata,
        'description': 'Work order for portfolio display with title, year and category metadata for thumbnail overlays.'
    }

    # Write updated index.json
    with open(index_file, 'w', encoding='utf-8') as f:
        json.dump(new_index, f, indent=2, ensure_ascii=False)
        f.write('\n')

    print()
    print(f"✅ Updated index.json with metadata for {len(works_with_metadata)} works")
    print(f"File size: {index_file.stat().st_size} bytes")

if __name__ == '__main__':
    main()
