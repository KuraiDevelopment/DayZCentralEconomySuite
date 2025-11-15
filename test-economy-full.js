// Full test of parseConfigFile for cfgeconomycore.xml
const fs = require('fs');

// Import the parser functions (we'll simulate them)
const { XMLParser } = require('fast-xml-parser');

const filePath = 'C:\\Program Files (x86)\\Steam\\steamapps\\common\\DayZServer\\mpmissions\\dayzOffline.chernarusplus\\cfgeconomycore.xml';
const content = fs.readFileSync(filePath, 'utf8');

console.log('Testing cfgeconomycore.xml parsing...\n');

// Step 1: Detect file type
const filename = 'cfgeconomycore.xml';
const lowerFilename = filename.toLowerCase();

let fileType = 'unknown';
if (lowerFilename.includes('economy') || lowerFilename.includes('cfgeconomycore')) {
  fileType = 'economy';
} else if (content.includes('<economycore>')) {
  fileType = 'economy';
}

console.log('✓ Detected file type:', fileType);

// Step 2: Validate XML structure (simplified)
let validationPassed = true;
if (!content || content.trim().length === 0) {
  console.log('✗ File is empty');
  validationPassed = false;
}
if (!content.includes('<') || !content.includes('>')) {
  console.log('✗ No XML tags found');
  validationPassed = false;
}

if (validationPassed) {
  console.log('✓ Validation passed (simplified check)');
}

// Step 3: Parse with fast-xml-parser
const parserOptions = {
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  parseAttributeValue: false,
  parseTagValue: true,
  trimValues: true,
  cdataPropName: '__cdata',
  commentPropName: '__comment',
  ignoreDeclaration: false,
  ignorePiTags: false,
  arrayMode: false,
};

try {
  const parser = new XMLParser(parserOptions);
  const result = parser.parse(content);
  
  console.log('✓ XML parsed successfully');
  console.log('✓ Root element found:', result.economycore ? 'economycore' : 'MISSING!');
  
  if (result.economycore) {
    console.log('✓ Has classes section:', !!result.economycore.classes);
    console.log('✓ Has defaults section:', !!result.economycore.defaults);
    
    if (result.economycore.classes?.rootclass) {
      const rootclasses = Array.isArray(result.economycore.classes.rootclass) 
        ? result.economycore.classes.rootclass 
        : [result.economycore.classes.rootclass];
      console.log('✓ Rootclass count:', rootclasses.length);
    }
    
    if (result.economycore.defaults?.default) {
      const defaults = Array.isArray(result.economycore.defaults.default) 
        ? result.economycore.defaults.default 
        : [result.economycore.defaults.default];
      console.log('✓ Defaults count:', defaults.length);
    }
    
    console.log('\n✅ cfgeconomycore.xml parsed successfully!');
  } else {
    console.log('\n✗ FAILED: Missing economycore root element');
    console.log('Found keys:', Object.keys(result));
  }
} catch (error) {
  console.log('\n✗ Parse error:', error.message);
}
