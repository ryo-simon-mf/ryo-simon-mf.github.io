# Data Extraction Verification Report
## Comprehensive Bug Analysis: HTML to JSON Extraction

**Date**: 2025-11-17
**Files Analyzed**: 32 HTML work files
**Files Successfully Checked**: 21 works
**Total Bugs Found**: 52 issues

---

## Executive Summary

The data extraction from HTML files to JSON has **3 major categories of bugs**:

1. **Filename Mapping Issues (11 files)** - JSON files exist but slug conversion fails
2. **Missing Field Mappings (40 instances)** - HTML labels not recognized by extractor
3. **Data Truncation (1 instance)** - Multiple `<dd>` elements not fully extracted

---

## 1. MISSING_JSON Files (11 Issues)

These files have JSON counterparts, but the slug transformation doesn't match correctly:

| HTML File | Expected Slug | Actual JSON File | Issue |
|-----------|---------------|------------------|-------|
| `AdaptiveYantra.html` | `adaptiveyantra.json` | `adaptive-yantra.json` | Missing hyphen between words |
| `AiTellYouDjing.html` | `aitellyoudjing.json` | `ai-tell-you-djing.json` | Missing hyphens |
| `HapticGuidingSuite.html` | `hapticguidingsuite.json` | `haptic-guiding-suite.json` | Missing hyphens |
| `Motion-Crossfader_ver.2.html` | `motion-crossfader-ver.2.json` | `motion-crossfader.json` | Version suffix not handled |
| `OriginalLogo.html` | `originallogo.json` | `original-logo.json` | Missing hyphen |
| `SequencingOfFutureConversation.html` | `sequencingoffutureconversation.json` | `sequencing-of-future-conversation.json` | Missing hyphens |
| `Text2Sequence.html` | `text2sequence.json` | `text2-sequence.json` | Number not treated as word boundary |
| `VariableFlavorRemix.html` | `variableflavorremix.json` | `variable-flavor-remix.json` | Missing hyphens |
| `ZigSow.html` | `zigsow.json` | `zig-sow.json` | Missing hyphen |
| `tSA.html` | `tsa.json` | `t-s-a.json` | Acronym handling issue |
| `xMusicOnline0418.html` | `xmusiconline0418.json` | `x-music-online0418.json` | Partial hyphenation |

**Root Cause**: The verification script uses basic `toLowerCase()` + `replace(/_/g, '-')` conversion, but actual JSON files use proper word-boundary hyphenation (camelCase → kebab-case).

**Files Actually Missing**: None - all 11 JSON files exist with correct naming.

---

## 2. UNKNOWN_FIELD Issues (40 Instances)

HTML contains these field labels that are **not mapped** in the extraction logic:

### A. "Tool" vs "Tools" (25 instances)

Many HTML files use `<dt>Tool</dt>` but the extractor expects `<dt>Tools</dt>`.

**Affected Files**:
- `Morse_Code.html` - "Tool" → should map to `tools`
- `Motion-Crossfader.html` - "Tool" → should map to `tools`
- `Toilecher.html` - "Tool" → should map to `tools`
- `cfv.html` - "Tool" → should map to `tools`
- `colorboxes.html` - "Tool" → should map to `tools`
- `eyehaveyou.html` - "Tool" → should map to `tools`
- `improvise_chain.html` - "Tool" (as link array) → should map to `tools`
- `inochinokodou.html` - "Tool" (malformed content) → should map to `tools`
- `jpdd.html` - "Tool" → should map to `tools`
- `onlineb2b_proto.html` - "Tool" → should map to `tools`
- `playingtokyo_vol11.html` - "Tool" (as link) → should map to `tools`
- `pourwater.html` - "Tool" → should map to `tools`
- `randb.html` - "Tool" → should map to `tools`
- `rfont.html` - "Tool" → should map to `tools`
- `sanskritlogo.html` - "Tool" → should map to `tools`
- `shikael.html` - "Tool" → should map to `tools`
- `solgasa_nextup_animation.html` - "Tool" (as link) → should map to `tools`
- `theplot_echo_mv.html` - "Tool" (empty link) → should map to `tools`

**Current JSON State**: Most of these files have `tools` populated correctly, suggesting extraction works but verification script has wrong field map.

### B. "Link" Field (12 instances)

HTML files use `<dt>Link</dt>` which is not in the field mapping.

