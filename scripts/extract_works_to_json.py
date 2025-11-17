#!/usr/bin/env python3
"""
Extract work information from HTML files and generate JSON files using regex
Categories are extracted from works.html data-category attributes
"""

import os
import re
import json
from pathlib import Path

# Base directory
BASE_DIR = Path(__file__).parent.parent
WORKS_DIR = BASE_DIR / 'works'
WORKS_HTML = WORKS_DIR / 'works.html'
OUTPUT_DIR = BASE_DIR / 'works-data'

def extract_categories_from_works_html():
    """Extract category mapping from works.html data-category attributes"""
    with open(WORKS_HTML, 'r', encoding='utf-8') as f:
        html = f.read()

    # Find all img_wrap divs with data-category and their links
    # Pattern handles both "./filename.html" and "filename.html"
    pattern = r'<div class="img_wrap" data-category="(\w+)">\s*<a href="(?:\./)?([^"]+)">'
    matches = re.findall(pattern, html)

    # Create mapping of HTML filename to category
    category_map = {}
    for category, filename in matches:
        category_map[filename] = category

    return category_map

def extract_work_id_mapping():
    """Create mapping of HTML filename to work ID"""
    return {
        'toki-shirube.html': 'toki-shirube',
        'inochinokodou.html': 'inochinokodou',
        'muses_ex_echoes.html': 'muses-ex-echoes',
        'improvise_chain.html': 'improvise-chain',
        'theplot_echo_mv.html': 'theplot-echo-mv',
        'VariableFlavorRemix.html': 'variable-flavor-remix',
        'AdaptiveYantra.html': 'adaptive-yantra',
        'HapticGuidingSuite.html': 'haptic-guiding-suite',
        'AiTellYouDjing.html': 'ai-tell-you-djing',
        'Morse_Code.html': 'morse-code',
        'mutek_jp_2020.html': 'mutek-jp-2020',
        'playingtokyo_vol11.html': 'playingtokyo-vol11',
        'solgasa_nextup_animation.html': 'solgasa-nextup-animation',
        'tSA.html': 't-s-a',
        'xMusicOnline0418.html': 'x-music-online0418',
        'onlineb2b_proto.html': 'onlineb2b-proto',
        'SequencingOfFutureConversation.html': 'sequencing-of-future-conversation',
        'Text2Sequence.html': 'text2-sequence',
        'ZigSow.html': 'zig-sow',
        'Motion-Crossfader.html': 'motion-crossfader',
        'shikael.html': 'shikael',
        'OriginalLogo.html': 'original-logo',
        'sanskritlogo.html': 'sanskritlogo',
        'Toilecher.html': 'toilecher',
        'rfont.html': 'rfont',
        'randb.html': 'randb',
        'cfv.html': 'cfv',
        'jpdd.html': 'jpdd',
        'eyehaveyou.html': 'eyehaveyou',
        'pourwater.html': 'pourwater',
        'colorboxes.html': 'colorboxes',
    }

# Work list in display order (from works.html)
WORKS_ORDER = [
    'toki-shirube',
    'inochinokodou',
    'muses-ex-echoes',
    'improvise-chain',
    'theplot-echo-mv',
    'variable-flavor-remix',
    'adaptive-yantra',
    'haptic-guiding-suite',
    'ai-tell-you-djing',
    'morse-code',
    'mutek-jp-2020',
    'playingtokyo-vol11',
    'solgasa-nextup-animation',
    't-s-a',
    'x-music-online0418',
    'onlineb2b-proto',
    'sequencing-of-future-conversation',
    'text2-sequence',
    'zig-sow',
    'motion-crossfader',
    'shikael',
    'original-logo',
    'sanskritlogo',
    'toilecher',
    'rfont',
    'randb',
    'cfv',
    'jpdd',
    'eyehaveyou',
    'pourwater',
    'colorboxes',
]

def clean_html_whitespace(html_content):
    """Clean up excessive whitespace and newlines in HTML content while preserving structure"""
    if not html_content:
        return html_content

    # Replace newlines and surrounding spaces with single space
    cleaned = re.sub(r'\s*\n\s*', ' ', html_content)
    # Normalize multiple spaces to single space
    cleaned = re.sub(r'\s+', ' ', cleaned)
    # Clean up spaces around <br> tags
    cleaned = re.sub(r'\s*<br>\s*', '<br>', cleaned)

    return cleaned.strip()

