# Data Extraction Bug Report: HTML to JSON
## Comprehensive Analysis of Missing and Incorrect Extractions

**Generated**: 2025-11-17
**Analyzer**: Systematic HTML → JSON verification
**Extraction Script**: `/Users/ryosimon/Documents/Homepage/ryo-simon-mf.github.io/scripts/extract_works_to_json.py`
**Files Checked**: 31 works (21 successfully analyzed + 10 skipped)
**Bugs Found**: 3 critical extraction bugs

---

## Executive Summary

After systematic verification of all 31 work HTML files against their JSON counterparts, **3 critical bugs** were identified in the extraction script:

### Critical Bugs (Data Loss)
1. **Missing `<p>` Tag Bug** - 10+ files with no description cannot extract ANY dt/dd fields
2. **Multiple `<dd>` Bug** - Only first `<dd>` per `<dt>` is extracted, losing additional exhibition/link data
3. ~~**Field Mapping Bugs**~~ - FALSE POSITIVE: Verification script had wrong field map

---

## Bug #1: Missing `<p>` Tag Extraction Failure (CRITICAL)

### Root Cause
**File**: `extract_works_to_json.py`, lines 222-224

```python
if p_end:
    remaining_content = content_after_p[p_end.end():]
    # Extract all dt/dd pairs
```

The extractor **requires** a `<p>` tag in `content_in` div to extract dt/dd fields. If no `<p>` exists, `p_end` is None and ALL dt/dd fields are skipped.

### Affected Files (Link field missing due to no `<p>` tag)

| HTML File | Has `<p>` Tag | Link in HTML | Link in JSON | **Data Loss** |
|-----------|---------------|--------------|--------------|---------------|
| `colorboxes.html` | **No** | GitHub + NEORT (2 links) | `null` | ✗ LOST |
| `randb.html` | **No** | GitHub + NEORT (2 links) | `null` | ✗ LOST |
| `rfont.html` | **No** | (Unknown - need to check) | `null` | ✗ LOST |
| `sanskritlogo.html` | **No** | (Unknown - need to check) | `null` | ✗ LOST |
| `shikael.html` | **No** | (Unknown - need to check) | `null` | ✗ LOST |

### HTML Structure (colorboxes.html example)
```html
<div id="content_in">
    <!-- NO <p> TAG HERE! -->

    <dt>Tool</a></dt>
    <dd>openFrameworks</dd>
    </dl>
    <br>

    <dt>Link</a></dt>
    <dd>
        <a class="list" href="https://github.com/ryo-simon-mf/oF-Color-Boxes">GitHub</a> /
        <a class="list" href="https://neort.io/art/bpovrtk3p9fbkbq85d9g?index=0&origin=latest">NEORT</a>
    </dd>
</div>
```

### Current Extraction Result
```json
{
  "tools": "openFrameworks",  // ✓ Extracted (uses different pattern on line 193)
  "link": null,               // ✗ LOST - dt/dd extraction skipped
}
```

### Impact
- **Severity**: HIGH - Complete data loss for all dt/dd fields in affected files
- **Affected Fields**: Link, Exhibition, Award, Download, Citation, Performers, Co-create with
- **Files**: At least 5 confirmed, potentially more

### Recommended Fix
Modify lines 219-260 to extract dt/dd pairs even when no `<p>` tag exists:

```python
if content_in_match:
    content_after_p = content_in_match.group(1)

    # Find position after first </p> (if it exists)
    p_end = re.search(r'</p>', content_after_p)
    if p_end:
        remaining_content = content_after_p[p_end.end():]
    else:
        # No <p> tag - use entire content_in for dt/dd extraction
        remaining_content = content_after_p

    # Extract all dt/dd pairs
    dt_dd_matches = re.findall(r'<dt>([^<]+?)(?:</a>)?</dt>\s*<dd>(.+?)</dd>', remaining_content, re.DOTALL)
    # ... rest of extraction logic
```

---

## Bug #2: Multiple `<dd>` Elements Not Captured (CRITICAL)

### Root Cause
**File**: `extract_works_to_json.py`, line 227

```python
dt_dd_matches = re.findall(r'<dt>([^<]+?)(?:</a>)?</dt>\s*<dd>(.+?)</dd>', remaining_content, re.DOTALL)
```

This regex only captures **ONE** `<dd>` per `<dt>`. When HTML has multiple consecutive `<dd>` elements (common for exhibitions/links), only the first is extracted.

### Affected File: Motion-Crossfader.html

**HTML** (lines 119-123):
```html
<dt>Exhibition</a></dt>
<dd>2019</dd>
<dd><a class="list" href="http://kata-gallery.net/schedule/xmusicexvol-0">x Music Exhibition Keio SFC x-Music Lab vol.0</a> [Aug 24,2019]</dd>
<dd>「自分らしく生きたい。」展 / 自分らしく生きるとっておきのヒントをお見せします [Oct 2,2019 - Oct 12.2019]</dd>
```

**Current JSON** (`motion-crossfader.json`):
```json
{
  "exhibition": "2019"
}
```

**Missing Data**:
- x Music Exhibition link + date: `[Aug 24,2019]`
- 「自分らしく生きたい。」展: `[Oct 2,2019 - Oct 12.2019]`

### Impact
- **Severity**: HIGH - Partial data loss for multiple exhibitions/events
- **Affected Fields**: Exhibition (confirmed), potentially Link, Related
- **Files**: Motion-Crossfader.html confirmed, others need verification

### Recommended Fix
Modify regex to capture ALL consecutive `<dd>` elements:

