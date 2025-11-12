# DayZ Server Configuration Files - Complete Support

This tool now supports **37 DayZ server configuration files** for comprehensive server management.

## Core Economy Files

### ✅ types.xml (Item Spawn Configuration)
**Purpose:** Defines all items that can spawn in the world with their spawn rates, lifetimes, and distribution.

**Fully Supported Features:**
- Visual editor with category filtering
- Bulk operations (adjust nominal, lifetime, restock)
- Item search and sorting
- Analytics dashboard
- Template system
- XML validation and import/export

### ✅ events.xml (Event Spawns)
**Purpose:** Configuration for dynamic events like helicopter crashes, police cars, trains, etc.

**Supported:**
- Import and validation
- Data structure parsing
- Export functionality

### ✅ cfgspawnabletypes.xml (Container Loot)
**Purpose:** Defines what items spawn in containers (backpacks, vehicles, etc.) and with what attachments.

**Supported:**
- Import and validation
- Attachment preset parsing
- Cargo preset parsing

### ✅ cfgeconomycore.xml (Core Economy Settings)
**Purpose:** Core economy system configuration including class definitions and default values.

**Supported:**
- Import and validation
- Classes section parsing
- Defaults section parsing

---

## Map Group System (Dynamic Events)

### ✅ mapgroupproto.xml (Loot Spawn Point Definitions)
**Purpose:** Defines loot spawn points in buildings and structures across the map. Controls what can spawn in each container type within buildings.

**Contains:**
- Building prototypes with default settings
- Container groups (shelves, tables, fridges, etc.)
- Spawn points with position, range, height, and flags
- Loot categories and tag assignments

**Structure:**
```xml
<prototype>
  <defaults>
    <usage name="Military" />
    <value name="Tier3" />
  </defaults>
  <group name="Land_Mil_Barracks">
    <container name="lootShelves" lootmax="3">
      <point pos="1.2 0.5 3.4" range="0.2" height="0.5" flags="64" />
      <category name="weapons" />
      <tag name="shelves" />
    </container>
  </group>
</prototype>
```

**Parameters:**
- **pos**: 3D coordinates within building
- **range**: Spawn radius from point
- **height**: Vertical spawn range
- **flags**: Spawn behavior flags
- **lootmax**: Maximum items per container

**Supported:**
- Full XML parsing (18,000+ lines)
- Group and container extraction
- Spawn point coordinates
- Category and tag parsing
- Group count reporting

**Usage:**
Critical for controlling dynamic event spawns (helicopter crashes, police cars, etc.). Works with mapgrouppos.xml to place groups in the world.

### ✅ mapgrouppos.xml (World Position Mapping)
**Purpose:** Maps loot groups to world coordinates, defining where dynamic event spawns appear on the map.

**Contains:**
- 11,684 world positions for loot groups
- Group references from mapgroupproto.xml
- 3D coordinates, rotation (roll-pitch-yaw), and azimuth

**Structure:**
```xml
<map>
  <group name="Land_Mil_Barracks" pos="1234.5 67.8 9012.3" rpy="0 -0 0" a="145.0" />
  <group name="Land_Wreck_Heli_Crashed" pos="5678.9 120.0 3456.7" rpy="15 5 -10" a="270.0" />
</map>
```

**Parameters:**
- **name**: Reference to mapgroupproto.xml group
- **pos**: X Y Z world coordinates
- **rpy**: Roll, pitch, yaw rotation (degrees)
- **a**: Azimuth/heading (degrees)

**Supported:**
- Full XML parsing (11,684 positions)
- Position array extraction
- Rotation and azimuth data
- Position count reporting

**Usage:**
Places loot groups from mapgroupproto.xml into the world. Essential for dynamic events and random loot spawns.

### ✅ mapgroupcluster.xml (Regional Clustering)
**Purpose:** Groups map positions into regional clusters for optimized loot spawning and distribution.

