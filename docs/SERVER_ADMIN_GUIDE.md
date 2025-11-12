# DayZ Server Admin Quick Reference Guide

## 📁 Configuration Files Overview

### Where to Find These Files

On your DayZ server, configuration files are located in:
```
/mpmissions/dayzOffline.<mapname>/
```

For example, for Chernarus:
```
/mpmissions/dayzOffline.chernarusplus/
```

### File Locations by Type

```
📦 Server Root
├── 📂 mpmissions
│   └── 📂 dayzOffline.chernarusplus
│       ├── types.xml                      # Item spawns
│       ├── events.xml                     # Event spawns
│       ├── cfgspawnabletypes.xml          # Container loot
│       ├── cfgeconomycore.xml             # Core settings
│       ├── cfgenvironment.xml             # Animal territories
│       ├── cfgeventgroups.xml             # Event groups
│       ├── cfgeventspawns.xml             # Event positions
│       ├── cfgIgnoreList.xml              # Cleanup exclusions
│       ├── cfgplayerspawnpoints.xml       # Player spawns
│       ├── cfgrandompresets.xml           # Loot presets
│       ├── cfgweather.xml                 # Weather system
│       ├── cfgEffectArea.json             # Gas zones
│       ├── cfggameplay.json               # Gameplay mechanics
│       ├── cfgundergroundtriggers.json    # Underground areas
│       ├── 📂 env                         # Territory definitions
│       │   ├── wolf_territories.xml
│       │   ├── bear_territories.xml
│       │   ├── cattle_territories.xml
│       │   ├── red_deer_territories.xml
│       │   ├── wild_boar_territories.xml
│       │   └── ...and 8 more
│       └── 📂 db                          # Database configurations
│           ├── globals.xml                # Server variables
│           └── messages.xml               # Server messages
```

---

## 🎯 Common Tasks

### Task 1: Increase Weapon Spawns

**Files:** `types.xml`

1. Import `types.xml` into the tool
2. Filter by category: **weapons**
3. Select all weapons (or specific ones)
4. Use bulk edit to increase **nominal** by 50%
5. Export and upload back to server
6. Restart server

**Example Changes:**
- AKM: nominal 5 → 8
- M4A1: nominal 3 → 5

### Task 2: Add New Contaminated Zone

**Files:** `cfgEffectArea.json`

```json
{
  "AreaName": "MyCustomZone",
  "Type": "ContaminatedArea_Static",
  "TriggerType": "ContaminatedTrigger",
  "Data": {
    "Pos": [1234, 0, 5678],  // [X, Y, Z] coordinates
    "Radius": 80,             // Zone radius in meters
    "PosHeight": 20,          // Height above ground
    "NegHeight": 3,           // Depth below ground
    "InnerPartDist": 100,
    "OuterOffset": 20,
    "ParticleName": "graphics/particles/contaminated_area_gas_bigass"
  },
  "PlayerData": {
    "AroundPartName": "graphics/particles/contaminated_area_gas_around",
    "TinyPartName": "graphics/particles/contaminated_area_gas_around_tiny",
    "PPERequesterType": "PPERequester_ContaminatedAreaTint"
  }
}
```

### Task 3: Adjust Player Stamina

**Files:** `cfggameplay.json`

1. Import `cfggameplay.json`
2. Navigate to: `PlayerData` → `StaminaData`
3. Adjust values:
   - `staminaMax`: 100 (default) → 150 (more stamina)
   - `staminaMinCap`: 5 (default) → 10 (higher minimum)
   - `sprintStaminaModifierErc`: 1.0 → 0.8 (sprint costs less)
4. Export and replace on server

### Task 4: Change Weather Patterns

**Files:** `cfgweather.xml`

**Make it Always Sunny:**
```xml
<overcast>
  <current actual="0.1" time="0" duration="32768" />
  <limits min="0.0" max="0.2" />
</overcast>
<rain>
  <current actual="0.0" time="0" duration="32768" />
  <limits min="0.0" max="0.0" />
</rain>
```

**Make it Always Rainy:**
```xml
<overcast>
  <current actual="0.9" time="0" duration="32768" />
  <limits min="0.8" max="1.0" />
</overcast>
<rain>
  <current actual="0.8" time="0" duration="32768" />
  <limits min="0.6" max="1.0" />
</rain>
```

