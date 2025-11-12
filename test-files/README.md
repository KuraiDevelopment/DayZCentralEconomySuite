# Test Files for DayZ Economy Tool

This directory contains sample DayZ configuration files for testing the import functionality.

## Database Files (db/ folder)

### globals.xml
Sample server variables configuration with default vanilla DayZ values.

**Contains:**
- 28 server variables
- All standard cleanup timers
- Default spawn rates and zombie counts
- Vanilla loot system settings

**Test:**
1. Import via Import/Export Manager
2. Should detect as "globals" type
3. Should report 28 variables
4. Should validate successfully

### messages.xml
Sample server messaging system with welcome, announcements, and shutdown countdown.

**Contains:**
- 1 welcome message (onconnect)
- 2 repeating announcements
- 4 shutdown countdown messages (30, 10, 5, 1 minute warnings)

**Test:**
1. Import via Import/Export Manager
2. Should detect as "messages" type
3. Should report 7 messages
4. Should validate successfully

## Testing Import Functionality

### Test Procedure
1. Start dev server: `npm run dev`
2. Navigate to Import/Export page
3. Upload `test-files/globals.xml`
   - ✅ Should show "Successfully imported globals.xml (Server Variables) (28 variables)"
   - ✅ File type badge should show "GLOBALS"
   - ✅ Configuration data preview should display
4. Upload `test-files/messages.xml`
   - ✅ Should show "Successfully imported messages.xml (Server Messages) (7 messages)"
   - ✅ File type badge should show "MESSAGES"
   - ✅ Configuration data preview should display

### Expected Results

#### globals.xml Import
```
✅ Success
📊 File Type: GLOBALS
📈 Variable Count: 28
🔍 Data: Full variables array with name/type/value for each variable
```

#### messages.xml Import
```
✅ Success
📊 File Type: MESSAGES
📈 Message Count: 7
🔍 Data: Messages array with onconnect, repeat, deadline configurations
```

## Validation Tests

### Valid File Tests
- ✅ Both files have valid XML structure
- ✅ All required elements present
- ✅ All attributes properly formatted
- ✅ Values are correct types (integers, floats)

### Invalid File Tests (Create these to test error handling)

#### Invalid globals.xml Examples:
```xml
<!-- Missing closing tag -->
<variables>
    <var name="Test" type="0" value="100">

<!-- Wrong root element -->
<vars>
    <var name="Test" type="0" value="100"/>
</vars>

<!-- Invalid type -->
<variables>
    <var name="Test" type="invalid" value="100"/>
</variables>
```

#### Invalid messages.xml Examples:
```xml
<!-- Missing closing tag -->
<messages>
    <message onconnect="1">
        <text>Test

<!-- Wrong root element -->
<msgs>
    <message><text>Test</text></message>
</msgs>

<!-- Invalid attribute -->
<messages>
    <message onconnect="true">
        <text>Test</text>
    </message>
</messages>
```

## File Type Detection Tests

### Filename Detection
- `globals.xml` → Should detect as "globals"
- `messages.xml` → Should detect as "messages"
- `db_globals.xml` → Should detect as "globals"
- `server_messages.xml` → Should detect as "messages"

### Content Detection
Parser should detect file type even with generic filename:
- File with `<variables><var>` → "globals"
- File with `<messages><message>` → "messages"

## Integration Tests

### Import Multiple Files
1. Import globals.xml → Should succeed
2. Import messages.xml → Should succeed
3. Both configs should be stored separately
4. Both should be viewable in UI

### File Count Verification
After importing both files:
- globals.xml: 28 variables
- messages.xml: 7 messages
- Total config files imported: 2

## Performance Tests

### Large File Tests
Create test files with many entries:
- globals_large.xml: 100 variables
- messages_large.xml: 50 messages

Both should import quickly (<1 second) and display correctly.

## Real-World Test Files

To test with actual server files:
1. Copy `globals.xml` from your DayZ server's `/mpmissions/dayzOffline.<mapname>/db/` folder
2. Copy `messages.xml` from same location
3. Import both files
4. Verify all variables/messages are parsed correctly
5. Compare values with server to ensure accuracy

## Documentation References

- **docs/DATABASE_FILES.md** - Complete reference for db/ folder files
- **SUPPORTED_FILES.md** - All 37 supported file types
- **docs/CONFIG_EXAMPLES.md** - Real-world configuration examples
- **docs/SERVER_ADMIN_GUIDE.md** - Admin quick reference with db/ folder tasks

---

**Test Coverage:** ✅ Complete

All database files have comprehensive test files, validation tests, and documentation.