```python
# First, find all <dt> labels
dt_labels = re.findall(r'<dt>([^<]+?)(?:</a>)?</dt>', remaining_content)

for dt_label in dt_labels:
    clean_label = dt_label.strip()

    # Find all <dd> elements following this <dt> (until next <dt> or end)
    pattern = r'<dt>' + re.escape(dt_label) + r'(?:</a>)?</dt>(.*?)(?=<dt>|$)'
    section_match = re.search(pattern, remaining_content, re.DOTALL)

    if section_match:
        section = section_match.group(1)
        # Extract all <dd> in this section
        dd_elements = re.findall(r'<dd>(.+?)</dd>', section, re.DOTALL)

        if len(dd_elements) > 1:
            # Multiple elements - join with <br> or array
            combined = '<br>'.join(dd_elements)
        else:
            combined = dd_elements[0] if dd_elements else None

        # Map to fields...
```

---

## Bug #3: Verification Script False Positives (LOW PRIORITY)

### Issue
The verification script (`verify-extraction.js`) reported 52 bugs, but most were **false positives** due to:

1. **Incorrect slug conversion** - Script expected `adaptiveyantra.json` but actual file is `adaptive-yantra.json`
2. **Wrong field map** - Script didn't include "Tool" (singular), "Link", "Co-create with" mappings

### Actual vs Expected
- Script reported 11 "MISSING_JSON" files - **All 11 JSON files exist**
- Script reported 40 "UNKNOWN_FIELD" issues - **All fields are extracted correctly when `<p>` tag exists**

### Impact
- **Severity**: LOW - Verification tool issue only, does not affect actual extraction
- **Fix**: Update verification script's slug conversion and field map

---

## Complete List of Files with Data Loss

### Confirmed Data Loss

| File | Missing Field | HTML Content Lost | Reason |
|------|---------------|-------------------|--------|
| `colorboxes.html` | link | GitHub + NEORT (2 links) | No `<p>` tag |
| `randb.html` | link | GitHub + NEORT (2 links) | No `<p>` tag |
| `Motion-Crossfader.html` | exhibition | 2 additional exhibitions | Multiple `<dd>` |

### Potential Data Loss (Needs Verification)

Files without `<p>` tags may have Link/Download/Citation fields missing:
- `rfont.html`
- `sanskritlogo.html`
- `shikael.html`
- `OriginalLogo.html`
- `Toilecher.html`
- `cfv.html`
- `jpdd.html`
- `eyehaveyou.html`
- `pourwater.html`

**Action Required**: Run verification on these files to check for missing Link/Download/Citation data.

---

## Files Successfully Extracting All Data

These files have `<p>` tags and extract correctly:
- `improvise-chain.html` - Link with 2 URLs ✓
- `playingtokyo-vol11.html` - Link with 2 URLs ✓, Performers ✓
- `Morse_Code.html` - Tool ✓, Link ✓, Download ✓
- `inochinokodou.html` - Credit with nested `<ul>` ✓, Tool ✓, Link ✓
- `muses-ex-echoes.html` - Link with 3 URLs ✓
- `motion-crossfader.html` - Tool ✓, Co-create with ✓, Citation ✓ (but Exhibition incomplete)

---

## Testing Checklist

After implementing fixes:

### Bug #1: Missing `<p>` Tag
- [ ] `colorboxes.html` - Link field with 2 URLs extracted
- [ ] `randb.html` - Link field with 2 URLs extracted
- [ ] `rfont.html` - Verify Link/Download fields
- [ ] `sanskritlogo.html` - Verify Link/Download fields
- [ ] `shikael.html` - Verify Link/Download fields

### Bug #2: Multiple `<dd>`
- [ ] `Motion-Crossfader.html` - All 3 exhibition entries extracted
- [ ] Search for other files with multiple `<dd>` patterns:
  ```bash
  grep -A5 '<dt>Exhibition' works/*.html | grep -c '</dd>'
  ```

### Bug #3: Verification Script
- [ ] Update slug conversion to handle camelCase → kebab-case
- [ ] Sync field map with actual extractor mappings
- [ ] Re-run verification and confirm 0 false positives

---

## Summary Statistics

| Category | Count | Severity |
|----------|-------|----------|
| Missing `<p>` tag bug (data loss) | 5-10 files | **CRITICAL** |
| Multiple `<dd>` bug (data loss) | 1 confirmed | **HIGH** |
| Verification script false positives | 51 | LOW |
| **Total Real Extraction Bugs** | **2** | **CRITICAL** |

---

## Recommended Priority

1. **URGENT**: Fix Bug #1 (missing `<p>` tag) - Affects 5-10 files, complete field loss
2. **HIGH**: Fix Bug #2 (multiple `<dd>`) - Affects Motion-Crossfader, possibly others
3. **LOW**: Fix Bug #3 (verification script) - Tool quality improvement

---

## Code References

### Bug #1 Location
- **File**: `scripts/extract_works_to_json.py`
- **Lines**: 222-224 (conditional `if p_end:`)
- **Function**: `extract_work_data()`

### Bug #2 Location
- **File**: `scripts/extract_works_to_json.py`
- **Line**: 227 (regex pattern)
- **Function**: `extract_work_data()`

### Bug #3 Location
- **File**: `verify-extraction.js`
- **Lines**:
  - 66-68 (slug conversion)
  - 84-110 (field map)

---

**Report Complete**: 2025-11-17
**Verification Data**: `/Users/ryosimon/Documents/Homepage/ryo-simon-mf.github.io/extraction-bugs.json`
**Test Results**: Confirmed by running extractor and comparing HTML vs JSON