**Contains:**
- 50,005 clustered positions
- Same structure as mapgrouppos.xml but organized by region
- Density-based clustering for performance

**Structure:**
Same as mapgrouppos.xml - groups positioned in world coordinates.

**Supported:**
- Full XML parsing (50,000+ lines)
- Cluster position extraction
- Cluster count reporting
- Reuses mapgrouppos parser

**Usage:**
Optimizes server performance by grouping nearby loot spawns. Prevents lag from calculating 11,000+ individual spawn points every cycle.

### ✅ mapgroupdirt.xml (Ground Loot Spawns)
**Purpose:** Defines ground-level loot spawns (items on the ground, not in buildings).

**Contains:**
- Ground loot positions
- Same structure as clustering system
- Spawn points for outdoor items

**Supported:**
- Full XML parsing
- Position extraction
- Reuses cluster parser

**Usage:**
Controls items that spawn directly on the ground outdoors. Complements building loot from mapgroupproto/pos.

---

## Item Limits System (Anti-Hoarding)

### ✅ cfglimitsdefinition.xml (Global Item Limits)
**Purpose:** Defines item spawn limit categories and usage flags to prevent item hoarding and enforce scarcity.

**Contains:**
- **Categories**: Item groupings (tools, containers, clothes, weapons, food, books, explosives)
- **Tags**: Sub-categorizations for fine-grained control
- **UsageFlags**: Location-based limits (Military, Police, Medic, Firefighter, Industrial, etc.)
- **ValueFlags**: Tier-based limits (Tier1-4 for item value/rarity)

**Structure:**
```xml
<lists>
  <categories>
    <category name="tools" />
    <category name="weapons" />
    <category name="food" />
  </categories>
  <tags>
    <tag name="shelves" />
    <tag name="floor" />
  </tags>
  <usageflags>
    <usage name="Military" />
    <usage name="Police" />
    <usage name="Medic" />
  </usageflags>
  <valueflags>
    <value name="Tier1" />
    <value name="Tier2" />
  </valueflags>
</lists>
```

**Supported:**
- Full XML parsing
- All four list types extraction
- Category count reporting
- Lists validation

**Usage:**
Referenced by types.xml to enforce spawn limits. Prevents players from hoarding all high-value items on the server. Essential for balanced gameplay.

### ✅ cfglimitsdefinitionuser.xml (Custom Item Limits)
**Purpose:** Server owner's custom additions to cfglimitsdefinition.xml for modded content or custom balancing.

**Structure:**
Same as cfglimitsdefinition.xml - extends base definitions.

**Supported:**
- Full XML parsing
- Reuses limits parser
- Custom category/tag support

**Usage:**
Allows server owners to add custom limits without modifying the base file. Critical for modded servers.

---

## Server Configuration Files (XML)

### ✅ cfgenvironment.xml (Animal Territories)
**Purpose:** Defines animal spawning territories, herd behaviors, and ambient life.

**Contains:**
- Territory definitions for all animals (deer, wolves, bears, cows, chickens, etc.)
- Herd behavior configurations
- Agent types and spawn chances
- Zone count and player distance parameters

**Supported:**
- Full XML parsing and validation
- Territory structure extraction
- Agent configuration parsing

### ✅ cfgeventgroups.xml (Event Groups)
**Purpose:** Defines grouped objects for events (e.g., train wreck with multiple cars).

**Contains:**
- Train crash configurations
- Container placements
- Relative positioning data
- Loot parameters per object

**Supported:**
- Group definition parsing
- Child object extraction with coordinates
- Rotation and positioning data

### ✅ cfgeventspawns.xml (Event Spawn Positions)
**Purpose:** Defines spawn positions for events across the map.

**Contains:**
- Vehicle spawn positions (cars, trucks, boats)
- Static event locations (helicopter crashes, police cars)
- Train wreck positions
- Spawn coordinates with rotation

**Supported:**
- Position array parsing
- Event type categorization
- Coordinate extraction

