const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const worksDir = '/Users/ryosimon/Documents/Homepage/ryo-simon-mf.github.io/works';
const dataDir = '/Users/ryosimon/Documents/Homepage/ryo-simon-mf.github.io/works-data';

// HTML files to skip
const skipFiles = ['works.html', 'testpages.html', 'Gallery.html', 'eyehaveyou_test.html', 'ZigSow copy.html', 'poutwater.html', 'playingtokyo_vj.html', 'Kinei_ME.html', 'blanc.html', 'ready.html'];

const bugs = [];
let checkedCount = 0;

// Helper to extract text content from HTML element
function extractText(element) {
  if (!element) return null;
  return element.textContent.trim() || null;
}

// Helper to extract DD content including HTML
function extractDD(dd) {
  if (!dd) return null;

  // Check for links
  const links = dd.querySelectorAll('a');
  if (links.length > 0) {
    return Array.from(links).map(a => ({
      text: a.textContent.trim(),
      url: a.href
    }));
  }

  // Check for breaks
  const html = dd.innerHTML;
  if (html.includes('<br>')) {
    return html.split('<br>').map(s => s.trim()).filter(s => s);
  }

  return dd.textContent.trim() || null;
}

// Get all HTML files
const htmlFiles = fs.readdirSync(worksDir)
  .filter(f => f.endsWith('.html') && !skipFiles.includes(f))
  .sort();

console.log(`Found ${htmlFiles.length} HTML files to check\n`);

for (const htmlFile of htmlFiles) {
  const htmlPath = path.join(worksDir, htmlFile);
  const jsonSlug = htmlFile.replace('.html', '').toLowerCase()
    .replace(/_/g, '-')
    .replace(/\s+/g, '-');
  const jsonPath = path.join(dataDir, `${jsonSlug}.json`);

  // Check if JSON exists
  if (!fs.existsSync(jsonPath)) {
    bugs.push({
      workId: htmlFile,
      type: 'MISSING_JSON',
      message: `No JSON file found for ${htmlFile}`,
      expected: jsonPath
    });
    continue;
  }

  checkedCount++;

  // Load HTML
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');
  const dom = new JSDOM(htmlContent);
  const doc = dom.window.document;

  // Load JSON
  const json = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  // Extract metadata from HTML
  const title = doc.querySelector('h1')?.textContent.trim();
  const dts = Array.from(doc.querySelectorAll('dt'));
  const dds = Array.from(doc.querySelectorAll('dd'));

  const htmlData = {};
  dts.forEach((dt, i) => {
    const label = dt.textContent.trim().replace(':', '');
    const dd = dds[i];
    if (dd) {
      htmlData[label] = extractDD(dd);
    }
  });

  // Check title
  if (title && !json.title) {
    bugs.push({
      workId: htmlFile,
      type: 'MISSING_TITLE',
      field: 'title',
      htmlContent: title,
      jsonValue: json.title
    });
  }

  // Map HTML labels to JSON fields
  const fieldMap = {
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
    'Award': 'award'
  };

  // Check each HTML field
  for (const [htmlLabel, htmlValue] of Object.entries(htmlData)) {
    const jsonField = fieldMap[htmlLabel];

    if (!jsonField) {
      // Unknown field in HTML
      bugs.push({
        workId: htmlFile,
        type: 'UNKNOWN_FIELD',
        field: htmlLabel,
        htmlContent: htmlValue,
        message: `HTML has field "${htmlLabel}" not in field map`
      });
      continue;
    }

    const jsonValue = json[jsonField];

    // Check if JSON is missing this field
    if (htmlValue && !jsonValue) {
      bugs.push({
        workId: htmlFile,
        type: 'EMPTY_FIELD',
        field: jsonField,
        htmlLabel: htmlLabel,
        htmlContent: htmlValue,
        jsonValue: jsonValue
      });
    }

    // Check for truncation (if both exist)
    if (htmlValue && jsonValue) {
      const htmlStr = typeof htmlValue === 'string' ? htmlValue : JSON.stringify(htmlValue);
      const jsonStr = typeof jsonValue === 'string' ? jsonValue : JSON.stringify(jsonValue);

      if (htmlStr.length > jsonStr.length + 50) {
        bugs.push({
          workId: htmlFile,
          type: 'TRUNCATED',
          field: jsonField,
          htmlLength: htmlStr.length,
          jsonLength: jsonStr.length,
          htmlContent: htmlStr.substring(0, 200) + '...',
          jsonContent: jsonStr.substring(0, 200) + '...'
        });
      }
    }
  }

  // Check for JSON fields that should have data from HTML
  for (const [jsonField, jsonValue] of Object.entries(json)) {
    if (jsonField === 'slug' || jsonField === 'title') continue;

    if (!jsonValue || (Array.isArray(jsonValue) && jsonValue.length === 0)) {
      // Find corresponding HTML label
      const htmlLabel = Object.keys(fieldMap).find(k => fieldMap[k] === jsonField);
      if (htmlLabel && htmlData[htmlLabel]) {
        bugs.push({
          workId: htmlFile,
          type: 'NULL_WITH_HTML_DATA',
          field: jsonField,
          htmlLabel: htmlLabel,
          htmlContent: htmlData[htmlLabel],
          jsonValue: jsonValue
        });
      }
    }
  }
}

// Generate report
console.log('='.repeat(80));
console.log('DATA EXTRACTION VERIFICATION REPORT');
console.log('='.repeat(80));
console.log(`\nChecked: ${checkedCount} works`);
console.log(`Bugs found: ${bugs.length}\n`);

// Group by type
const byType = {};
bugs.forEach(bug => {
  if (!byType[bug.type]) byType[bug.type] = [];
  byType[bug.type].push(bug);
});

for (const [type, typeBugs] of Object.entries(byType)) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`${type} (${typeBugs.length} issues)`);
  console.log('='.repeat(80));

  typeBugs.forEach(bug => {
    console.log(`\nWork: ${bug.workId}`);
    if (bug.field) console.log(`Field: ${bug.field}`);
    if (bug.htmlLabel) console.log(`HTML Label: ${bug.htmlLabel}`);
    if (bug.message) console.log(`Message: ${bug.message}`);
    if (bug.htmlContent !== undefined) {
      const content = typeof bug.htmlContent === 'string'
        ? bug.htmlContent
        : JSON.stringify(bug.htmlContent, null, 2);
      console.log(`HTML Content: ${content.substring(0, 300)}${content.length > 300 ? '...' : ''}`);
    }
    if (bug.jsonValue !== undefined) {
      console.log(`JSON Value: ${JSON.stringify(bug.jsonValue)}`);
    }
    if (bug.htmlLength) {
      console.log(`HTML Length: ${bug.htmlLength}, JSON Length: ${bug.jsonLength}`);
    }
    console.log('-'.repeat(80));
  });
}

// Save to file
const reportPath = '/Users/ryosimon/Documents/Homepage/ryo-simon-mf.github.io/extraction-bugs.json';
fs.writeFileSync(reportPath, JSON.stringify(bugs, null, 2));
console.log(`\n\nFull report saved to: ${reportPath}`);
