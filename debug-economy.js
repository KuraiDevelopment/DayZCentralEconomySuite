// Debug script to see what's being parsed from cfgeconomycore.xml
const fs = require('fs');
const { XMLParser } = require('fast-xml-parser');

const filePath = 'C:\\Program Files (x86)\\Steam\\steamapps\\common\\DayZServer\\mpmissions\\dayzOffline.chernarusplus\\cfgeconomycore.xml';

console.log('Reading cfgeconomycore.xml...\n');

const content = fs.readFileSync(filePath, 'utf8');

console.log('First 200 characters:');
console.log(content.substring(0, 200));
console.log('\n---\n');

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

const parser = new XMLParser(parserOptions);
const result = parser.parse(content);

console.log('Parsed structure:');
console.log('Root keys:', Object.keys(result));
console.log('\nFull parsed object:');
console.log(JSON.stringify(result, null, 2));