### ✅ cfgIgnoreList.xml (Cleanup Exclusions)
**Purpose:** Items that should not be cleaned up by the server cleanup system.

**Contains:**
- List of item class names to exclude from cleanup
- Typically includes special items, event items, or modded content

**Supported:**
- Simple item list parsing
- Validation of ignore entries

### ✅ cfgplayerspawnpoints.xml (Player Spawn Points)
**Purpose:** Defines where players spawn based on spawn type (fresh, hop, travel).

**Contains:**
- Fresh spawn locations (coast spawns)
- Server hop spawn locations
- Travel spawn locations
- Spawn parameters (distance from infected, players, static objects)
- Generator parameters (grid density, steepness)

**Supported:**
- Full spawn configuration parsing
- Group-based spawn bubble extraction
- Parameter validation

### ✅ cfgrandompresets.xml (Loot Presets)
**Purpose:** Defines random loot presets for containers and clothing attachments.

**Contains:**
- Food presets (hermit, village, city, army)
- Tool presets
- Ammo presets
- Attachment presets (optics, bags, vests, hats)
- Chance-based item selection

**Supported:**
- Cargo preset parsing
- Attachment preset parsing
- Chance calculation support

### ✅ cfgweather.xml (Weather System)
**Purpose:** Controls dynamic weather system parameters.

**Contains:**
- Overcast configuration
- Fog settings
- Rain parameters and thresholds
- Wind magnitude and direction
- Snowfall settings
- Storm/lightning parameters

**Supported:**
- Full weather parameter parsing
- Current state, limits, time limits
- Threshold extraction

---

## Territory Files (env/ folder)

### ✅ Animal Territory Files
**Purpose:** Define spawn zones for animals across the map. These files are referenced by `cfgenvironment.xml`.

**File Types:**
- `wolf_territories.xml` - Wolf packs
- `bear_territories.xml` - Bear spawns
- `cattle_territories.xml` - Cows
- `domestic_animals_territories.xml` - General domestic animals
- `fox_territories.xml` - Foxes
- `hare_territories.xml` - Rabbits
- `hen_territories.xml` - Chickens
- `pig_territories.xml` - Pigs
- `red_deer_territories.xml` - Red deer
- `roe_deer_territories.xml` - Roe deer
- `sheep_goat_territories.xml` - Sheep and goats
- `wild_boar_territories.xml` - Boars
- `zombie_territories.xml` - Infected spawn zones

**Structure:**
```xml
<territory>
  <zone smin="0" smax="0" dmin="3" dmax="5" x="coordinate" z="coordinate" r="radius" />
  <zone smin="0" smax="0" dmin="2" dmax="4" x="coordinate" z="coordinate" r="radius" />
  <!-- More zones... -->
</territory>
```

**Parameters:**
- **x, z**: World coordinates for zone center
- **r**: Radius of spawn zone
- **smin, smax**: Spawn count minimum/maximum
- **dmin, dmax**: Despawn count minimum/maximum

**Supported:**
- Full XML parsing and validation
- Zone extraction with coordinates
- Zone count reporting
- Coordinate and radius data parsing

**Usage:**
Territory files work in conjunction with `cfgenvironment.xml`. The environment file references these territory definitions and assigns behaviors, agent types, and herd configurations to them.

---

## Server Configuration Files (JSON)

### ✅ cfgEffectArea.json (Contaminated Zones)
**Purpose:** Defines static contaminated areas (gas zones) and safe positions.

**Contains:**
- Contaminated area definitions with positions, radius, height
- Particle effects configuration
- Player data (PPE effects, around particles)
- Safe position coordinates for dynamic contamination events

**Supported:**
- Full JSON parsing and validation
- Area array extraction
- SafePositions array parsing

### ✅ cfggameplay.json (Gameplay Mechanics)
**Purpose:** Core gameplay mechanics and balance settings.

