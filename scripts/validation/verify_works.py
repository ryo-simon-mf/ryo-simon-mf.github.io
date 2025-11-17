#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Works Data Verification Script
Compares JSON data with HTML files for all 33 works
"""

import json
import re
from pathlib import Path
from html.parser import HTMLParser

# ID to HTML filename mapping
ID_TO_HTML = {
    'toki-shirube': 'toki-shirube.html',
    'inochinokodou': 'inochinokodou.html',
    'muses-ex-echoes': 'muses_ex_echoes.html',
    'improvise-chain': 'improvise_chain.html',
    'theplot-echo-mv': 'theplot_echo_mv.html',
    'variable-flavor-remix': 'VariableFlavorRemix.html',
    'adaptive-yantra': 'AdaptiveYantra.html',
    'haptic-guiding-suite': 'HapticGuidingSuite.html',
    'ai-tell-you-djing': 'AiTellYouDjing.html',
    'morse-code': 'Morse_Code.html',
    'mutek-jp-2020': 'mutek_jp_2020.html',
    'playingtokyo-vol11': 'playingtokyo_vol11.html',
    'solgasa-nextup-animation': 'solgasa_nextup_animation.html',
    't-s-a': 'tSA.html',
    'x-music-online0418': 'xMusicOnline0418.html',
    'onlineb2b-proto': 'onlineb2b_proto.html',
    'sequencing-of-future-conversation': 'SequencingOfFutureConversation.html',
    'text2-sequence': 'Text2Sequence.html',
    'zig-sow': 'ZigSow.html',
    'motion-crossfader': 'Motion-Crossfader.html',
    'shikael': 'shikael.html',
    'original-logo': 'OriginalLogo.html',
    'sanskritlogo': 'sanskritlogo.html',
    'toilecher': 'Toilecher.html',
    'rfont': 'rfont.html',
    'randb': 'randb.html',
    'cfv': 'cfv.html',
    'jpdd': 'jpdd.html',
    'eyehaveyou': 'eyehaveyou.html',
    'pourwater': 'pourwater.html',
    'colorboxes': 'colorboxes.html',
}

BASE_DIR = Path('/Users/ryosimon/Documents/Homepage/ryo-simon-mf.github.io')
WORKS_DATA_DIR = BASE_DIR / 'works-data'
WORKS_HTML_DIR = BASE_DIR / 'works'

def remove_html_comments(text):
    """Remove HTML comments from text"""
    return re.sub(r'<!--.*?-->', '', text, flags=re.DOTALL)

def normalize_whitespace(text):
    """Normalize whitespace: collapse multiple spaces/newlines to single space"""
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def extract_text_content(html):
    """Extract text content from HTML, preserving <br> and basic structure"""
    # Remove comments first
    html = remove_html_comments(html)
    # Keep <br> tags as markers
    html = re.sub(r'<br\s*/?\s*>', '<BR_MARKER>', html, flags=re.IGNORECASE)
    # Remove other tags
    text = re.sub(r'<[^>]+>', '', html)
    # Restore <br> as actual tag
    text = text.replace('<BR_MARKER>', '<br>')
    return normalize_whitespace(text)

def extract_h1_title(html_content):
    """Extract <h1> title from HTML, removing comments"""
    html_content = remove_html_comments(html_content)
    match = re.search(r'<h1[^>]*>(.*?)</h1>', html_content, re.DOTALL | re.IGNORECASE)
    if match:
        return normalize_whitespace(extract_text_content(match.group(1)))
    return None

def extract_swiper_images(html_content):
    """Extract all image paths from swiper-wrapper, excluding commented-out images"""
    html_content = remove_html_comments(html_content)

    # Find swiper-wrapper section
    wrapper_match = re.search(r'<div class="swiper-wrapper">(.*?)</div>', html_content, re.DOTALL | re.IGNORECASE)
    if not wrapper_match:
        return []

    wrapper_html = wrapper_match.group(1)

    # Extract all img src paths
    img_pattern = r'<img\s+src="([^"]+)"'
    images = re.findall(img_pattern, wrapper_html, re.IGNORECASE)

    return images

def extract_content_description(html_content):
    """Extract description from <div id="content_in"><p>...</p>"""
    html_content = remove_html_comments(html_content)

    # Find content_in div
    match = re.search(r'<div\s+id="content_in"[^>]*>(.*?)</div>', html_content, re.DOTALL | re.IGNORECASE)
    if not match:
        return None

    content_div = match.group(1)

    # Extract <p> content, preserving <br> and <dd> tags
    p_match = re.search(r'<p[^>]*>(.*?)</p>', content_div, re.DOTALL | re.IGNORECASE)
    if not p_match:
        return None

    p_content = p_match.group(1)

    # Preserve <br> tags
    p_content = re.sub(r'<br\s*/?\s*>', '<br>', p_content, flags=re.IGNORECASE)
    # Preserve <dd> tags (both opening and closing)
    p_content = re.sub(r'<dd\s*>', '<dd>', p_content, flags=re.IGNORECASE)
    p_content = re.sub(r'</dd\s*>', '</dd>', p_content, flags=re.IGNORECASE)

    # Remove other tags
    allowed_tags = ['<br>', '<dd>', '</dd>']
    temp_markers = {
        '<br>': '___BR_MARKER___',
        '<dd>': '___DD_OPEN___',
        '</dd>': '___DD_CLOSE___'
    }

    for tag, marker in temp_markers.items():
        p_content = p_content.replace(tag, marker)

    # Remove all other HTML tags
    p_content = re.sub(r'<[^>]+>', '', p_content)

    # Restore allowed tags
    for tag, marker in temp_markers.items():
        p_content = p_content.replace(marker, tag)

    return normalize_whitespace(p_content)

def extract_dt_dd_sections(html_content):
    """Extract all <dt><dd> sections from HTML"""
    html_content = remove_html_comments(html_content)

    sections = {}

    # Find all <dt> tags and their corresponding <dd> tags
    dt_pattern = r'<dt[^>]*>(.*?)</dt>\s*<dd[^>]*>(.*?)</dd>'
    matches = re.findall(dt_pattern, html_content, re.DOTALL | re.IGNORECASE)

    for dt_content, dd_content in matches:
        dt_text = normalize_whitespace(extract_text_content(dt_content))
        dd_text = extract_text_content(dd_content).strip()

        # Normalize whitespace but preserve structure
        dd_text = normalize_whitespace(dd_text)

        sections[dt_text] = dd_text

    return sections

def verify_work(work_id):
    """Verify a single work's JSON against its HTML"""
    results = {
        'id': work_id,
        'errors': []
    }

    # Load JSON
    json_path = WORKS_DATA_DIR / f'{work_id}.json'
    if not json_path.exists():
        results['errors'].append(f"JSON file not found: {json_path}")
        return results

    with open(json_path, 'r', encoding='utf-8') as f:
        json_data = json.load(f)

    # Load HTML
    html_filename = ID_TO_HTML.get(work_id)
    if not html_filename:
        results['errors'].append(f"No HTML filename mapping for ID: {work_id}")
        return results

    html_path = WORKS_HTML_DIR / html_filename
    if not html_path.exists():
        results['errors'].append(f"HTML file not found: {html_path}")
        return results

    with open(html_path, 'r', encoding='utf-8') as f:
        html_content = f.read()

    # 1. Verify title
    html_title = extract_h1_title(html_content)
    json_title = json_data.get('title', '')
    if html_title != json_title:
        results['errors'].append(f"title: JSON='{json_title}' vs HTML='{html_title}'")

    # 2. Verify images
    html_images = extract_swiper_images(html_content)
    json_images = json_data.get('images', [])
    if html_images != json_images:
        missing_in_json = set(html_images) - set(json_images)
        extra_in_json = set(json_images) - set(html_images)
        if missing_in_json:
            results['errors'].append(f"images: Missing in JSON: {missing_in_json}")
        if extra_in_json:
            results['errors'].append(f"images: Extra in JSON: {extra_in_json}")
        if set(html_images) == set(json_images) and html_images != json_images:
            results['errors'].append(f"images: Order mismatch")

    # 3. Verify description
    html_desc = extract_content_description(html_content)
    json_desc = json_data.get('description', '')
    if html_desc != json_desc:
        results['errors'].append(f"description: Mismatch")
        results['errors'].append(f"  JSON: '{json_desc}'")
        results['errors'].append(f"  HTML: '{html_desc}'")

    # 4. Extract dt/dd sections from HTML
    html_sections = extract_dt_dd_sections(html_content)

    # 5. Verify credit
    json_credit = json_data.get('credit')
    html_credit = html_sections.get('Credit')
    if json_credit is None:
        if html_credit is not None:
            results['errors'].append(f"credit: JSON is null but HTML has: '{html_credit}'")
    else:
        if html_credit is None:
            results['errors'].append(f"credit: JSON has '{json_credit}' but HTML has no Credit section")
        elif json_credit != html_credit:
            results['errors'].append(f"credit: JSON='{json_credit}' vs HTML='{html_credit}'")

    # 6. Verify tools
    json_tools = json_data.get('tools')
    html_tool = html_sections.get('Tool')
    if json_tools is None:
        if html_tool is not None:
            results['errors'].append(f"tools: JSON is null but HTML has: '{html_tool}'")
    else:
        if html_tool is None:
            results['errors'].append(f"tools: JSON has '{json_tools}' but HTML has no Tool section")
        elif json_tools != html_tool:
            results['errors'].append(f"tools: JSON='{json_tools}' vs HTML='{html_tool}'")

    # 7. Verify link sections
    json_link = json_data.get('link')

    # Collect all non-Credit, non-Tool sections from HTML
    link_sections = {}
    for dt_key, dd_value in html_sections.items():
        if dt_key not in ['Credit', 'Tool']:
            link_sections[dt_key] = dd_value

    if json_link is None:
        if link_sections:
            results['errors'].append(f"link: JSON is null but HTML has sections: {list(link_sections.keys())}")
    else:
        if not link_sections:
            results['errors'].append(f"link: JSON has data but HTML has no link sections")
        else:
            # json_link could be a string or a dict
            if isinstance(json_link, str):
                # If it's a string, treat as single "Link" section
                if len(link_sections) > 1:
                    results['errors'].append(f"link: JSON is string but HTML has multiple sections: {list(link_sections.keys())}")
                elif 'Link' in link_sections:
                    if normalize_whitespace(json_link) != normalize_whitespace(link_sections['Link']):
                        results['errors'].append(f"link: Mismatch")
                        results['errors'].append(f"  JSON: '{json_link}'")
                        results['errors'].append(f"  HTML: '{link_sections['Link']}'")
                elif link_sections:
                    # HTML has different section name
                    html_key = list(link_sections.keys())[0]
                    if normalize_whitespace(json_link) != normalize_whitespace(link_sections[html_key]):
                        results['errors'].append(f"link: JSON is string, HTML section '{html_key}' mismatch")
            elif isinstance(json_link, dict):
                # Compare link sections
                for key, value in json_link.items():
                    if key not in link_sections:
                        results['errors'].append(f"link.{key}: In JSON but not in HTML")
                    elif normalize_whitespace(str(value)) != normalize_whitespace(link_sections[key]):
                        results['errors'].append(f"link.{key}: Mismatch")
                        results['errors'].append(f"  JSON: '{value}'")
                        results['errors'].append(f"  HTML: '{link_sections[key]}'")

                for key in link_sections.keys():
                    if key not in json_link:
                        results['errors'].append(f"link.{key}: In HTML but not in JSON (value: '{link_sections[key]}')")

    return results

def main():
    # Load work order
    with open(WORKS_DATA_DIR / 'index.json', 'r', encoding='utf-8') as f:
        index_data = json.load(f)

    work_ids = index_data['order']

    print(f"Verifying {len(work_ids)} works...\n")
    print("=" * 80)

    all_results = []
    perfect_count = 0
    error_count = 0

    for work_id in work_ids:
        result = verify_work(work_id)
        all_results.append(result)

        if result['errors']:
            error_count += 1
            print(f"\n✗ [{work_id}]: {len(result['errors'])} issue(s)")
            for error in result['errors']:
                print(f"  {error}")
        else:
            perfect_count += 1
            print(f"✓ [{work_id}]: Perfect match")

    print("\n" + "=" * 80)
    print(f"\nSUMMARY:")
    print(f"  Total works: {len(work_ids)}")
    print(f"  Perfect match: {perfect_count}")
    print(f"  With errors: {error_count}")

    if error_count > 0:
        print(f"\n\nWorks with errors:")
        for result in all_results:
            if result['errors']:
                print(f"  - {result['id']}")

if __name__ == '__main__':
    main()
