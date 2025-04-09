const fs = require('fs');
const path = require('path');

function detectDuplicateKeys(content, filename) {
  const keyLineMap = new Map(); // lowerKey -> [{ originalKey, line }]
  const duplicates = [];

  const lines = content.split('\n');

  lines.forEach((line, index) => {
    const keyMatch = line.match(/"([^"]+)":/);
    if (keyMatch) {
      const originalKey = keyMatch[1];
      const lowerKey = originalKey.toLowerCase();

      if (!keyLineMap.has(lowerKey)) {
        keyLineMap.set(lowerKey, []);
      }
      keyLineMap.get(lowerKey).push({ originalKey, line: index + 1 });
    }
  });

  // Check for duplicates (keys with the same lowercase version)
  for (const [lowerKey, entries] of keyLineMap.entries()) {
    if (entries.length > 1) {
      const entryLines = entries
        .map(e => `🔁 "${e.originalKey}" at line ${e.line}`)
        .join('\n  ');
      duplicates.push(entryLines);
    }
  }

  // If there are duplicate keys, fail the action
  if (duplicates.length > 0) {
    console.error(`❌ Duplicate keys found in ${filename}:\n  ${duplicates.join('\n  ')}`);
    process.exit(1);
  }
}

function detectMissingKeys(en, ar) {
  const enKeys = Object.keys(en);
  const arKeys = Object.keys(ar);

  const missingInAr = enKeys.filter(k => !arKeys.includes(k));
  const missingInEn = arKeys.filter(k => !enKeys.includes(k));

  if (missingInAr.length || missingInEn.length) {
    if (missingInAr.length) {
      console.error(`❌ Missing keys in ar.json:\n  ${missingInAr.join('\n  ')}`);
    }
    if (missingInEn.length) {
      console.error(`❌ Missing keys in en.json:\n  ${missingInEn.join('\n  ')}`);
    }
    process.exit(1);
  }
}

// === Load files ===
const enPath = path.join(__dirname, '..', 'src', 'assets', 'i18n', 'en.json');
const arPath = path.join(__dirname, '..', 'src', 'assets', 'i18n', 'ar.json');

const enRaw = fs.readFileSync(enPath, 'utf8');
const arRaw = fs.readFileSync(arPath, 'utf8');

// === Detect Duplicates ===
detectDuplicateKeys(enRaw, 'en.json');
detectDuplicateKeys(arRaw, 'ar.json');

// === Parse content after checks ===
const en = JSON.parse(enRaw);
const ar = JSON.parse(arRaw);

// === Check for Missing Keys ===
detectMissingKeys(en, ar);

console.log('✅ All good! No duplicates or missing keys.');