### Task 5: Add Vehicle Spawn Locations

**Files:** `cfgeventspawns.xml`

Find the event section for your vehicle type and add new position:
```xml
<event name="VehicleCivilianSedan">
  <pos x="1234.5" z="5678.9" a="45.0" />
  <!-- x,z = coordinates, a = rotation angle -->
</event>
```

### Task 6: Protect Items from Cleanup

**Files:** `cfgIgnoreList.xml`

Add items you don't want the server to clean up:
```xml
<ignore>
  <type name="MyCustomItem"></type>
  <type name="Bandage"></type>
  <type name="SeaChest"></type>
</ignore>
```

### Task 7: Configure Loot Presets

**Files:** `cfgrandompresets.xml`

Adjust random loot in containers:
```xml
<cargo chance="0.20" name="foodVillage">
  <item name="TunaCan" chance="0.15" />
  <item name="BakedBeansCan" chance="0.15" />
</cargo>
```

### Task 8: Adjust Zombie Counts and Cleanup Times

**Files:** `db/globals.xml`

Change server performance and gameplay variables:

**Increase zombie count:**
```xml
<var name="ZombieMaxCount" type="0" value="1500"/>
<!-- Default: 1000, Higher = more zombies -->
```

**Speed up dead body cleanup:**
```xml
<var name="CleanupLifetimeDeadInfected" type="0" value="180"/>
<var name="CleanupLifetimeDeadPlayer" type="0" value="1800"/>
<!-- Values in seconds. Default: 330 and 3600 -->
```

**Adjust loot spawn rates:**
```xml
<var name="RespawnLimit" type="0" value="30"/>
<var name="RespawnTypes" type="0" value="20"/>
<!-- Default: 20 and 12. Higher = faster loot respawn -->
```

### Task 9: Configure Server Messages

**Files:** `db/messages.xml`

Set up welcome messages and announcements:

**Welcome message:**
```xml
<message onconnect="1">
  <text>Welcome to our server, #name! Discord: example.com</text>
</message>
```

**Repeating announcement (every 30 minutes):**
```xml
<message repeat="1800" delay="900">
  <text>Server rules: No KOS in safe zones. Check /rules</text>
</message>
```

**Shutdown countdown:**
```xml
<message deadline="10" shutdown="1">
  <text>Server restart in #tmin minutes. Find shelter!</text>
</message>
```

---

## ⚙️ Configuration Best Practices

### 1. Always Backup First
Before making changes:
```bash
cp types.xml types.xml.backup
cp cfggameplay.json cfggameplay.json.backup
cp db/globals.xml db/globals.xml.backup
```

### 2. Test on Local Server
- Test major changes locally before deploying to live server
- Use the tool's validation to catch errors

### 3. Restart Server After Changes
Most config changes require server restart:
```bash
./DayZServer -config=serverDZ.cfg -port=2302
```

### 4. Monitor Server Performance
After changes, check:
- Server FPS (should stay above 20)
- Memory usage
- Player feedback
- Zombie/animal counts

### 5. Document Your Changes
Keep a changelog:
```
2024-11-12: Increased M4A1 nominal from 3 to 5
2024-11-12: Added custom gas zone at Tisy
2024-11-12: Reduced stamina drain by 20%
2024-11-12: Increased ZombieMaxCount to 1500
2024-11-12: Added welcome message with Discord link
```

---

## 🔧 Common Issues & Solutions

### Issue: Items Not Spawning

**Possible Causes:**
1. Nominal set too low
2. Min is equal to or higher than nominal
3. Restock time too long
4. Category/usage doesn't match spawn locations

**Solution:**
- Check nominal > min
- Verify restock is reasonable (3600 = 1 hour)
- Check usage flags match map locations

### Issue: Too Many Items Spawning

**Symptoms:** Server lag, items everywhere

