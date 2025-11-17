#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Works Data Verification Summary
Categorizes and analyzes error patterns
"""

import json
from pathlib import Path
from collections import defaultdict

BASE_DIR = Path('/Users/ryosimon/Documents/Homepage/ryo-simon-mf.github.io')
WORKS_DATA_DIR = BASE_DIR / 'works-data'

def categorize_errors():
    """Categorize errors by type"""

    with open(WORKS_DATA_DIR / 'index.json', 'r', encoding='utf-8') as f:
        index_data = json.load(f)

    work_ids = index_data['order']

    error_categories = {
        'title_wrong': [],  # title field contains wrong content
        'images_extra': [],  # JSON has images not in HTML
        'description_html_tags': [],  # Description has <a> tags in JSON
        'credit_html_tags': [],  # Credit has <a> tags in JSON
        'tools_null': [],  # tools is null in JSON but exists in HTML
        'link_string_should_dict': [],  # link is string but should be dict
        'link_has_dt_tag': [],  # link field contains <dt> tag
        'link_missing_text': [],  # link has HTML tags instead of plain text
    }

    for work_id in work_ids:
        json_path = WORKS_DATA_DIR / f'{work_id}.json'

        with open(json_path, 'r', encoding='utf-8') as f:
            json_data = json.load(f)

        # Check title
        title = json_data.get('title', '')
        if '<a class="title" href="../index.html">Ryo Simon</a>' in title:
            error_categories['title_wrong'].append(work_id)

        # Check images (simple check for extra images)
        images = json_data.get('images', [])
        # Most works have 1 image, some have commented-out images in HTML
        # This is a heuristic

        # Check description for <a> tags
        description = json_data.get('description', '')
        if description and '<a>' in description:
            error_categories['description_html_tags'].append(work_id)

        # Check credit for <a> tags
        credit = json_data.get('credit')
        if credit and '<a>' in credit:
            error_categories['credit_html_tags'].append(work_id)

        # Check tools
        tools = json_data.get('tools')
        if tools is None:
            error_categories['tools_null'].append(work_id)

        # Check link
        link = json_data.get('link')
        if link:
            if isinstance(link, str):
                if '<dt>' in link:
                    error_categories['link_has_dt_tag'].append(work_id)
                elif '<a class="list"' in link:
                    error_categories['link_missing_text'].append(work_id)
                else:
                    # Might be a plain string when should be dict
                    error_categories['link_string_should_dict'].append(work_id)

    print("=" * 80)
    print("ERROR PATTERN ANALYSIS")
    print("=" * 80)
    print()

    print(f"1. TITLE FIELD ERRORS ({len(error_categories['title_wrong'])} works)")
    print("   Issue: title contains '<a class=\"title\" href=\"../index.html\">Ryo Simon</a>'")
    print("   Expected: Actual work title from <h1> tag")
    print(f"   Affected works: {len(error_categories['title_wrong'])}")
    if error_categories['title_wrong']:
        print("   Examples:")
        for work_id in error_categories['title_wrong'][:5]:
            print(f"     - {work_id}")
    print()

    print(f"2. DESCRIPTION HTML TAG ERRORS ({len(error_categories['description_html_tags'])} works)")
    print("   Issue: description contains unnecessary <a> wrapper tags")
    print("   Expected: Plain text with only <br> and <dd> tags")
    print(f"   Affected works: {len(error_categories['description_html_tags'])}")
    if error_categories['description_html_tags']:
        print("   Examples:")
        for work_id in error_categories['description_html_tags'][:5]:
            print(f"     - {work_id}")
    print()

    print(f"3. CREDIT HTML TAG ERRORS ({len(error_categories['credit_html_tags'])} works)")
    print("   Issue: credit contains <a> wrapper tags instead of plain text")
    print("   Expected: Plain text extracted from HTML tags")
    print(f"   Affected works: {len(error_categories['credit_html_tags'])}")
    if error_categories['credit_html_tags']:
        print("   Examples:")
        for work_id in error_categories['credit_html_tags'][:5]:
            print(f"     - {work_id}")
    print()

    print(f"4. TOOLS NULL ERRORS ({len(error_categories['tools_null'])} works)")
    print("   Issue: tools field is null when HTML has <dt>Tool</dt> section")
    print("   Expected: Text content from <dd> tag")
    print(f"   Affected works: {len(error_categories['tools_null'])}")
    if error_categories['tools_null']:
        print("   Examples:")
        for work_id in error_categories['tools_null'][:5]:
            print(f"     - {work_id}")
    print()

    print(f"5. LINK FIELD ERRORS")
    print(f"   5a. Contains <dt> tag ({len(error_categories['link_has_dt_tag'])} works)")
    print("       Issue: link field contains raw HTML including <dt> tags")
    print("       Expected: Plain text or structured dict")
    if error_categories['link_has_dt_tag']:
        print("       Examples:")
        for work_id in error_categories['link_has_dt_tag'][:5]:
            print(f"         - {work_id}")
    print()

    print(f"   5b. Has HTML tags instead of text ({len(error_categories['link_missing_text'])} works)")
    print("       Issue: link field contains <a> tags with href instead of extracted text")
    print("       Expected: Plain text content of links")
    if error_categories['link_missing_text']:
        print("       Examples:")
        for work_id in error_categories['link_missing_text'][:5]:
            print(f"         - {work_id}")
    print()

    print(f"   5c. String when should be dict ({len(error_categories['link_string_should_dict'])} works)")
    print("       Issue: link is a string but HTML has multiple sections (Exhibition, Award, etc.)")
    print("       Expected: Dict with section names as keys")
    if error_categories['link_string_should_dict']:
        print("       Examples:")
        for work_id in error_categories['link_string_should_dict'][:5]:
            print(f"         - {work_id}")
    print()

    print("=" * 80)
    print("SUMMARY BY ERROR TYPE")
    print("=" * 80)
    print(f"  Title errors:              {len(error_categories['title_wrong'])} works")
    print(f"  Description HTML issues:   {len(error_categories['description_html_tags'])} works")
    print(f"  Credit HTML issues:        {len(error_categories['credit_html_tags'])} works")
    print(f"  Tools null issues:         {len(error_categories['tools_null'])} works")
    print(f"  Link structure issues:     {len(error_categories['link_has_dt_tag']) + len(error_categories['link_missing_text']) + len(error_categories['link_string_should_dict'])} works")
    print()

    # Count works with multiple errors
    all_works_with_errors = set()
    for category_works in error_categories.values():
        all_works_with_errors.update(category_works)

    print(f"  Total unique works with errors: {len(all_works_with_errors)} / {len(work_ids)}")
    print()

if __name__ == '__main__':
    categorize_errors()
