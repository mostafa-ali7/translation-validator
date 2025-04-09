const fs = require('fs');
const path = require('path');

// Path to your translation files
const enFilePath = path.join(__dirname, '..', 'src', 'assets', 'i18n', 'en.json');
const arFilePath = path.join(__dirname, '..', 'src', 'assets', 'i18n', 'ar.json');

// Read translation files
const en = JSON.parse(fs.readFileSync(enFilePath, 'utf8'));
const ar = JSON.parse(fs.readFileSync(arFilePath, 'utf8'));

// Function to check if both files have the same keys
const checkKeys = (en, ar) => {
  const enKeys = Object.keys(en);
  const arKeys = Object.keys(ar);

  const missingInAr = enKeys.filter(key => !ar.hasOwnProperty(key));
  const missingInEn = arKeys.filter(key => !en.hasOwnProperty(key));

  const duplicateKeys = enKeys.filter((value, index, self) => self.indexOf(value) !== index);

  if (missingInAr.length > 0 || missingInEn.length > 0 || duplicateKeys.length > 0) {
    let errorMessage = '';

    if (missingInAr.length > 0) {
      errorMessage += `Missing in Arabic file: ${missingInAr.join(', ')}\n`;
    }

    if (missingInEn.length > 0) {
      errorMessage += `Missing in English file: ${missingInEn.join(', ')}\n`;
    }

    if (duplicateKeys.length > 0) {
      errorMessage += `Duplicate keys found: ${duplicateKeys.join(', ')}\n`;
    }

    console.error(errorMessage);
    process.exit(1); // Exit with error code
  } else {
    console.log('All keys are consistent between translation files!');
  }
};

checkKeys(en, ar);