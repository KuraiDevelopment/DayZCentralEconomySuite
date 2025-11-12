# Database Files (db/ folder) - Complete Reference

## Overview

The `db/` folder contains critical server configuration files that control core server behavior, cleanup times, spawn rates, and player communication. These files are essential for server performance tuning and player experience.

**Location:** `/mpmissions/dayzOffline.<mapname>/db/`

## Supported Files

### ✅ globals.xml - Server Variables
### ✅ messages.xml - Server Messages

---

## globals.xml - Complete Variable Reference

### Purpose
Controls fundamental server behavior including cleanup times, spawn rates, zombie counts, loot mechanics, and performance settings.

### File Structure
```xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<variables>
    <var name="VariableName" type="0" value="100"/>
    <!-- type: 0 = integer, 1 = float -->
</variables>
```

### All 30 Global Variables

#### Animal System
| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `AnimalMaxCount` | 0 (int) | 200 | Maximum number of animals alive in the world |

#### Cleanup Timers (All in Seconds)
| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `CleanupLifetimeDeadAnimal` | 0 (int) | 1200 | Dead animal cleanup (20 minutes) |
| `CleanupLifetimeDeadInfected` | 0 (int) | 330 | Dead zombie cleanup (5.5 minutes) |
| `CleanupLifetimeDeadPlayer` | 0 (int) | 3600 | Dead player body cleanup (1 hour) |
| `CleanupLifetimeDefault` | 0 (int) | 45 | Default item cleanup time |
| `CleanupLifetimeLimit` | 0 (int) | 50 | Maximum item lifetime limit |
| `CleanupLifetimeRuined` | 0 (int) | 330 | Ruined item cleanup (5.5 minutes) |

#### Flag System (Seconds)
| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `FlagRefreshFrequency` | 0 (int) | 432000 | Flag refresh rate (5 days) |
| `FlagRefreshMaxDuration` | 0 (int) | 3456000 | Max flag lifetime (40 days) |

#### Loot System
| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `FoodDecay` | 0 (int) | 0 | Food decay rate (0 = disabled) |
| `LootProxyPlacement` | 0 (int) | 0 | Loot container placement mode |
| `LootSpawnAvoidance` | 0 (int) | 1 | Avoid spawning near players (1 = yes) |
| `LootDamageMin` | 1 (float) | 0.0 | Minimum loot spawn damage (0-1) |
| `LootDamageMax` | 1 (float) | 0.4 | Maximum loot spawn damage (0-1) |

#### Spawn System
| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `InitialSpawn` | 0 (int) | 100 | Initial spawn percentage at server start |
| `RestartSpawn` | 0 (int) | 100 | Respawn percentage rate |
| `RespawnAttempt` | 0 (int) | 2 | Respawn attempts per cycle |
| `RespawnLimit` | 0 (int) | 20 | Maximum respawns per cycle |
| `RespawnTypes` | 0 (int) | 12 | Number of item types respawned per cycle |

#### Server Performance
| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `IdleModeCountdown` | 0 (int) | 60 | Idle mode activation timer (seconds) |
| `IdleModeStartup` | 0 (int) | 1 | Startup idle time (seconds) |
| `TimeHopping` | 0 (int) | 2700 | Server hopping timeout (45 minutes) |
| `TimeLogin` | 0 (int) | 15 | Login timeout (seconds) |
| `TimeLogout` | 0 (int) | 15 | Logout timeout (seconds) |
| `TimePenalty` | 0 (int) | 840 | Death penalty timer (14 minutes) |

#### World Systems
| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `WorldWetTempUpdate` | 0 (int) | 1 | Wetness/temperature update rate |
| `ZombieMaxCount` | 0 (int) | 1000 | Maximum zombies alive in world |
| `ZoneSpawnDist` | 0 (int) | 0 | Zone spawn distance |

### Configuration Presets

#### High-Population Server (60+ players)
```xml
<var name="ZombieMaxCount" type="0" value="1500"/>
<var name="AnimalMaxCount" type="0" value="300"/>
<var name="RespawnLimit" type="0" value="30"/>
<var name="RespawnTypes" type="0" value="20"/>
<var name="InitialSpawn" type="0" value="120"/>
```