**Contains:**
- **Player Data:**
  - Stamina system (sprint modifiers, weight limits, min/max values)
  - Shock handling (refill speeds)
  - Movement data (rotation speeds, inertia)
  - Drowning parameters
  - Weapon obstruction settings
- **Worlds Data:**
  - Temperature ranges by month
  - Wetness modifiers
  - Lighting configuration
- **Base Building:**
  - Hologram checks (collision, placement, underground restrictions)
  - Construction validation
- **UI Data:**
  - Hit indication settings
  - 3D map toggle
- **Map Data:**
  - Ownership settings
  - Player position display
- **Vehicle Data:**
  - Decay multipliers

**Supported:**
- Comprehensive JSON validation
- All nested configuration sections
- Type-safe parsing

### ✅ cfgundergroundtriggers.json (Underground Triggers)
**Purpose:** Defines underground area triggers for special zones.

**Contains:**
- Trigger array (typically empty on vanilla maps)
- Used for underground bunkers, caves, or custom areas

**Supported:**
- JSON parsing and validation
- Triggers array extraction

---

## Database Files (db/ folder)

### ✅ globals.xml (Server Variables)
**Purpose:** Core server configuration variables controlling cleanup, spawning, and performance.

**Contains 30+ global variables:**
- **Animal System:**
  - `AnimalMaxCount` - Maximum animals in world (default: 200)
- **Cleanup Timers (in seconds):**
  - `CleanupLifetimeDeadAnimal` - Dead animal removal (default: 1200)
  - `CleanupLifetimeDeadInfected` - Dead zombie removal (default: 330)
  - `CleanupLifetimeDeadPlayer` - Dead player body removal (default: 3600)
  - `CleanupLifetimeDefault` - Default item cleanup (default: 45)
  - `CleanupLifetimeLimit` - Maximum item lifetime (default: 50)
  - `CleanupLifetimeRuined` - Ruined item removal (default: 330)
- **Flag System:**
  - `FlagRefreshFrequency` - Flag update rate (default: 432000)
  - `FlagRefreshMaxDuration` - Max flag lifetime (default: 3456000)
- **Loot System:**
  - `FoodDecay` - Food decay rate (default: 0 = disabled)
  - `LootProxyPlacement` - Loot container placement (default: 0)
  - `LootSpawnAvoidance` - Avoid spawning near players (default: 1)
  - `LootDamageMin/Max` - Loot spawn damage range (default: 0.0-0.4)
- **Spawn System:**
  - `InitialSpawn` - Loot spawn at server start (default: 100)
  - `RestartSpawn` - Respawn rate (default: 100)
  - `RespawnAttempt` - Respawn attempts per cycle (default: 2)
  - `RespawnLimit` - Max respawns per cycle (default: 20)
  - `RespawnTypes` - Types respawned per cycle (default: 12)
- **Server Performance:**
  - `IdleModeCountdown` - Idle mode timer (default: 60)
  - `IdleModeStartup` - Startup idle time (default: 1)
  - `TimeHopping` - Server hopping timeout (default: 2700)
  - `TimeLogin` - Login timeout (default: 15)
  - `TimeLogout` - Logout timeout (default: 15)
  - `TimePenalty` - Death penalty timer (default: 840)
- **World Systems:**
  - `WorldWetTempUpdate` - Wetness/temp update rate (default: 1)
  - `ZombieMaxCount` - Maximum zombies (default: 1000)
  - `ZoneSpawnDist` - Zone spawn distance (default: 0)

**Structure:**
```xml
<variables>
  <var name="AnimalMaxCount" type="0" value="200"/>
  <var name="CleanupLifetimeDeadAnimal" type="0" value="1200"/>
  <!-- type: 0=integer, 1=float -->
</variables>
```

**Supported:**
- Full XML parsing and validation
- All 30 standard variables with type checking
- Variable count reporting
- Type detection (0=integer, 1=float)