def extract_work_data(html_file, work_id, category):
    """Extract work data from HTML file using regex"""
    html_path = WORKS_DIR / html_file

    if not html_path.exists():
        print(f"⚠️  {html_file} not found")
        return None

    with open(html_path, 'r', encoding='utf-8') as f:
        html_original = f.read()

    # Remove ALL HTML comments first (including the commented-out title section)
    html = re.sub(r'<!--.*?-->', '', html_original, flags=re.DOTALL)

    # Extract title from h1 (after comments are removed)
    title_match = re.search(r'<h1[^>]*>(.*?)</h1>', html, re.DOTALL)
    if title_match:
        title_raw = title_match.group(1)
        # Remove any remaining HTML tags
        title_clean = re.sub(r'<[^>]+>', '', title_raw)
        title = title_clean.strip()
    else:
        title = work_id

    # Extract all images from swiper
    images = []
    swiper_match = re.search(r'<div class="swiper-container">(.+?)</div>\s*<div class="swiper-button', html, re.DOTALL)
    if swiper_match:
        img_matches = re.findall(r'<img[^>]+src="([^"]+)"', swiper_match.group(1))
        images = img_matches

    # Thumbnail is first image or fallback
    if images:
        thumbnail = images[0]
    else:
        # Try to find first image in the HTML
        img_match = re.search(r'<img[^>]+src="([^"]+)"', html)
        thumbnail = img_match.group(1) if img_match else f"../image/{work_id}/thumb.jpg"
        images = [thumbnail]

    # Extract description
    description = None
    content_in_match = re.search(r'<div id="content_in">(.+?)</div>', html, re.DOTALL)
    if content_in_match:
        p_match = re.search(r'<p>(.+?)</p>', content_in_match.group(1), re.DOTALL)
        if p_match:
            desc = p_match.group(1)
            # Remove ONLY plain <a> tags (no attributes), preserve <a href="..." class="...">
            desc = re.sub(r'<a>([^<]*)</a>', r'\1', desc)
            # Remove empty <dd></dd> tags
            desc = re.sub(r'<dd>\s*</dd>', '', desc)
            # Clean up whitespace and newlines while preserving <br> tags
            desc = clean_html_whitespace(desc)
            if desc:
                description = desc

    # Extract credit
    credit = None
    credit_match = re.search(r'<dt>Credit</dt>\s*<dd>(.+?)</dd>', html, re.DOTALL)
    if credit_match:
        credit_html = credit_match.group(1).strip()
        # Remove ONLY plain <a> tags (no attributes), preserve <a href="..." class="...">
        credit_html = re.sub(r'<a>([^<]*)</a>', r'\1', credit_html)
        # Remove trailing <br> tags
        credit_html = re.sub(r'<br>\s*$', '', credit_html)
        # Clean up whitespace and newlines
        credit = clean_html_whitespace(credit_html)

    # Extract tools (try multiple patterns to handle malformed HTML)
    tools = None
    # Pattern that handles both <dt>Tool</dt> and <dt>Tool</a></dt>
    tools_match = re.search(r'<dt>Tool(?:</a>)?</dt>\s*<dd>(.+?)</dd>', html, re.DOTALL)

    if tools_match:
        tools_html = tools_match.group(1).strip()
        # Remove ALL HTML tags for tools
        tools = re.sub(r'<[^>]+>', '', tools_html).strip()
        # Clean up extra whitespace
        tools = re.sub(r'\s+', ' ', tools).strip()
        if tools:  # Only set if non-empty
            tools = tools
        else:
            tools = None

    # Extract all remaining dt/dd sections after </p> in content_in
    # Separate into individual fields: link, exhibition, award, etc.
    link = None
    exhibition = None
    award = None
    paper = None
    grants = None
    collaborators = None
    performers = None
    download = None
    citation = None
    related = None

    if content_in_match:
        content_after_p = content_in_match.group(1)
        # Find position after first </p>
        p_end = re.search(r'</p>', content_after_p)
        if p_end:
            remaining_content = content_after_p[p_end.end():]
        else:
            # No <p> tag found - use entire content_in to extract dt/dd fields
            remaining_content = content_after_p

        # Extract all dt/dd pairs, handling multiple <dd> per <dt>
        # Split by <dt> tags to find all labels
        dt_splits = re.split(r'<dt>([^<]+?)(?:</a>)?</dt>', remaining_content)

        # Process pairs: dt_splits[0] is before first <dt>, then alternates label, content, label, content...
        for i in range(1, len(dt_splits), 2):
            if i+1 < len(dt_splits):
                dt_label = dt_splits[i].strip()
                dt_content = dt_splits[i+1]

                # Extract all <dd>...</dd> tags from this content (handles multiple <dd> per <dt>)
                dd_matches = re.findall(r'<dd>(.+?)</dd>', dt_content, re.DOTALL)

                if dd_matches:
                    # Combine multiple <dd> with <br> separator
                    combined_dd = '<br>'.join(dd_match.strip() for dd_match in dd_matches)
                    # Remove plain <a> tags without href (preserve <a href="..."> and <a class="...">)
                    dd_clean = re.sub(r'<a>([^<]*)</a>', r'\1', combined_dd)
                    # Remove trailing <br> tags
                    dd_clean = re.sub(r'<br>\s*$', '', dd_clean)
                    # Clean up whitespace and newlines
                    dd_clean = clean_html_whitespace(dd_clean)

                    if dt_label == 'Link':
                        link = dd_clean
                    elif dt_label == 'Exhibition':
                        exhibition = dd_clean
                    elif dt_label == 'Award':
                        award = dd_clean
                    elif dt_label == 'Paper':
                        paper = dd_clean
                    elif dt_label == 'Grants':
                        grants = dd_clean
                    elif dt_label == 'Co-create with':
                        collaborators = dd_clean
                    elif dt_label == 'Performers':
                        performers = dd_clean
                    elif dt_label == 'Download':
                        download = dd_clean
                    elif dt_label == 'Citation':
                        citation = dd_clean
                    elif dt_label == 'Related':
                        related = dd_clean

    # Extract year (try from description or default to 2024)
    year = "2024"
    year_match = re.search(r'20\d{2}', description or '')
    if year_match:
        year = year_match.group()

    work_data = {
        "id": work_id,
        "title": title,
        "category": category,
        "year": year,
        "thumbnail": thumbnail,
        "images": images,
        "description": description,
        "credit": credit,
        "tools": tools,
        "link": link,
        "exhibition": exhibition,
        "award": award,
        "paper": paper,
        "grants": grants,
        "collaborators": collaborators,
        "performers": performers,
        "download": download,
        "citation": citation,
        "related": related
    }

    return work_data