**Affected Files**:
- `Morse_Code.html` - Contains "Max8" text (line 92-93)
- `Motion-Crossfader.html` - CCLab homepage link (line 114)
- `colorboxes.html` - GitHub + NEORT links (2 links)
- `improvise_chain.html` - ICC + CCLab links (2 links)
- `inochinokodou.html` - Contains "TouchDesigner" text (wrong position)
- `muses_ex_echoes.html` - ICC + CCLab + Vimeo links (3 links)
- `mutek_jp_2020.html` - Empty link field
- `onlineb2b_proto.html` - Medium + GitHub links (2 links)
- `playingtokyo_vol11.html` - PlayingTokyo + Twitch links (2 links)
- `randb.html` - GitHub + NEORT links (2 links)
- `solgasa_nextup_animation.html` - YouTube link (1 link)
- `theplot_echo_mv.html` - The Plot + Echo MV links (2 links)
- `toki-shirube.html` - [LINK] text with URL (1 link)

**Expected Mapping**: "Link" → `link` (or `url` or `related`)

### C. "Download" Field (1 instance)

- `Morse_Code.html` (line 103-109) - GitHub download link
  - Expected: Should map to `download` field
  - Current JSON: Has `download` field populated correctly

### D. "Co-create with" Field (5 instances)

HTML uses `<dt>Co-create with</dt>` for collaborators.

**Affected Files**:
- `Motion-Crossfader.html` - "Yuga Kobayashi" (line 108-110)
- `Toilecher.html` - "Kippei Wada"
- `cfv.html` - "Soma Sakata, Mizuki Hamazaki"
- `eyehaveyou.html` - "Soma Sakata, Mizuki Hamazaki"
- `jpdd.html` - "Soma Sakata, Mizuki Hamazaki"

**Expected Mapping**: "Co-create with" → `collaborators` or `collaboration`

**Current JSON State**: `Motion-Crossfader.json` has `collaborators: "Yuga Kobayashi"`, so extraction works.

### E. "Citation" Field (1 instance)

- `Motion-Crossfader.html` (line 126-128) - "2019" + cgworld link
  - Expected: Should map to `citation` field
  - Current JSON: Has `citation` field populated correctly

### F. "Performers" Field (2 instances)

- `playingtokyo_vol11.html` - DJ and VJ performer lists
- `solgasa_nextup_animation.html` - "Wez Atlas, VivaOla, michel ko, Tommi Crane, Jua & Shimon Hoshino"

**Expected Mapping**: "Performers" → `performers`

**Current JSON State**: Both files have `performers` field (need to verify content).

---

## 3. TRUNCATED Data (1 Critical Issue)

### Motion-Crossfader.html - Exhibition Field

**Location**: Lines 119-123

**HTML Content** (3 separate `<dd>` elements):
```html
<dt>Exhibition</a></dt>
<dd>2019</dd>
<dd><a class="list" href="http://kata-gallery.net/schedule/xmusicexvol-0">x Music Exhibition Keio SFC x-Music Lab vol.0</a> [Aug 24,2019]</dd>
<dd>「自分らしく生きたい。」展 / 自分らしく生きるとっておきのヒントをお見せします [Oct 2,2019 - Oct 12.2019]</dd>
```

**Current JSON** (`motion-crossfader.json` line 15):
```json
"exhibition": "2019"
```

**Missing Data**:
- x Music Exhibition link and date
- 「自分らしく生きたい。」展 exhibition details

**Root Cause**: Extractor only captures the **first** `<dd>` after each `<dt>`, ignoring subsequent sibling `<dd>` elements.

**Impact**: High - multiple exhibition entries are lost

---

## 4. HTML Structure Issues

### A. Malformed DT/DD Pairs

**File**: `inochinokodou.html` (lines 113-134)

**Issue**: Content is in wrong fields:
```html
<dt>Credit</dt>
<dd>
    <a>CORNER<br>
        <ul class="list-style-none">
            <li>Yusuke Wakata</li>
            <li>Yoshifumi Tara</li>
            <li>Hiroshi Nagaya</li>
            <li>Ryo Simon</li>
        </ul>
    </a>
</dd><br>
<dt>Tool</dt>
<dd>TouchDesigner</dd>
<dt>Link</dt>
<dd>毎日新聞 (link)</dd>
```

**Problem**:
- "Tool" content is correctly "TouchDesigner"
- But the verification script incorrectly extracted nested `<a>` tag content as "Tool" value
- This is a bug in the **verification script**, not the original extractor

### B. Empty or Malformed Link Fields

**File**: `theplot_echo_mv.html`

```html
<dt>Tool</dt>
<dd><a></a></dd>  <!-- Empty link tag -->
```

**Extracted**: `{"text": "", "url": ""}`

**Should be**: `null` or omitted

---

## 5. Data Consistency Check

### Files with "Link" HTML Label but no `link` JSON field

Need to verify if these links are stored in `url` or `related` fields:

