/**
 * Comprehensive XML Parser Validation Test Suite
 * Tests all validation rules to ensure production-grade reliability
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { parseXMLFile } from '../src/utils/xmlParser';

describe('XML Parser - Production Validation Suite', () => {
  const fixturesDir = join(__dirname, 'fixtures');

  const loadFixture = (filename: string): string => {
    return readFileSync(join(fixturesDir, filename), 'utf-8');
  };

  describe('Valid Files - Should Pass', () => {
    test('valid-events.xml should parse successfully', () => {
      const content = loadFixture('valid-events.xml');
      const result = parseXMLFile(content);
      
      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.fileType).toBe('events');
    });

    test('valid-types.xml should parse successfully', () => {
      const content = loadFixture('valid-types.xml');
      const result = parseXMLFile(content);
      
      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.fileType).toBe('types');
    });
  });

  describe('VALIDATION 1: Empty Files', () => {
    test('should reject empty file', () => {
      const content = loadFixture('invalid-empty.xml');
      const result = parseXMLFile(content);
      
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.includes('CRITICAL') && e.includes('empty'))).toBe(true);
    });
  });

  describe('VALIDATION 3: Incomplete Tags', () => {
    test('should detect unclosed tags', () => {
      const content = loadFixture('invalid-unclosed-tag.xml');
      const result = parseXMLFile(content);
      
      expect(result.success).toBe(false);
      expect(result.errors.some(e => e.includes('incomplete') || e.includes('unclosed'))).toBe(true);
    });
  });

  describe('VALIDATION 4: Mismatched Tags', () => {
    test('should detect mismatched opening and closing tags', () => {
      const content = loadFixture('invalid-mismatched-tags.xml');
      const result = parseXMLFile(content);
      
      expect(result.success).toBe(false);
      expect(result.errors.some(e => e.includes('Mismatched tags') || e.includes('expected'))).toBe(true);
    });
  });

  describe('VALIDATION 5: Invalid Tag Names', () => {
    test('should detect tag names ending with hyphen', () => {
      const content = loadFixture('invalid-tag-name-hyphen.xml');
      const result = parseXMLFile(content);
      
      expect(result.success).toBe(false);
      expect(result.errors.some(e => e.includes('Invalid tag name') || e.includes('hyphen'))).toBe(true);
    });
  });

  describe('VALIDATION 7: Unclosed Comments', () => {
    test('should detect unclosed comment blocks', () => {
      const content = loadFixture('invalid-unclosed-comment.xml');
      const result = parseXMLFile(content);
      
      expect(result.success).toBe(false);
      expect(result.errors.some(e => e.includes('comment'))).toBe(true);
    });
  });

  describe('VALIDATION 9: Random Text Outside Tags', () => {
    test('should detect random text content outside of tags', () => {
      const content = loadFixture('invalid-random-text.xml');
      const result = parseXMLFile(content);
      
      expect(result.success).toBe(false);
      expect(result.errors.some(e => e.includes('invalid text content') || e.includes('outside'))).toBe(true);
      expect(result.errors.some(e => e.includes('efvnervnoeboem') || e.includes('garbage'))).toBe(true);
    });
  });

  describe('VALIDATION 10: Unescaped Special Characters', () => {
    test('should warn about unescaped ampersands', () => {
      const content = loadFixture('invalid-unescaped-ampersand.xml');
      const result = parseXMLFile(content);
      
      expect(result.success).toBe(false);
      expect(result.errors.some(e => e.includes('ampersand') || e.includes('&amp;'))).toBe(true);
    });
  });

  describe('VALIDATION 11: Malformed Attributes', () => {
    test('should detect unquoted attribute values', () => {
      const content = loadFixture('invalid-unquoted-attribute.xml');
      const result = parseXMLFile(content);
      
      expect(result.success).toBe(false);
      expect(result.errors.some(e => e.includes('Malformed attribute') || e.includes('quotes'))).toBe(true);
    });
  });

  describe('VALIDATION 12: Duplicate Attributes', () => {
    test('should detect duplicate attributes in same tag', () => {
      const content = loadFixture('invalid-duplicate-attributes.xml');
      const result = parseXMLFile(content);
      
      expect(result.success).toBe(false);
      expect(result.errors.some(e => e.includes('Duplicate attribute'))).toBe(true);
    });
  });

  describe('VALIDATION 13: Duplicate Sibling Tags (Events)', () => {
    test('should detect duplicate tags in events.xml', () => {
      const content = loadFixture('invalid-duplicate-tags.xml');
      const result = parseXMLFile(content);
      
      expect(result.success).toBe(false);
      expect(result.errors.some(e => e.includes('duplicate') && e.includes('<max>'))).toBe(true);
      expect(result.errors.some(e => e.includes('line'))).toBe(true);
    });
  });

  describe('Error Message Quality', () => {
    test('error messages should include line numbers', () => {
      const content = loadFixture('invalid-duplicate-tags.xml');
      const result = parseXMLFile(content);
      
      const errorsWithLineNumbers = result.errors.filter(e => /line\s+\d+/i.test(e));
      expect(errorsWithLineNumbers.length).toBeGreaterThan(0);
    });

    test('error messages should include context', () => {
      const content = loadFixture('invalid-duplicate-tags.xml');
      const result = parseXMLFile(content);
      
      expect(result.errors.some(e => e.includes('TestDuplicates'))).toBe(true);
    });

    test('error messages should indicate severity', () => {
      const content = loadFixture('invalid-mismatched-tags.xml');
      const result = parseXMLFile(content);
      
      const hasErrorLevel = result.errors.some(e => 
        e.includes('ERROR') || e.includes('CRITICAL') || e.includes('WARNING')
      );
      expect(hasErrorLevel).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    test('should handle files with only whitespace', () => {
      const result = parseXMLFile('   \n\t\n   ');
      
      expect(result.success).toBe(false);
      expect(result.errors.some(e => e.includes('empty'))).toBe(true);
    });

    test('should handle very large valid files', () => {
      // Create a large but valid XML file
      let largeXML = '<?xml version="1.0" encoding="UTF-8"?>\n<types>\n';
      for (let i = 0; i < 1000; i++) {
        largeXML += `  <type name="Item${i}">
    <nominal>${i}</nominal>
    <min>${i - 5}</min>
    <lifetime>3600</lifetime>
  </type>\n`;
      }
      largeXML += '</types>';
      
      const result = parseXMLFile(largeXML);
      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should handle nested tags properly', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<events>
  <event name="Test">
    <children>
      <child max="5" min="1" type="TestType"/>
      <child max="10" min="5" type="TestType2"/>
    </children>
  </event>
</events>`;
      
      const result = parseXMLFile(xml);
      expect(result.success).toBe(true);
    });

    test('should handle self-closing tags', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<types>
  <type name="Test"/>
  <type name="Test2" />
</types>`;
      
      const result = parseXMLFile(xml);
      expect(result.success).toBe(true);
    });

    test('should handle CDATA sections', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<types>
  <type name="Test">
    <description><![CDATA[This is a test & it has special chars <> ]]></description>
    <nominal>10</nominal>
  </type>
</types>`;
      
      const result = parseXMLFile(xml);
      expect(result.success).toBe(true);
    });
  });

  describe('Performance', () => {
    test('should validate large files in reasonable time', () => {
      const content = loadFixture('valid-types.xml');
      const start = Date.now();
      
      parseXMLFile(content);
      
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(100); // Should complete within 100ms
    });
  });
});
