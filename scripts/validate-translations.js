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

  for (const [lowerKey, entries] of keyLineMap.entries()) {
    if (entries.length > 1) {
      const entryLines = entries
        .map(e => `🔁 "${e.originalKey}" at line ${e.line}`)
        .join('\n  ');
      duplicates.push(entryLines);
    }
  }

  if (duplicates.length > 0) {
    console.error(`❌ Duplicate keys found in ${filename}:\n  ${duplicates.join('\n  ')}`);
    process.exit(1);
  }
}

function detectCaseConsistency(contentEn, contentAr, filenameEn, filenameAr) {
  const keyCaseMapEn = {}; // en.json -> { key: case }
  const keyCaseMapAr = {}; // ar.json -> { key: case }

  // Function to add keys to map with their case
  function addKeyToMap(content, map, filename) {
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      const keyMatch = line.match(/"([^"]+)":/);
      if (keyMatch) {
        const originalKey = keyMatch[1];
        map[originalKey] = originalKey; // Track the exact case of the key
      }
    });
  }

  // === Add keys from both files ===
  addKeyToMap(contentEn, keyCaseMapEn, filenameEn);
  addKeyToMap(contentAr, keyCaseMapAr, filenameAr);

  // === Compare case consistency ===
  const mismatchedKeys = [];

  for (const key in keyCaseMapEn) {
    if (keyCaseMapAr[key] && keyCaseMapEn[key] !== keyCaseMapAr[key]) {
      mismatchedKeys.push(`${keyCaseMapEn[key]} (in ${filenameEn}) vs ${keyCaseMapAr[key]} (in ${filenameAr})`);
    }
  }

  // === Output mismatched keys ===
  if (mismatchedKeys.length > 0) {
    console.error(`❌ Case inconsistency detected between ${filenameEn} and ${filenameAr}:\n  ${mismatchedKeys.join('\n  ')}`);
    process.exit(1);
  }
}

// === Load files ===
const enPath = path.join(__dirname, '..', 'src', 'assets', 'i18n', 'en.json');
const arPath = path.join(__dirname, '..', 'src', 'assets', 'i18n', 'ar.json');

const enRaw = fs.readFileSync(enPath, 'utf8');
const arRaw = fs.readFileSync(arPath, 'utf8');

// === Enforce Case Consistency ===
detectCaseConsistency(enRaw, arRaw, 'en.json', 'ar.json');

// === Detect Duplicates ===
detectDuplicateKeys(enRaw, 'en.json');
detectDuplicateKeys(arRaw, 'ar.json');

// === Parse content after checks ===
const en = JSON.parse(enRaw);
const ar = JSON.parse(arRaw);

// === Check for Missing Keys ===
const enKeys = Object.keys(en);
const arKeys = Object.keys(ar);

const missingInAr = enKeys.filter(k => !arKeys.includes(k));
const missingInEn = arKeys.filter(k => !enKeys.includes(k));

if (missingInAr.length || missingInEn.length) {
  if (missingInAr.length) {
    console.error(`🟡 Missing keys in ar.json:\n  ${missingInAr.join('\n  ')}`);
  }
  if (missingInEn.length) {
    console.error(`🟡 Missing keys in en.json:\n  ${missingInEn.join('\n  ')}`);
  }
  process.exit(1);
}

console.log('✅ All good! Case consistency, duplicates, and missing keys are valid.');
