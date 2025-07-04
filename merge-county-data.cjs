const fs = require('fs');
const parse = require('csv-parse/sync').parse;

console.log('=== merge-county-data.cjs script started ===');

// Load template (all counties)
const template = JSON.parse(fs.readFileSync('./public/Texas_County_Boundaries.json', 'utf8'));

// Load CSV and pre-filter lines
let csv = fs.readFileSync('./public/Cancer Data.csv', 'utf8');
let lines = csv.split('\n');
const header = lines[0];
const numColumns = header.split(',').length;
const filteredLines = [header, ...lines.slice(1).filter(line => line.split(',').length === numColumns)];
csv = filteredLines.join('\n');

// Parse CSV with columns (synchronously)
let records;
try {
  records = parse(csv, { columns: true, skip_empty_lines: true });
} catch (err) {
  console.error('CSV parse error:', err);
  process.exit(1);
}
console.log('CSV parsed. Number of records (raw):', records.length);
console.log('First 3 records:', records.slice(0, 3));

// Only keep records that look like real county data
const countyRecords = records.filter(row => {
  const field = row['Health Service Area'] || row['County'] || '';
  return field.match(/, TX/);
});
console.log('Filtered to county records:', countyRecords.length);

// Helper: Normalize county name for matching
const norm = s => s.trim().toLowerCase().replace(/ county$/, '');

// Build a lookup from template by county name
const templateByName = {};
template.forEach(county => {
  if (county.CNTY_NM) templateByName[norm(county.CNTY_NM)] = county;
});

// Merge CSV data into template
let matched = 0;
countyRecords.forEach(row => {
  // Try to extract county name and match
  // Example: "Angelina, TX - Walker, TX(7)" or "Angelina, TX(7)"
  const countyField = row['Health Service Area'] || row['County'] || '';
  const txMatch = countyField.match(/([A-Za-z\s]+), TX/);
  let countyName = txMatch ? txMatch[1].trim() : null;

  let county = null;
  if (countyName && templateByName[norm(countyName)]) {
    county = templateByName[norm(countyName)];
  }
  if (county) {
    // Always include these fields, defaulting to 0 if not present
    county.AgeAdjustedDeathRate = parseFloat(row['Age-Adjusted Incidence Rate([rate note]) - cases per 100,000']) || 0;
    county.AverageAnnualDeaths = parseFloat(row['Average Annual Count']) || 0;
    county.RecentTrend_PercentPerYear = parseFloat(row['Recent 5-Year Trend ([trend note]) in Incidence Rates']) || 0;
    matched++;
  }
});

console.log(`Merged data for ${matched} counties. Output written to public/data.json`);
fs.writeFileSync('./public/data.json', JSON.stringify(template, null, 2));
const stats = fs.statSync('./public/data.json');
console.log(`data.json file size: ${stats.size} bytes`);
// Log a sample merged county with data
const sample = template.find(c => c.AgeAdjustedDeathRate || c.AverageAnnualDeaths || c.RecentTrend_PercentPerYear);
if (sample) {
  console.log('Sample merged county:', sample);
} else {
  console.log('No counties with merged data found.');
}
console.log('=== Script completed successfully ===');