def main():
    """Main execution"""
    OUTPUT_DIR.mkdir(exist_ok=True)

    # Extract categories from works.html
    category_map = extract_categories_from_works_html()
    id_map = extract_work_id_mapping()

    # Create reverse mapping: work_id -> html_filename
    id_to_html = {v: k for k, v in id_map.items()}

    created_count = 0
    updated_count = 0
    error_count = 0

    for work_id in WORKS_ORDER:
        json_path = OUTPUT_DIR / f"{work_id}.json"

        # Get HTML filename and category
        html_file = id_to_html.get(work_id)
        if not html_file:
            print(f"✗ No HTML mapping for {work_id}")
            error_count += 1
            continue

        category = category_map.get(html_file, 'code')  # Default to 'code' if not found

        # Always regenerate (overwrite existing)
        work_data = extract_work_data(html_file, work_id, category)

        if work_data:
            with open(json_path, 'w', encoding='utf-8') as f:
                json.dump(work_data, f, ensure_ascii=False, indent=2)

            if json_path.exists():
                print(f"✓ Updated {work_id}.json (category: {category})")
                updated_count += 1
            else:
                print(f"✓ Created {work_id}.json (category: {category})")
                created_count += 1
        else:
            print(f"✗ Failed to extract {work_id}.json")
            error_count += 1

    # Update index.json
    index_path = OUTPUT_DIR / 'index.json'
    index_data = {
        "order": WORKS_ORDER,
        "description": "Work order for portfolio display. Add new works here to control their position in the gallery."
    }

    with open(index_path, 'w', encoding='utf-8') as f:
        json.dump(index_data, f, ensure_ascii=False, indent=2)

    print(f"\n✓ Updated index.json with {len(WORKS_ORDER)} works")
    print(f"\nSummary:")
    print(f"  Created: {created_count} files")
    print(f"  Updated: {updated_count} files")
    print(f"  Errors: {error_count} files")
    print(f"  Total: {len(WORKS_ORDER)} works")

if __name__ == '__main__':
    main()
