# **Translation Validation GitHub Action**

This GitHub Action is designed to automate the validation of translation files in an Angular project, specifically focusing on:

- **Checking for duplicate keys** in the translation files.
- **Detecting missing translation keys** between the language files.

The action will run automatically on a **pull request** to help ensure that translation files are up to date and valid.

## **Features**

- **Detect Duplicate Keys**: Identifies duplicate keys in the translation files, even if the cases are different.
- **Detect Missing Keys**: Checks if any keys are missing in either `en.json` or `ar.json`.

The action will print errors for duplicate and missing keys and fail the PR if any issues are detected.

---

## **How It Works**

The action performs the following checks:

1. **Duplicate Keys**:
   - Flags duplicate keys (case-insensitive) in the `en.json` and `ar.json` files.

2. **Missing Keys**:
   - Flags missing keys in `ar.json` that are present in `en.json` and vice versa.

### **Error Reporting**:

The action will output errors in the following format:

- **❗ Duplicate Keys**: Identifies duplicate keys in the translation files (case-insensitive).
- **❌ Missing Keys**: Flags missing translation keys from one file when they are present in the other file.

**Example :**

<img src="https://github.com/user-attachments/assets/8a253787-429f-495d-9aaa-5084bd18201e" width="600"/>

---

## **Setup Instructions**

Follow these steps to set up the **Translation Validation GitHub Action** in your Angular project:

### 1. **Create Translation Files**

Ensure your translation files are in the following path structure:


### 2. **Create GitHub Action Workflow**

1. In your repository, navigate to `.github/workflows`.
2. Create a new file called `translation-validation.yml` in this directory.
3. Copy the following YAML configuration into this file:

```yaml
name: Translation Validation

on:
  pull_request:
    paths:
      - 'src/assets/i18n/en.json'
      - 'src/assets/i18n/ar.json'

jobs:
  translation-validation:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout code
      uses: actions/checkout@v2

    - name: Set up Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'

    - name: Install dependencies
      run: |
        npm install

    - name: Run translation validation
      run: |
        node ./scripts/validateTranslations.js
```

### 3. **Create the Validation Script**
In your project, create a directory named scripts at the root level (next to src), and then create a file called validateTranslations.js inside it.

Copy the following Node.js script into this file:
```js
const fs = require('fs');
const path = require('path');

function detectDuplicateKeys(content, filename) {
  const keyLineMap = new Map(); 
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

  // Group duplicates by case-insensitive keys and report them
  for (const [lowerKey, entries] of keyLineMap.entries()) {
    if (entries.length > 1) {
      const entryLines = entries
        .map(e => `🟡 "${e.originalKey}" at line ${e.line}`)
        .join('\n  ');
      duplicates.push(`❗ Duplicate keys found in ${filename} for "${entries[0].originalKey}":\n  ${entryLines}`);
    }
  }

  return duplicates;
}

function detectMissingKeys(en, ar, enFilename, arFilename) {
  const enKeys = Object.keys(en);
  const arKeys = Object.keys(ar);

  const missingInAr = enKeys.filter(k => !arKeys.includes(k));
  const missingInEn = arKeys.filter(k => !enKeys.includes(k));

  const missingKeys = [];
  if (missingInAr.length) {
    missingKeys.push(`❌ Missing keys in ${arFilename}:\n  ${missingInAr.join('\n  ')}`);
  }
  if (missingInEn.length) {
    missingKeys.push(`❌ Missing keys in ${enFilename}:\n  ${missingInEn.join('\n  ')}`);
  }

  return missingKeys;
}

// === Load files ===
const enPath = path.join(__dirname, '..', 'src', 'assets', 'i18n', 'en.json');
const arPath = path.join(__dirname, '..', 'src', 'assets', 'i18n', 'ar.json');

const enRaw = fs.readFileSync(enPath, 'utf8');
const arRaw = fs.readFileSync(arPath, 'utf8');

// === Detect Duplicates ===
const duplicateErrors = [
  ...detectDuplicateKeys(enRaw, 'en.json'),
  ...detectDuplicateKeys(arRaw, 'ar.json')
];

// === Parse content after checks ===
const en = JSON.parse(enRaw);
const ar = JSON.parse(arRaw);

// === Check for Missing Keys ===
const missingErrors = detectMissingKeys(en, ar, 'en.json', 'ar.json');

// Combine all errors
const allErrors = [
  ...(duplicateErrors.length > 0 ? duplicateErrors : []),
  ...(missingErrors.length > 0 ? missingErrors : [])
];

// If there are errors, print them and fail the action
if (allErrors.length > 0) {
  console.error(allErrors.join('\n\n'));
  process.exit(1);
}

console.log('✅ All good! No duplicates or missing keys.');
```

## **Test the Action**

1. Make a change to the `en.json` or `ar.json` files.
2. Push the changes to your repository and create a pull request.
3. The GitHub Action will run automatically and provide output indicating any duplicate or missing keys.

## **Customizing the Action**

You can modify the action to meet specific needs:

- **Skip case sensitivity**: In the validation script, the case-insensitive check is enabled by default for duplicate keys.
- **Additional checks**: Add more logic to the `validateTranslations.js` script if you need extra validation (e.g., specific key formats).

## **Troubleshooting**

- **Action not triggering**: Ensure that the `en.json` and `ar.json` files are correctly located in the path `src/assets/i18n/` as defined in the GitHub Action workflow.
- **Errors not showing**: Check the Action logs to see if the translation files were properly read and parsed.
- **Action failing**: If you encounter errors like missing modules, make sure that all dependencies are installed and that `npm install` runs successfully in the GitHub Action.

## **Contributions**

Feel free to contribute by opening pull requests or submitting issues. Contributions are always welcome!

Made by [Mostafa](https://www.linkedin.com/in/mustafasoliman19/) & [ChatGPT](https://chatgpt.com/) 🤖