1. `Morse_Code.html` → `morse-code.json`
2. `colorboxes.html` → `colorboxes.json`
3. `improvise_chain.html` → `improvise-chain.json`
4. `muses_ex_echoes.html` → `muses-ex-echoes.json`
5. `onlineb2b_proto.html` → `onlineb2b-proto.json`
6. `playingtokyo_vol11.html` → `playingtokyo-vol11.json`
7. `randb.html` → `randb.json`
8. `solgasa_nextup_animation.html` → `solgasa-nextup-animation.json`
9. `theplot_echo_mv.html` → `theplot-echo-mv.json`
10. `toki-shirube.html` → `toki-shirube.json`

---

## Recommended Fixes

### Priority 1: Critical Data Loss

1. **Fix multiple `<dd>` extraction** - Update extractor to capture ALL `<dd>` elements following a `<dt>`, not just the first one
   - Example: `Motion-Crossfader.html` Exhibition field

### Priority 2: Field Mapping

2. **Add "Tool" singular variant** - Map both "Tool" and "Tools" to `tools` field
3. **Add "Link" mapping** - Determine if it should map to `link`, `url`, or `related`
4. **Add "Co-create with" mapping** - Map to `collaborators` field
5. **Add "Download" mapping** - Map to `download` field
6. **Add "Citation" mapping** - Map to `citation` field
7. **Add "Performers" mapping** - Map to `performers` field

### Priority 3: Verification Script Issues

8. **Fix slug conversion** - Use proper camelCase → kebab-case conversion:
   ```javascript
   // Current (wrong):
   slug = filename.replace('.html', '').toLowerCase().replace(/_/g, '-')

   // Should be:
   slug = filename.replace('.html', '')
     .replace(/([a-z])([A-Z])/g, '$1-$2')  // camelCase boundaries
     .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')  // Acronyms
     .replace(/_/g, '-')
     .toLowerCase()
   ```

9. **Update field map in verification script** - Match actual extractor field mappings

### Priority 4: HTML Quality

10. **Fix malformed HTML** - `inochinokodou.html` has Link/Tool fields in wrong order
11. **Remove empty link tags** - `theplot_echo_mv.html` has `<a></a>` with no content

---

## Testing Checklist

After fixes, re-verify these specific cases:

- [ ] `Motion-Crossfader.html` - All 3 exhibition entries extracted
- [ ] `Morse_Code.html` - "Tool" (singular) and "Download" fields extracted
- [ ] `improvise_chain.html` - "Link" field with 2 URLs extracted
- [ ] All 11 "missing" JSON files matched correctly by verification script
- [ ] `inochinokodou.html` - Correctly handles nested `<ul>` in Credit field
- [ ] All "Co-create with" fields → `collaborators` in JSON

---

## Summary Statistics

| Category | Count | Severity |
|----------|-------|----------|
| Filename mapping bugs (false positives) | 11 | Low (verification script issue) |
| Missing field mappings | 40 | Medium (known field variants not mapped) |
| Data truncation | 1 | **High** (data loss) |
| HTML structure issues | 2 | Low (source data quality) |

**Total Issues**: 54
**Data Loss Issues**: 1 (Motion-Crossfader exhibition field)
**Extractor Bugs**: ~8 field mapping variants needed
**Verification Script Bugs**: ~12 (slug conversion + field map sync)

---

## Appendix: Field Mapping Reference

Based on analysis, the complete field map should be:

```javascript
const fieldMap = {
  // Existing (assumed correct)
  'Year': 'year',
  'Type': 'type',
  'Credit': 'credit',
  'Organizer': 'organizer',
  'Tools': 'tools',
  'Description': 'description',
  'URL': 'url',
  'Related': 'related',
  'Date': 'date',
  'Venue': 'venue',
  'Role': 'role',
  'Collaboration': 'collaboration',
  'Platform': 'platform',
  'Technology': 'technology',
  'Exhibition': 'exhibition',
  'Event': 'event',
  'Client': 'client',
  'Award': 'award',

  // Missing variants (need to add)
  'Tool': 'tools',                // Singular variant
  'Link': 'link',                 // Common in many files
  'Download': 'download',         // Present in JSON schema
  'Co-create with': 'collaborators',  // Collaboration variant
  'Citation': 'citation',         // Present in JSON schema
  'Performers': 'performers'      // Present in JSON schema
};
```

---

**Report Generated**: 2025-11-17
**Verification Script**: `/Users/ryosimon/Documents/Homepage/ryo-simon-mf.github.io/verify-extraction.js`
**Raw Data**: `/Users/ryosimon/Documents/Homepage/ryo-simon-mf.github.io/extraction-bugs.json`
