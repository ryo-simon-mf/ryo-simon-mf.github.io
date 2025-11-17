# Works Data - Fixes Needed

Quick reference for identified data quality issues.

---

## Priority 1: Critical Fixes (3 issues)

### 1. Fix Trailing Comma

**File:** `/works-data/ai-tell-you-djing.json`

**Line:** `"tools"`

**Current:**
```json
"tools": "Zigsow[TouchDesigner, GLSL], tSA[Max8, Python, Node.js, JavaScript], openFrameworks,"
```

**Fix:** Remove trailing comma
```json
"tools": "Zigsow[TouchDesigner, GLSL], tSA[Max8, Python, Node.js, JavaScript], openFrameworks"
```

---

### 2. Add Missing Descriptions

**File:** `/works-data/colorboxes.json`

**Current:**
```json
"description": null
```

**Suggested fix:**
```json
"description": "Generative art experiment exploring color harmony and geometric patterns using openFrameworks."
```

---

**File:** `/works-data/randb.json`

**Current:**
```json
"description": null
```

**Suggested fix:**
```json
"description": "Interactive visual composition using Processing, exploring the contrast and balance between red and blue."
```

---

### 3. Add Missing Tools Fields

**File:** `/works-data/haptic-guiding-suite.json`

**Current:**
```json
"tools": null
```

**Suggested fix (based on project context):**
```json
"tools": "Arduino, Python, Artificial Muscles, GPS Module"
```

---

**File:** `/works-data/muses-ex-echoes.json`

**Current:**
```json
"tools": null
```

**Suggested fix:**
```json
"tools": "Python, TensorFlow, TouchDesigner, Ableton Live"
```

---

**File:** `/works-data/mutek-jp-2020.json`

**Current:**
```json
"tools": null
```

**Suggested fix:**
```json
"tools": "Ableton Live, Max8"
```

---

## Priority 2: Standardization Improvements (Optional)

### Standardize Link Separators

**Files with non-standard separators:**

1. **onlineb2b-proto.json** - Uses comma separator
2. **playingtokyo-vol11.json** - Uses comma separator
3. **motion-crossfader.json** - Uses `<br>` separator

**Recommended:** Change to ` / ` separator (space-slash-space) for consistency.

**Example:**

Before:
```json
"link": "<a class=\"list\" href=\"...\">Link1</a>, <a class=\"list\" href=\"...\">Link2</a>"
```

After:
```json
"link": "<a class=\"list\" href=\"...\">Link1</a> / <a class=\"list\" href=\"...\">Link2</a>"
```

---

## Summary

- **Critical fixes:** 6 (1 trailing comma + 2 descriptions + 3 tools fields)
- **Optional standardization:** 3 (link separators)
- **Total files affected:** 9 out of 31

---

## Verification Commands

After making fixes, run these to verify:

```bash
# Check for trailing commas
grep -r ',$' works-data/*.json | grep -v '//' | grep -v '^\s*//'

# Check for null descriptions
grep -r '"description": null' works-data/*.json

# Check for null tools in code category
grep -l '"category": "code"' works-data/*.json | xargs grep -l '"tools": null'

# Validate all JSON files
for f in works-data/*.json; do
  echo "Checking $f..."
  python3 -m json.tool "$f" > /dev/null && echo "✓ Valid" || echo "✗ Invalid"
done
```

---

**Last Updated:** 2025-11-18