**Usage:**
Critical for server performance tuning. Adjusting cleanup times affects server load, loot availability impacts gameplay difficulty, spawn counts control population density.

### ✅ messages.xml (Server Messages)
**Purpose:** Scheduled server messages and shutdown countdown warnings.

**Contains:**
- Server announcements (login, timed, repeating)
- Shutdown countdown notifications
- Custom variables support (`#name`, `#tmin`)

**Structure:**
```xml
<messages>
  <!-- Welcome message on connect -->
  <message onconnect="1">
    <text>Welcome #name!</text>
  </message>
  
  <!-- Repeating announcement every 30 minutes -->
  <message repeat="1800" delay="900">
    <text>Server rules: No KOS in safe zones</text>
  </message>
  
  <!-- Shutdown countdown (10 minutes before) -->
  <message deadline="10" shutdown="1">
    <text>Server restart in #tmin minutes</text>
  </message>
</messages>
```

**Attributes:**
- `onconnect="1"` - Display when player connects
- `repeat="seconds"` - Repeat interval
- `delay="seconds"` - Initial delay before first display
- `deadline="minutes"` - Minutes before shutdown
- `shutdown="1"` - Mark as shutdown warning

**Variables:**
- `#name` - Player name
- `#tmin` - Time remaining in minutes

**Supported:**
- Full XML parsing and validation
- All message types (onconnect, repeat, deadline)
- Variable placeholders
- Message count reporting

**Usage:**
Essential for player communication. Welcome messages improve onboarding, repeating messages communicate rules, shutdown warnings prevent player frustration.

### ✅ economy.xml (Central Economy Controller)
**Purpose:** Central controller that coordinates all economy systems. Defines which economy systems are active and their behavior.

**Contains 8 Economy Systems:**
1. **dynamic** - Dynamic event spawning (helicopter crashes, police cars, trains)
2. **animals** - Wildlife spawning and population
3. **zombies** - Infected spawning and behavior
4. **vehicles** - Vehicle spawning and persistence
5. **randoms** - Random world events
6. **custom** - Custom server events
7. **building** - Building loot spawning
8. **player** - Player inventory and stash management

**Structure:**
```xml
<economy>
  <dynamic init="1" load="1" respawn="1" save="1" />
  <animals init="1" load="0" respawn="1" save="0" />
  <zombies init="1" load="0" respawn="1" save="0" />
  <vehicles init="1" load="1" respawn="1" save="1" />
  <randoms init="1" load="0" respawn="1" save="0" />
  <custom init="0" load="0" respawn="0" save="0" />
  <building init="1" load="0" respawn="1" save="0" />
  <player init="1" load="1" respawn="0" save="1" />
</economy>
```

**Flags (0 or 1):**
- **init**: Run system initialization at server start
- **load**: Load persistent data from database
- **respawn**: Allow system to respawn entities
- **save**: Save system state to database

**Supported:**
- Full XML parsing
- All 8 economy systems
- Flag extraction (init/load/respawn/save)
- System count reporting

**Usage:**
Master switch for all economy systems. Disable systems for testing, enable custom events, control persistence. Critical for server optimization and custom gameplay modes.

**Example Use Cases:**
- Disable vehicle persistence: `vehicles load="0" save="0"`
- Test mode (no saves): All systems `save="0"`
- Event-only server: Only `dynamic="1"`, others `="0"`
- PvE focus: `zombies` and `animals` priority

---

## Server Scripts

### ✅ init.c (Server Initialization Script)
**Purpose:** C++ server initialization script that runs on server startup. Configures starting conditions, player spawns, and custom logic.

**Contains:**
- **Date Reset Logic**: Calendar date when server wipes/resets
- **Starting Equipment**: Items given to fresh spawns
- **Health Configuration**: Player spawn health ranges
- **Custom Mission Code**: Server-specific initialization logic
- **Weather Settings**: Initial weather state
- **Time Acceleration**: Day/night cycle speed

