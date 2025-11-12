# XML Parser Test Suite

## Overview
Comprehensive test fixtures for validating the DayZ Economy Tool's XML parser.

## Test Files Location
All test fixtures are in: `__tests__/fixtures/`

## Quick Test

Run this to verify all test files exist:
```bash
node __tests__/test-runner.js
```

## Manual Testing

1. Start the dev server:
```bash
npm run dev
```

2. Open the Import/Export page:
```
http://localhost:3000/import-export
```

3. Import test files from `__tests__/fixtures/` one by one

4. Verify results match expected outcomes (see table below)

## Test Files Reference

### Valid Files (Should Pass ✅)

| File | Description | Expected Result |
|------|-------------|-----------------|
| `valid-events.xml` | Properly formatted events file | ✅ Pass validation |
| `valid-types.xml` | Properly formatted types file | ✅ Pass validation |

### Invalid Files (Should Fail ❌)

| File | Tests Validation | Expected Errors |
|------|------------------|-----------------|
| `invalid-empty.xml` | Empty content detection | CRITICAL: File is empty |
| `invalid-unclosed-tag.xml` | Incomplete tags | ERROR: incomplete/unclosed tags |
| `invalid-mismatched-tags.xml` | Tag mismatch detection | ERROR: Mismatched tags |
| `invalid-duplicate-tags.xml` | Duplicate event tags | ERROR: duplicate \<max\> tags |
| `invalid-random-text.xml` | Text outside tags | ERROR: invalid text content outside of XML tags |
| `invalid-unclosed-comment.xml` | Comment validation | ERROR: Mismatched comment blocks |
| `invalid-unquoted-attribute.xml` | Attribute quoting | ERROR: Malformed attribute |
| `invalid-duplicate-attributes.xml` | Duplicate attributes | ERROR: Duplicate attribute |
| `invalid-tag-name-hyphen.xml` | Tag name rules | ERROR: Invalid tag name ending with hyphen |
| `invalid-unescaped-ampersand.xml` | Special characters | WARNING: unescaped ampersand |

## Expected Output Examples

### Valid File (Pass)
```
✅ File validated successfully
File Type: events
Items: 2 events parsed
```

### Invalid File (Fail)
```
❌ Validation Failed

Errors found:
1. ERROR (Line 6): Event "TestDuplicates" has duplicate <max> tags. Each tag should appear only once per event.
2. ERROR (Line 7): Event "TestDuplicates" has duplicate <max> tags. Each tag should appear only once per event.
```

## Adding New Tests

To add a new test case:

1. Create XML file in `__tests__/fixtures/`
2. Name it descriptively: `invalid-[problem].xml` or `valid-[type].xml`
3. Add entry to `__tests__/test-runner.js`
4. Test manually via Import/Export page
5. Document in VALIDATION_DOCS.md

## Test Coverage

Current coverage:
- ✅ 15 validation rules
- ✅ 12 test fixtures
- ✅ 10 error types
- ✅ 2 valid file types (events, types)

## Notes

- Test files are small (< 2KB each) for quick testing
- Each test file focuses on one specific error type
- Valid files include realistic DayZ configurations
- All files use UTF-8 encoding

## Future Testing

Potential additions:
- Large file tests (10,000+ items)
- Performance benchmarking
- Edge case testing
- Automated Jest suite (when configured)

## Related Documentation

- See `VALIDATION_DOCS.md` for complete validation reference
- See `VALIDATION_ENHANCEMENT_SUMMARY.md` for technical details