#### Performance-Optimized (Low-End Hardware)
```xml
<var name="ZombieMaxCount" type="0" value="600"/>
<var name="AnimalMaxCount" type="0" value="100"/>
<var name="CleanupLifetimeDefault" type="0" value="30"/>
<var name="CleanupLifetimeRuined" type="0" value="180"/>
<var name="RespawnLimit" type="0" value="15"/>
```

#### Fast-Paced PvP Server
```xml
<var name="RespawnLimit" type="0" value="40"/>
<var name="RespawnTypes" type="0" value="25"/>
<var name="CleanupLifetimeDeadPlayer" type="0" value="1800"/>
<var name="CleanupLifetimeDefault" type="0" value="30"/>
```

#### RP/PvE Server (Immersive)
```xml
<var name="ZombieMaxCount" type="0" value="1200"/>
<var name="AnimalMaxCount" type="0" value="250"/>
<var name="CleanupLifetimeDeadPlayer" type="0" value="7200"/>
<var name="FoodDecay" type="0" value="1"/>
```

### Impact Analysis

#### Performance Impact
| Variable | Low Value Impact | High Value Impact |
|----------|------------------|-------------------|
| `ZombieMaxCount` | Less server load, easier gameplay | Higher server load, harder gameplay |
| `AnimalMaxCount` | Less server load, less hunting | More server load, more hunting |
| `RespawnLimit` | Slower loot respawn | Faster loot respawn, higher load |
| `CleanupLifetimeDefault` | Less clutter, more respawns | More clutter, fewer respawns |

#### Gameplay Impact
| Variable | Effect on Gameplay |
|----------|-------------------|
| `ZombieMaxCount` | Higher = more zombies, harder survival |
| `CleanupLifetimeDeadPlayer` | Higher = longer body persistence, easier recovery |
| `LootDamageMin/Max` | Controls loot spawn condition quality |
| `TimeHopping` | Prevents server hopping abuse |

---

## messages.xml - Complete Message Reference

### Purpose
Configure server messages, announcements, and shutdown countdowns to communicate with players.

### File Structure
```xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<messages>
    <message onconnect="1">
        <text>Message content</text>
    </message>
</messages>
```

### Message Attributes

| Attribute | Type | Values | Description |
|-----------|------|--------|-------------|
| `onconnect` | Flag | `1` or omit | Display when player connects |
| `repeat` | Seconds | Any integer | Repeat message every X seconds |
| `delay` | Seconds | Any integer | Wait X seconds before first display |
| `deadline` | Minutes | Any integer | Minutes before shutdown |
| `shutdown` | Flag | `1` or omit | Mark as shutdown warning |

### Message Variables

| Variable | Description | Example Output |
|----------|-------------|----------------|
| `#name` | Player's character name | "John Doe" |
| `#tmin` | Time remaining in minutes | "10 minutes" |

### Message Types

#### 1. Connection Messages
Displayed once when player connects:
```xml
<message onconnect="1">
    <text>Welcome to the server, #name!</text>
</message>
```

#### 2. Repeating Announcements
Displayed at regular intervals:
```xml
<!-- Every 30 minutes, starting after 15 minutes -->
<message repeat="1800" delay="900">
    <text>Server rules: No KOS in safe zones</text>
</message>
```

#### 3. Shutdown Countdowns
Displayed before server restarts:
```xml
<message deadline="10" shutdown="1">
    <text>Server restart in #tmin minutes</text>
</message>
```

### Complete Message Examples

#### Welcome Package
```xml
<messages>
    <!-- Welcome with rules -->
    <message onconnect="1">
        <text>Welcome #name! Read /rules. Discord: discord.gg/yourserver</text>
    </message>
</messages>
```

#### Announcement System
```xml
<messages>
    <!-- Rules reminder every 30 minutes -->
    <message repeat="1800" delay="900">
        <text>Server rules: No combat logging, no glitching. Type /help for commands</text>
    </message>
    
    <!-- Event announcement every hour -->
    <message repeat="3600" delay="1800">
        <text>Join weekend events! Check Discord for details and rewards</text>
    </message>
    
    <!-- Donation reminder every 2 hours -->
    <message repeat="7200" delay="3600">
        <text>Support the server at patreon.com/yourserver - Get VIP perks!</text>
    </message>
</messages>
```