**Structure:**
```cpp
void main()
{
    // Hive configuration
    Hive ce = CreateHive();
    if (ce)
        ce.InitOffline();
    
    // Date reset (September 20)
    int year, month, day, hour, minute;
    int reset_month = 9;
    int reset_day = 20;
    GetGame().GetWorld().GetDate(year, month, day, hour, minute);
    
    if ((month == reset_month) && (day < reset_day))
    {
        GetGame().GetWorld().SetDate(year, reset_month, reset_day, hour, minute);
    }
    
    // Starting equipment
    player.GetInventory().CreateInInventory("Rag");
    player.GetInventory().CreateInInventory("RoadFlare");
    player.GetInventory().CreateInInventory("StoneKnife");
    
    // Health configuration
    player.SetHealth(RandomFloat(55.0, 65.0));
}
```

**Extracted Configurations:**
- **dateReset**: `{ month: number, day: number }` - When server resets calendar
- **startingEquipment**: `string[]` - Item class names for fresh spawns
- **healthRange**: `{ min: number, max: number }` - Spawn health randomization
- **customSettings**: `{ [key: string]: any }` - Custom variables extracted via regex

**Supported:**
- C++ code parsing with regex patterns
- Date reset extraction (month/day)
- CreateInInventory item list
- RandomFloat health range
- Custom variable detection
- Config count reporting

**Usage:**
Customize fresh spawn experience, server calendar, starting gear. Critical for roleplay servers (specific date), hardcore servers (minimal gear), or themed servers (custom items).

**Example Configurations:**
- **Hardcore**: `SetHealth(25.0)`, no starting items
- **Beginner-Friendly**: `SetHealth(100.0)`, add food/water items
- **Seasonal RP**: Set reset_month for winter/summer start
- **Custom Events**: Add unique starting items for events

---

## Usage in the Tool

### Import Any Configuration File

1. Go to **Import/Export Manager**
2. Click upload or drag-and-drop any supported file
3. Tool automatically detects file type
4. Validates structure and displays results
5. For `types.xml`, items are loaded into the main editor
6. For other configs, data is displayed in a structured view

### File Type Auto-Detection

The tool uses multiple detection methods:
- **Filename patterns** (cfgspawnabletypes, cfggameplay, etc.)
- **XML root elements** (`<types>`, `<events>`, `<economycore>`, etc.)
- **JSON structure** (checking for specific keys like `Areas`, `PlayerData`, etc.)

### Validation

All files are validated before import:
- **XML files:** Checks for malformed tags, unclosed comments, invalid structure
- **JSON files:** Validates JSON syntax and required sections
- **Data integrity:** Ensures required fields exist

---

## Future Enhancements

### Phase 1: Dedicated Editors (Coming Soon)
- Visual event spawn editor with map integration
- Weather system configuration UI
- Gameplay mechanics sliders and toggles
- Animal territory map overlay
- Contaminated zone editor with radius visualization

### Phase 2: Advanced Features
- Batch import/export multiple files at once
- Configuration comparison (diff between two files)
- Version control and rollback
- Config templates for different server types (PvP, PvE, RP)
- Export filters (by category, tier, usage)

### Phase 3: Integration
- Live server config sync
- FTP/SFTP upload capabilities
- Backup scheduling and management
- Multi-server configuration management
- Community config sharing hub

---

## Technical Details

### TypeScript Type Definitions
All configuration files have full TypeScript interfaces in `/src/types/dayz.ts`:
- Type safety for all configuration structures
- Auto-completion in IDE
- Compile-time validation