**Solution:**
1. Reduce **nominal** values globally
2. Increase **lifetime** (items despawn faster)
3. Check **count_in_cargo** flag (0 = don't count in containers)

### Issue: Weather Not Changing

**Check:**
- `cfgweather.xml` has `enable="1"` (not "0")
- `reset="0"` (unless you want to reset weather)
- Time limits are not too long

### Issue: Contaminated Zones Not Working

**Check:**
1. `cfgEffectArea.json` syntax is valid
2. NBC clothing is available in loot
3. Coordinates are correct (use map tools)
4. Radius is reasonable (50-100m)

### Issue: Animals Not Spawning

**Check:**
1. `cfgenvironment.xml` is present
2. Territory files exist in `/env/` folder (wolf_territories.xml, etc.)
3. Animal counts are not set to 0
4. Server performance (too many animals = lag)
5. Territory zones have valid coordinates and radius

**Solution:**
- Import territory files into tool to validate structure
- Verify zone coordinates are within map boundaries
- Check `cfgenvironment.xml` references correct territory files
- Ensure herd counts are reasonable (2-8 typically)

---

## 📊 Optimal Server Settings

### Balanced PvP Server
```
- Weapon Nominal: Moderate (50-70% of default)
- Food Nominal: Low (40% of default)
- Vehicle Spawns: Medium (5-10 per type)
- Stamina: Default
- Item Lifetime: Short (3600-7200s)
```

### Survival/PvE Server
```
- Weapon Nominal: Low (30% of default)
- Food Nominal: Very Low (20% of default)
- Vehicle Spawns: Low (2-5 per type)
- Stamina: Reduced (harder to sprint)
- Item Lifetime: Long (14400-28800s)
```

### Roleplay Server
```
- Weapon Nominal: Very Low (20% of default)
- Food Nominal: Moderate (60% of default)
- Vehicle Spawns: Medium-High (10-15 per type)
- Stamina: Increased (easier movement)
- Item Lifetime: Very Long (43200s+)
```

### Deathmatch/Action Server
```
- Weapon Nominal: Very High (150-200% of default)
- Ammo Nominal: Very High (200% of default)
- Food Nominal: High (don't worry about hunger)
- Stamina: Increased
- Item Lifetime: Short (fast loot cycling)
```

---

## 🎮 Using This Tool Effectively

### Workflow for Major Changes

1. **Backup** - Download all current configs
2. **Import** - Load files into tool
3. **Analyze** - Use analytics dashboard to review current state
4. **Edit** - Make changes with visual editor or bulk operations
5. **Validate** - Tool automatically validates before export
6. **Export** - Download modified files
7. **Test** - Upload to test server first
8. **Deploy** - Upload to production server
9. **Monitor** - Check server logs and player feedback

### Quick Tips

- **Use Templates:** Apply pre-configured balance templates for different playstyles
- **Bulk Operations:** Select multiple items and adjust nominal/lifetime all at once
- **Search & Filter:** Find specific items quickly
- **Analytics:** Monitor economy balance with the dashboard
- **Validation:** Tool catches errors before they crash your server

---

## 📞 Support & Resources

### Official DayZ Resources
- [DayZ Wiki](https://dayz.fandom.com/wiki/DayZ_Wiki)
- [Bohemia Forums](https://forums.dayz.com/)
- [DayZ Modding Discord](https://discord.gg/dayzmodding)

### Community Tools
- [DayZ Editor Loader](https://github.com/Arkensor/DayZEditorLoader)
- [DayZ SA Launcher](https://dayzsalauncher.com/)
- [DZSA Launcher](https://launcher.dzsa.eu/)

### Map Coordinates
- Use [iZurvive](https://www.izurvive.com/) for finding coordinates
- In-game: Enable debug monitor to see your position

---

## 🎯 Quick Command Reference

### Server Commands
```bash
# Start server
./DayZServer -config=serverDZ.cfg -port=2302

# Stop server (Linux)
pkill DayZServer

# View logs
tail -f server_console.log

# Check running processes
ps aux | grep DayZ
```

### File Operations
```bash
# Backup configs
tar -czf configs_backup_$(date +%Y%m%d).tar.gz *.xml *.json

# Upload to server (SCP)
scp types.xml user@yourserver.com:/path/to/mpmissions/

# Download from server
scp user@yourserver.com:/path/to/types.xml ./
```

---

## ✅ Pre-Deployment Checklist

Before uploading changes to live server:

- [ ] Backup created and stored safely
- [ ] Changes tested on local server
- [ ] XML/JSON validation passed
- [ ] No syntax errors in modified files
- [ ] Changes documented
- [ ] Server restart scheduled (inform players)
- [ ] Rollback plan ready (keep old files accessible)

---

**Happy Server Managing! 🎮🛠️**

For issues or questions about this tool, check the GitHub repository or community forums.
