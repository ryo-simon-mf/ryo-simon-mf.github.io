#!/usr/bin/env node

/**
 * Remove trailing <br> tags from JSON field values
 * This prevents empty lines at the end of content sections
 */

const fs = require('fs');
const path = require('path');

const worksDataDir = path.join(__dirname, '../works-data');

// Fields that might contain HTML with trailing <br>
const htmlFields = [
  'description',
  'credit',
  'tools',
  'link',
  'exhibition',
  'award',
  'paper',
  'grants',
  'collaborators',
  'performers',
  'download',
  'citation',
  'related'
];

function cleanTrailingBr(text) {
  if (typeof text !== 'string') return text;

  // Remove trailing <br> tags (with or without attributes, self-closing or not)
  // Also handles multiple <br> tags at the end
  return text.replace(/(<br\s*\/?>)+\s*$/gi, '');
}

function processJsonFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(content);

  let modified = false;

  htmlFields.forEach(field => {
    if (data[field]) {
      const cleaned = cleanTrailingBr(data[field]);
      if (cleaned !== data[field]) {
        console.log(`${path.basename(filePath)}: Cleaned trailing <br> from ${field}`);
        data[field] = cleaned;
        modified = true;
      }
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
    return true;
  }

  return false;
}

// Get all JSON files except index.json and _template.json
const files = fs.readdirSync(worksDataDir)
  .filter(file => file.endsWith('.json'))
  .filter(file => file !== 'index.json' && file !== '_template.json')
  .map(file => path.join(worksDataDir, file));

console.log(`Processing ${files.length} JSON files...\n`);

let modifiedCount = 0;
files.forEach(file => {
  if (processJsonFile(file)) {
    modifiedCount++;
  }
});

console.log(`\nDone! Modified ${modifiedCount} file(s).`);