### Parser Functions
Located in `/src/utils/xmlParser.ts`:
- `parseEffectAreaJSON()` - cfgEffectArea.json
- `parseEnvironmentXML()` - cfgenvironment.xml
- `parseEventGroupsXML()` - cfgeventgroups.xml
- `parseEventSpawnsXML()` - cfgeventspawns.xml
- `parseGameplayJSON()` - cfggameplay.json
- `parseIgnoreListXML()` - cfgIgnoreList.xml
- `parseSpawnPointsXML()` - cfgplayerspawnpoints.xml
- `parseRandomPresetsXML()` - cfgrandompresets.xml
- `parseUndergroundTriggersJSON()` - cfgundergroundtriggers.json
- `parseWeatherXML()` - cfgweather.xml
- `parseConfigFile()` - Universal parser with auto-detection

### File Structure Validation
Each parser includes:
- XML/JSON well-formedness checking
- Required section validation
- Attribute parsing with proper prefixes
- Array normalization (handles single items or arrays)
- Error reporting with descriptive messages

---

## Support Matrix

| File | Import | Export | Visual Editor | Validation |
|------|--------|--------|---------------|------------|
| types.xml | ✅ | ✅ | ✅ | ✅ |
| events.xml | ✅ | ✅ | 🔄 | ✅ |
| cfgspawnabletypes.xml | ✅ | ✅ | 🔄 | ✅ |
| cfgeconomycore.xml | ✅ | ✅ | 🔄 | ✅ |
| cfgenvironment.xml | ✅ | 🔄 | 🔄 | ✅ |
| cfgeventgroups.xml | ✅ | 🔄 | 🔄 | ✅ |
| cfgeventspawns.xml | ✅ | 🔄 | 🔄 | ✅ |
| cfgIgnoreList.xml | ✅ | 🔄 | 🔄 | ✅ |
| cfgplayerspawnpoints.xml | ✅ | 🔄 | 🔄 | ✅ |
| cfgrandompresets.xml | ✅ | 🔄 | 🔄 | ✅ |
| cfgweather.xml | ✅ | 🔄 | 🔄 | ✅ |
| **Territory Files (13 types)** | ✅ | 🔄 | 🔄 | ✅ |
| cfgEffectArea.json | ✅ | 🔄 | 🔄 | ✅ |
| cfggameplay.json | ✅ | 🔄 | 🔄 | ✅ |
| cfgundergroundtriggers.json | ✅ | 🔄 | 🔄 | ✅ |
| globals.xml | ✅ | 🔄 | 🔄 | ✅ |
| messages.xml | ✅ | 🔄 | 🔄 | ✅ |
| economy.xml | ✅ | 🔄 | 🔄 | ✅ |
| mapgroupproto.xml | ✅ | 🔄 | 🔄 | ✅ |
| mapgrouppos.xml | ✅ | 🔄 | 🔄 | ✅ |
| mapgroupcluster.xml | ✅ | 🔄 | 🔄 | ✅ |
| mapgroupdirt.xml | ✅ | 🔄 | 🔄 | ✅ |
| cfglimitsdefinition.xml | ✅ | 🔄 | 🔄 | ✅ |
| cfglimitsdefinitionuser.xml | ✅ | 🔄 | 🔄 | ✅ |
| init.c | ✅ | 🔄 | 🔄 | ✅ |

**Legend:**
- ✅ Fully Implemented
- 🔄 Planned/In Development
- ❌ Not Supported

---

## Examples

### Import cfggameplay.json
```typescript
// Tool automatically detects and validates
{
  version: 123,
  PlayerData: {
    StaminaData: { staminaMax: 100, ... },
    MovementData: { timeToSprint: 0.45, ... }
  },
  WorldsData: { environmentMinTemps: [...], ... }
}
```

### Import cfgweather.xml
```xml
<weather reset="0" enable="0">
  <overcast>
    <current actual="0.45" time="120" duration="240" />
    <limits min="0.0" max="1.0" />
  </overcast>
  <!-- ... -->
</weather>
```

### Import cfgEffectArea.json
```json
{
  "Areas": [
    {
      "AreaName": "Ship-Bow",
      "Type": "ContaminatedArea_Static",
      "Data": {
        "Pos": [13920, 0, 11170],
        "Radius": 60
      }
    }
  ],
  "SafePositions": [[434, 13624], ...]
}
```