#### Shutdown Countdown System
```xml
<messages>
    <!-- 30 minutes warning -->
    <message deadline="30" shutdown="1">
        <text>Scheduled server restart in #tmin minutes</text>
    </message>
    
    <!-- 15 minutes warning -->
    <message deadline="15" shutdown="1">
        <text>Server restart in #tmin minutes - Complete your tasks!</text>
    </message>
    
    <!-- 10 minutes warning -->
    <message deadline="10" shutdown="1">
        <text>Server restart in #tmin minutes - Find shelter!</text>
    </message>
    
    <!-- 5 minutes warning -->
    <message deadline="5" shutdown="1">
        <text>RESTART IN #tmin MINUTES - Get to safety!</text>
    </message>
    
    <!-- 1 minute warning -->
    <message deadline="1" shutdown="1">
        <text>RESTARTING IN #tmin MINUTE - LOGOUT NOW!</text>
    </message>
</messages>
```

#### RP Server Messages
```xml
<messages>
    <!-- Immersive welcome -->
    <message onconnect="1">
        <text>Welcome to Chernarus, #name. Survive. Adapt. Overcome.</text>
    </message>
    
    <!-- RP guidelines -->
    <message repeat="2700" delay="1350">
        <text>Stay in character. Use voice for RP. Read /lore for backstory</text>
    </message>
    
    <!-- Event notification -->
    <message repeat="5400" delay="2700">
        <text>Trader hours: 12:00-18:00 game time at Green Mountain</text>
    </message>
</messages>
```

#### PvP Server Messages
```xml
<messages>
    <!-- Combat welcome -->
    <message onconnect="1">
        <text>Welcome #name! Full PvP. KOS allowed. No rules. Good luck!</text>
    </message>
    
    <!-- Leaderboard -->
    <message repeat="1800" delay="900">
        <text>Top killer this week: PlayerName. Type /stats to see rankings</text>
    </message>
    
    <!-- PvP zones -->
    <message repeat="3600" delay="1800">
        <text>High-value loot at NWAF, Tisy, and Kamensk. Fight for it!</text>
    </message>
</messages>
```

### Time Conversion Reference

#### Repeat/Delay Values (Seconds)
```
300   = 5 minutes
600   = 10 minutes
900   = 15 minutes
1800  = 30 minutes
2700  = 45 minutes
3600  = 1 hour
7200  = 2 hours
10800 = 3 hours
14400 = 4 hours
```

#### Deadline Values (Minutes)
```
1  = 1 minute
5  = 5 minutes
10 = 10 minutes
15 = 15 minutes
30 = 30 minutes
60 = 1 hour
```

### Best Practices

#### Message Design
1. **Keep messages concise** - Players see them mid-gameplay
2. **Use clear language** - No ambiguous instructions
3. **Brand consistently** - Include Discord/website in welcome
4. **Test timing** - Ensure messages don't spam

#### Shutdown Warnings
1. **Use progressive urgency** - Calm → Alert → Urgent
2. **Give adequate warning** - Start at least 30 minutes before
3. **Include action items** - "Find shelter", "Complete tasks"
4. **Use visual cues** - CAPS for urgent warnings

#### Announcement Scheduling
1. **Stagger messages** - Use delay to avoid simultaneous display
2. **Consider player activity** - More messages during peak hours
3. **Rotate content** - Don't repeat same message too often
4. **Test intervals** - 30 minutes is generally good for most messages

---

## Validation and Testing

### Validation in Tool
1. Import `globals.xml` or `messages.xml` via Import/Export Manager
2. Tool automatically detects file type
3. Validates XML structure
4. Reports variable/message count
5. Displays any errors with line numbers

### Testing Changes

#### Testing globals.xml
```bash
# Backup original
cp db/globals.xml db/globals.xml.backup

# Apply changes
# Start server with test player load
# Monitor server performance:
# - Server FPS (should stay > 20)
# - Memory usage
# - Zombie/animal counts
# - Loot spawn rates

# Rollback if issues:
cp db/globals.xml.backup db/globals.xml
```

#### Testing messages.xml
```bash
# Backup original
cp db/messages.xml db/messages.xml.backup

# Apply changes
# Connect as test player
# Verify messages display correctly
# Check timing with /time command
# Test variables (#name, #tmin)

# Test shutdown sequence:
# - Initiate restart
# - Verify countdown messages appear at correct times
# - Confirm variable substitution works
```

