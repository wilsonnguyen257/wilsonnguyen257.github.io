// Script to check for missing translations between English and Vietnamese
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the language context file
const filePath = path.join(__dirname, '../src/contexts/LanguageContext.tsx');
const content = fs.readFileSync(filePath, 'utf8');

// Extract translations using regex
const vietnameseMatches = content.match(/vi:\s*\{([\s\S]*?)\}/);
const englishMatches = content.match(/en:\s*\{([\s\S]*?)\}/);

if (!vietnameseMatches || !englishMatches) {
    console.error('Could not find language sections in the file');
    process.exit(1);
}

// Extract translation keys
const vietnameseSection = vietnameseMatches[1];
const englishSection = englishMatches[1];

// Find all translation keys
const vietnameseKeys = new Set();
const englishKeys = new Set();

// Match translation keys (format: 'key.key':)
const keyRegex = /'([^']+)':/g;
let match;

// Extract Vietnamese keys
while ((match = keyRegex.exec(vietnameseSection)) !== null) {
    vietnameseKeys.add(match[1]);
}

// Reset regex for English section
keyRegex.lastIndex = 0;

// Extract English keys
while ((match = keyRegex.exec(englishSection)) !== null) {
    englishKeys.add(match[1]);
}

// Find missing translations
const missingInVietnamese = [...englishKeys].filter(key => !vietnameseKeys.has(key));
const missingInEnglish = [...vietnameseKeys].filter(key => !englishKeys.has(key));

// Report results
console.log('\n=== Translation Check Report ===\n');
console.log(`Total English translations: ${englishKeys.size}`);
console.log(`Total Vietnamese translations: ${vietnameseKeys.size}\n`);

if (missingInVietnamese.length > 0) {
    console.log('❌ Missing Vietnamese translations:');
    missingInVietnamese.forEach(key => {
        console.log(`   - '${key}'`);
    });
    console.log(`\n   Total missing: ${missingInVietnamese.length}\n`);
} else {
    console.log('✅ All English translations have Vietnamese counterparts\n');
}

if (missingInEnglish.length > 0) {
    console.log('❌ Missing English translations:');
    missingInEnglish.forEach(key => {
        console.log(`   - '${key}'`);
    });
    console.log(`\n   Total missing: ${missingInEnglish.length}\n`);
} else {
    console.log('✅ All Vietnamese translations have English counterparts\n');
}

// Exit with error code if there are missing translations
if (missingInVietnamese.length > 0 || missingInEnglish.length > 0) {
    console.log('⚠️  Please add the missing translations above.');
    process.exit(1);
} else {
    console.log('🎉 All translations are in sync!');
    process.exit(0);
}