---

## Complete File Support Matrix

### Summary: 37 Supported Files

| Category | Files | Count |
|----------|-------|-------|
| **Core Economy** | types.xml, events.xml, spawnable_types.xml, cfgeconomycore.xml | 4 |
| **Server Configuration** | cfgenvironment.xml, cfgeventgroups.xml, cfgeventspawns.xml, cfgIgnoreList.xml, cfgplayerspawnpoints.xml, cfgrandompresets.xml, cfgweather.xml, cfgEffectArea.json, cfggameplay.json, cfgundergroundtriggers.json | 10 |
| **Territory Files (env/)** | wolf_territories.xml, bear_territories.xml, deer_territories.xml, boar_territories.xml, goat_territories.xml, sheep_territories.xml, cattle_territories.xml, pig_territories.xml, chicken_territories.xml, hen_territories.xml, rabbit_territories.xml, fox_territories.xml, hare_territories.xml | 13 |
| **Database Files (db/)** | globals.xml, messages.xml, economy.xml | 3 |
| **Map Group System** | mapgroupproto.xml, mapgrouppos.xml, mapgroupcluster.xml, mapgroupdirt.xml | 4 |
| **Item Limits System** | cfglimitsdefinition.xml, cfglimitsdefinitionuser.xml | 2 |
| **Server Scripts** | init.c | 1 |

### Support Level: ✅ Full Import & Validation

All 37 files support:
- Automatic file type detection
- XML/JSON structure validation
- Data parsing and extraction
- Error reporting with detailed messages
- Preview of configuration data

---

## Changelog

### Version 1.3.0 - Map Group System & Advanced Server Control
- ✅ Added mapgroupproto.xml (18,403 lines) - Loot spawn point definitions
- ✅ Added mapgrouppos.xml (11,684 lines) - World position mapping
- ✅ Added mapgroupcluster.xml (50,005 lines) - Regional clustering
- ✅ Added mapgroupdirt.xml - Ground loot spawns
- ✅ Added cfglimitsdefinition.xml - Global item limits (anti-hoarding)
- ✅ Added cfglimitsdefinitionuser.xml - Custom item limits
- ✅ Added db/economy.xml - Central economy controller (8 systems)
- ✅ Added init.c - Server initialization script parser
- ✅ Enhanced UI with 4 new file category sections
- ✅ C++ code parsing support for init.c
- ✅ Count reporting for all new file types
- ✅ **37 total configuration files now supported**

### Version 1.2.0 - Database Files Support
- ✅ Added db/globals.xml with 30 server variables
- ✅ Added db/messages.xml with server messaging system
- ✅ Variable and message count reporting
- ✅ Enhanced documentation with all variable descriptions
- ✅ **29 total configuration files now supported**

### Version 1.1.0 - Full Server Configuration Support
- ✅ Added 10 new configuration file types
- ✅ Added 13 territory files (env/ folder)
- ✅ Universal config file parser with auto-detection
- ✅ Comprehensive TypeScript type definitions
- ✅ Enhanced import/export page with all file types listed
- ✅ XML/JSON validation for all formats
- ✅ Data structure preview for imported configs

### Version 1.0.0 - Initial Release
- ✅ types.xml support with visual editor
- ✅ Basic XML validation
- ✅ Template system
- ✅ Analytics dashboard

---

**Ready for Production Server Management** 🎮

All 37 configuration files can now be imported, validated, and analyzed. Complete control over DayZ server economy, dynamic events, item limits, and server initialization!

**New in v1.3.0:**
- 🗺️ Map Group System (4 files) - Full control over dynamic event spawning
- 🛡️ Item Limits System (2 files) - Prevent hoarding and enforce scarcity
- ⚙️ Economy Controller (economy.xml) - Master switch for 8 economy systems
- 💻 Init Script Parser (init.c) - Customize server startup and fresh spawn experience