---

## Common Issues and Solutions

### globals.xml Issues

#### Issue: Server won't start after editing globals.xml
**Cause:** Invalid XML syntax or wrong variable type  
**Solution:** 
1. Check XML is well-formed (matching tags, proper encoding)
2. Verify all type attributes are "0" or "1"
3. Ensure all value attributes are numeric
4. Restore from backup if needed

#### Issue: Changes not taking effect
**Cause:** Server not restarted or file not in correct location  
**Solution:**
1. Fully restart server (not just refresh)
2. Verify file is in `/mpmissions/dayzOffline.<mapname>/db/`
3. Check server logs for parsing errors

#### Issue: Server performance degraded
**Cause:** Values set too high (ZombieMaxCount, RespawnLimit)  
**Solution:**
1. Reduce ZombieMaxCount incrementally (start at 800)
2. Lower RespawnLimit/RespawnTypes
3. Increase cleanup times to reduce entity count

### messages.xml Issues

#### Issue: Messages not displaying
**Cause:** Wrong attributes or timing issues  
**Solution:**
1. Check `onconnect` is exactly "1" (not "true")
2. Verify `repeat` and `delay` are in seconds (not minutes)
3. Ensure `deadline` is in minutes (not seconds)
4. Check XML syntax (closing tags, proper nesting)

#### Issue: Variables not substituting (#name shows literally)
**Cause:** Wrong variable syntax  
**Solution:**
1. Use `#name` not `{name}` or `$name`
2. Use `#tmin` not `#time` for minutes
3. Variables only work in message text, not attributes

#### Issue: Shutdown messages appearing at wrong times
**Cause:** Deadline values misunderstood  
**Solution:**
1. Remember deadline is minutes BEFORE shutdown
2. deadline="10" = 10 minutes before, not at 10:00
3. Test with shorter restart intervals first

---

## Performance Optimization Guide

### Low-End Server (< 16GB RAM)
```xml
<!-- globals.xml settings -->
<var name="ZombieMaxCount" type="0" value="600"/>
<var name="AnimalMaxCount" type="0" value="100"/>
<var name="RespawnLimit" type="0" value="15"/>
<var name="CleanupLifetimeDefault" type="0" value="30"/>
<var name="CleanupLifetimeDeadInfected" type="0" value="180"/>
```

### Mid-Range Server (16-32GB RAM)
```xml
<!-- globals.xml settings -->
<var name="ZombieMaxCount" type="0" value="1000"/>
<var name="AnimalMaxCount" type="0" value="200"/>
<var name="RespawnLimit" type="0" value="20"/>
<var name="CleanupLifetimeDefault" type="0" value="45"/>
```

### High-End Server (32GB+ RAM)
```xml
<!-- globals.xml settings -->
<var name="ZombieMaxCount" type="0" value="1500"/>
<var name="AnimalMaxCount" type="0" value="300"/>
<var name="RespawnLimit" type="0" value="30"/>
<var name="RespawnTypes" type="0" value="20"/>
```

---

## Integration with Other Files

### globals.xml Works With:
- **types.xml**: RespawnLimit/RespawnTypes control item spawn rates defined in types.xml
- **cfgeconomycore.xml**: CleanupLifetime values interact with economy settings
- **cfgenvironment.xml**: AnimalMaxCount affects territory spawn rates

### messages.xml Works With:
- **Server scheduler**: Shutdown messages triggered by restart scripts
- **Player events**: onconnect messages require player authentication system
- **Time system**: Message timing syncs with server game time

---

## Version History

### Version 1.2.0 (November 2025)
- ✅ Initial support for globals.xml (30 variables)
- ✅ Initial support for messages.xml (all message types)
- ✅ Variable count reporting
- ✅ Message count reporting
- ✅ Complete documentation with examples

---

## Additional Resources

- **SUPPORTED_FILES.md** - All 37 supported file types
- **SERVER_ADMIN_GUIDE.md** - Quick reference for common admin tasks
- **CONFIG_EXAMPLES.md** - Real-world configuration examples
- **DayZ Official Wiki** - https://dayz.com/files (official file references)
- **Community Forums** - Server admin discussions and tips

---

**Database Files Complete** 🎮

Both `globals.xml` and `messages.xml` are fully supported with comprehensive validation, documentation, and real-world examples for all server types.
