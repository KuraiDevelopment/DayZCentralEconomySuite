/**
 * Manual XML Validation Test Script
 * Run with: npx ts-node __tests__/manual-validation-test.ts
 * 
 * This script tests all validation rules without requiring a full test framework
 */

import { readFileSync } from 'fs';
import { join } from 'path';

// We'll need to create a simple test version that imports the function directly
// For now, let's extract the validateXMLStructure logic inline for testing

// Inline copy of XML validation for testing purposes
import { XMLParser } from 'fast-xml-parser';

function validateXMLStructure(xmlContent: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const lines = xmlContent.split('\n');

const fixturesDir = join(__dirname, 'fixtures');

interface TestResult {
  name: string;
  passed: boolean;
  expectedToFail: boolean;
  errors: string[];
  message: string;
}

const results: TestResult[] = [];

function runTest(
  name: string,
  filename: string,
  expectedToFail: boolean,
  expectedErrorPatterns?: string[]
): void {
  console.log(`\n🧪 Testing: ${name}`);
  console.log(`   File: ${filename}`);
  console.log(`   Expected: ${expectedToFail ? '❌ FAIL' : '✅ PASS'}`);
  
  try {
    const content = readFileSync(join(fixturesDir, filename), 'utf-8');
    const result = parseXMLFile(content);
    
    const actualFailed = !result.success;
    const testPassed = actualFailed === expectedToFail;
    
    let message = '';
    if (testPassed) {
      message = `✅ CORRECT - ${actualFailed ? 'Failed as expected' : 'Passed as expected'}`;
      if (actualFailed && expectedErrorPatterns) {
        const matchedPatterns = expectedErrorPatterns.filter(pattern =>
          result.errors?.some(e => e.toLowerCase().includes(pattern.toLowerCase()))
        );
        if (matchedPatterns.length === expectedErrorPatterns.length) {
          message += ` (All expected error patterns found)`;
        } else {
          message += ` (Missing some expected error patterns)`;
        }
      }
    } else {
      message = `❌ WRONG - ${actualFailed ? 'Failed but should pass' : 'Passed but should fail'}`;
    }
    
    console.log(`   Result: ${message}`);
    
    if (result.errors && result.errors.length > 0) {
      console.log(`   Errors found (${result.errors.length}):`);
      result.errors.forEach((error, i) => {
        console.log(`     ${i + 1}. ${error}`);
      });
    }
    
    results.push({
      name,
      passed: testPassed,
      expectedToFail,
      errors: result.errors || [],
      message,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.log(`   ⚠️  Exception: ${errorMsg}`);
    results.push({
      name,
      passed: false,
      expectedToFail,
      errors: [errorMsg],
      message: `Exception thrown: ${errorMsg}`,
    });
  }
}

console.log('═══════════════════════════════════════════════════════════');
console.log('  DayZ Economy Tool - XML Parser Validation Test Suite');
console.log('  Production-Grade Validation Testing');
console.log('═══════════════════════════════════════════════════════════');

// ============================================================================
// TESTS THAT SHOULD PASS (Valid XML)
// ============================================================================
console.log('\n\n📋 VALID FILES (Should Pass All Validation)\n');

runTest(
  'Valid Events XML',
  'valid-events.xml',
  false
);

runTest(
  'Valid Types XML',
  'valid-types.xml',
  false
);

// ============================================================================
// TESTS THAT SHOULD FAIL (Invalid XML)
// ============================================================================
console.log('\n\n📋 INVALID FILES (Should Fail Validation)\n');

runTest(
  'Empty File',
  'invalid-empty.xml',
  true,
  ['critical', 'empty']
);

runTest(
  'Unclosed Tag',
  'invalid-unclosed-tag.xml',
  true,
  ['incomplete', 'unclosed']
);

runTest(
  'Mismatched Tags',
  'invalid-mismatched-tags.xml',
  true,
  ['mismatched', 'expected']
);

runTest(
  'Duplicate Tags in Events',
  'invalid-duplicate-tags.xml',
  true,
  ['duplicate', '<max>']
);

runTest(
  'Random Text Outside Tags',
  'invalid-random-text.xml',
  true,
  ['invalid text', 'outside', 'efvnervnoeboem']
);

runTest(
  'Unclosed Comment Block',
  'invalid-unclosed-comment.xml',
  true,
  ['comment']
);

runTest(
  'Unquoted Attribute',
  'invalid-unquoted-attribute.xml',
  true,
  ['malformed attribute', 'quotes']
);

runTest(
  'Duplicate Attributes',
  'invalid-duplicate-attributes.xml',
  true,
  ['duplicate attribute']
);

runTest(
  'Tag Name Ending with Hyphen',
  'invalid-tag-name-hyphen.xml',
  true,
  ['invalid tag name', 'hyphen']
);

runTest(
  'Unescaped Ampersand',
  'invalid-unescaped-ampersand.xml',
  true,
  ['ampersand']
);

// ============================================================================
// SUMMARY
// ============================================================================
console.log('\n\n═══════════════════════════════════════════════════════════');
console.log('  TEST SUMMARY');
console.log('═══════════════════════════════════════════════════════════\n');

const passedTests = results.filter(r => r.passed).length;
const failedTests = results.filter(r => !r.passed).length;
const totalTests = results.length;

console.log(`Total Tests:  ${totalTests}`);
console.log(`✅ Passed:    ${passedTests} (${((passedTests / totalTests) * 100).toFixed(1)}%)`);
console.log(`❌ Failed:    ${failedTests} (${((failedTests / totalTests) * 100).toFixed(1)}%)`);

if (failedTests > 0) {
  console.log('\n\n❌ FAILED TESTS:\n');
  results.filter(r => !r.passed).forEach(result => {
    console.log(`  • ${result.name}`);
    console.log(`    ${result.message}`);
  });
}

console.log('\n═══════════════════════════════════════════════════════════');

if (failedTests === 0) {
  console.log('\n🎉 ALL TESTS PASSED! XML validation is production-ready.\n');
  process.exit(0);
} else {
  console.log('\n⚠️  SOME TESTS FAILED. Review validation logic.\n');
  process.exit(1);
}
