# DayZ Configuration File Examples

Real-world examples from actual DayZ server configurations.

## types.xml - Item Configuration

### Basic Item Structure
```xml
<type name="AKM">
    <nominal>5</nominal>
    <lifetime>28800</lifetime>
    <restock>1800</restock>
    <min>3</min>
    <quantmin>-1</quantmin>
    <quantmax>-1</quantmax>
    <cost>100</cost>
    <flags count_in_cargo="0" count_in_hoarder="0" count_in_map="1" count_in_player="0" crafted="0" deloot="0"/>
    <category name="weapons"/>
    <usage name="Military"/>
    <usage name="Hunting"/>
    <value name="Tier3"/>
</type>
```

### Food Item
```xml
<type name="BakedBeansCan">
    <nominal>40</nominal>
    <lifetime>3888000</lifetime>
    <restock>0</restock>
    <min>20</min>
    <quantmin>-1</quantmin>
    <quantmax>-1</quantmax>
    <cost>100</cost>
    <flags count_in_cargo="1" count_in_hoarder="0" count_in_map="1" count_in_player="0" crafted="0" deloot="0"/>
    <category name="food"/>
    <usage name="Town"/>
    <usage name="Village"/>
    <value name="Tier1"/>
</type>
```

### Medical Item
```xml
<type name="Bandage">
    <nominal>50</nominal>
    <lifetime>28800</lifetime>
    <restock>1800</restock>
    <min>30</min>
    <quantmin>-1</quantmin>
    <quantmax>-1</quantmax>
    <cost>100</cost>
    <flags count_in_cargo="1" count_in_hoarder="0" count_in_map="1" count_in_player="0" crafted="0" deloot="0"/>
    <category name="tools"/>
    <usage name="Medic"/>
    <usage name="Hunting"/>
    <usage name="Town"/>
    <value name="Tier1"/>
</type>
```

---

## cfgspawnabletypes.xml - Container Loot

### Backpack with Random Items
```xml
<type name="TaloonBag_Blue">
    <cargo chance="0.25">
        <item name="TunaCan" chance="0.15"/>
        <item name="SardinesCan" chance="0.15"/>
        <item name="BakedBeansCan" chance="0.10"/>
        <item name="Matchbox" chance="0.20"/>
        <item name="Rope" chance="0.10"/>
    </cargo>
</type>
```

### Police Car with Attachments
```xml
<type name="OffroadHatchback_Police">
    <cargo chance="0.30">
        <item name="Mag_CZ75_15Rnd" chance="0.20"/>
        <item name="Mag_Glock_15Rnd" chance="0.20"/>
        <item name="AmmoBox_9x19_25Rnd" chance="0.15"/>
        <item name="Roadflare" chance="0.30"/>
    </cargo>
</type>
```

### Military Container
```xml
<type name="Land_Container_1Bo">
    <cargo chance="0.40">
        <item name="AKM" chance="0.05"/>
        <item name="Mag_AKM_30Rnd" chance="0.15"/>
        <item name="Ammo_762x39" chance="0.20"/>
        <item name="GhillieSuit_Woodland" chance="0.03"/>
        <item name="PlateCarrierVest" chance="0.08"/>
        <item name="TacticalBaconCan" chance="0.15"/>
    </cargo>
</type>
```

---

## cfgeconomycore.xml - Core Settings

```xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<economycore>
    <classes>
        <rootclass name="all" reportMemoryLOD="no">
            <rootclass name="Man" reportMemoryLOD="no" act="character">
                <class name="Animal_BosTaurus" reportMemoryLOD="no"/>
                <class name="Animal_CapraHircus_Brown" reportMemoryLOD="no"/>
                <class name="Animal_CapraHircus_Spotted" reportMemoryLOD="no"/>
                <class name="Animal_CervusElaphus" reportMemoryLOD="no"/>
            </rootclass>
            <rootclass name="Car" reportMemoryLOD="no" act="car">
                <class name="OffroadHatchback" reportMemoryLOD="no"/>
                <class name="Sedan_02" reportMemoryLOD="no"/>
                <class name="CivilianSedan" reportMemoryLOD="no"/>
            </rootclass>
        </rootclass>
    </classes>
    <defaults>
        <default name="dyn_radius" value="20"/>
        <default name="dyn_saddist" value="180"/>
        <default name="dyn_离线" value="2"/>
    </defaults>
</economycore>
```

---

## events.xml - Event Spawns

### Helicopter Crash
```xml
<event name="StaticHeliCrash">
    <nominal>3</nominal>
    <min>3</min>
    <max>5</max>
    <lifetime>2592000</lifetime>
    <restock>0</restock>
    <saferadius>500</saferadius>
    <distanceradius>1000</distanceradius>
    <cleanupradius>1000</cleanupradius>
    <flags deletable="0" init_random="0" remove_damaged="1"/>
    <position>fixed</position>
    <limit>mixed</limit>
    <active>1</active>
    <children>
        <child lootmax="10" lootmin="5" max="0" min="0" type="Wreck_UH1Y"/>
    </children>
</event>
```

### Police Car
```xml
<event name="StaticPoliceCar">
    <nominal>10</nominal>
    <min>5</min>
    <max>10</max>
    <lifetime>604800</lifetime>
    <restock>0</restock>
    <saferadius>200</saferadius>
    <distanceradius>200</distanceradius>
    <cleanupradius>200</cleanupradius>
    <flags deletable="0" init_random="0" remove_damaged="0"/>
    <position>fixed</position>
    <limit>custom</limit>
    <active>1</active>
    <children>
        <child lootmax="5" lootmin="3" max="0" min="0" type="OffroadHatchback_Police"/>
    </children>
</event>
```

### Vehicle Spawn
```xml
<event name="VehicleCivilianSedan">
    <nominal>20</nominal>
    <min>10</min>
    <max>20</max>
    <lifetime>2592000</lifetime>
    <restock>900</restock>
    <saferadius>400</saferadius>
    <distanceradius>400</distanceradius>
    <cleanupradius>500</cleanupradius>
    <flags deletable="0" init_random="0" remove_damaged="0"/>
    <position>fixed</position>
    <limit>child</limit>
    <active>1</active>
    <children>
        <child lootmax="0" lootmin="0" max="20" min="10" type="CivilianSedan"/>
    </children>
</event>
```

---

## cfgEffectArea.json - Contaminated Zones

### Ship Wreck Static Gas Zone
```json
{
    "Areas": [
        {
            "AreaName": "Ship-Bow",
            "Type": "ContaminatedArea_Static",
            "TriggerType": "ContaminatedTrigger",
            "Data": {
                "Pos": [13920, 0, 11170],
                "Radius": 60,
                "PosHeight": 20,
                "NegHeight": 3,
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
    ],
    "SafePositions": [
        [434, 13624],
        [360, 10986],
        [1412, 13505]
    ]
}
```

---

## cfggameplay.json - Gameplay Mechanics

### Stamina Configuration
```json
{
    "version": 123,
    "PlayerData": {
        "disablePersonalLight": false,
        "StaminaData": {
            "sprintStaminaModifierErc": 1.0,
            "sprintStaminaModifierCro": 1.0,
            "staminaWeightLimitThreshold": 6000.0,
            "staminaMax": 100.0,
            "staminaKgToStaminaPercentPenalty": 1.75,
            "staminaMinCap": 5.0,
            "sprintSwimmingStaminaModifier": 1.0,
            "sprintLadderStaminaModifier": 1.0,
            "meleeStaminaModifier": 1.0,
            "obstacleTraversalStaminaModifier": 1.0,
            "holdBreathStaminaModifier": 1.0
        }
    }
}
```

### Base Building Settings
```json
{
    "BaseBuildingData": {
        "HologramData": {
            "disableIsCollidingBBoxCheck": false,
            "disableIsCollidingPlayerCheck": false,
            "disableIsClippingRoofCheck": false,
            "disableIsBaseViableCheck": false,
            "disableIsCollidingGPlotCheck": false,
            "disableIsCollidingAngleCheck": false,
            "disableIsPlacementPermittedCheck": false,
            "disableHeightPlacementCheck": false,
            "disableIsUnderwaterCheck": false,
            "disableIsInTerrainCheck": false,
            "disableColdAreaBuildingCheck": false,
            "disallowedTypesInUnderground": [
                "FenceKit",
                "TerritoryFlagKit",
                "WatchtowerKit"
            ]
        }
    }
}
```

---

## cfgweather.xml - Weather Configuration

### Default Weather
```xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<weather reset="0" enable="1">
    <overcast>
        <current actual="0.45" time="120" duration="240"/>
        <limits min="0.0" max="1.0"/>
        <timelimits min="600" max="900"/>
        <changelimits min="0.0" max="1.0"/>
    </overcast>
    <fog>
        <current actual="0.05" time="120" duration="240"/>
        <limits min="0.02" max="0.08"/>
        <timelimits min="900" max="900"/>
        <changelimits min="0.0" max="1.0"/>
    </fog>
    <rain>
        <current actual="0.0" time="60" duration="120"/>
        <limits min="0.0" max="1.0"/>
        <timelimits min="60" max="120"/>
        <changelimits min="0.0" max="1.0"/>
        <thresholds min="0.6" max="1.0" end="60"/>
    </rain>
    <storm density="1.0" threshold="0.9" timeout="45"/>
</weather>
```

### Always Sunny (No Rain)
```xml
<weather reset="0" enable="1">
    <overcast>
        <current actual="0.1" time="0" duration="32768"/>
        <limits min="0.0" max="0.3"/>
        <timelimits min="3600" max="7200"/>
        <changelimits min="0.0" max="0.1"/>
    </overcast>
    <rain>
        <current actual="0.0" time="0" duration="32768"/>
        <limits min="0.0" max="0.0"/>
        <timelimits min="3600" max="7200"/>
        <changelimits min="0.0" max="0.0"/>
        <thresholds min="1.0" max="1.0" end="0"/>
    </rain>
</weather>
```

---

## cfgenvironment.xml - Animal Territories

### Wolf Territory
```xml
<territory type="Herd" name="Wolf" behavior="DZWolfGroupBeh">
    <file usable="wolf_territories"/>
    <agent type="Male" chance="1">
        <spawn configName="Animal_UrsusArctos" chance="1"/>
        <item name="countMin" val="2"/>
        <item name="countMax" val="4"/>
    </agent>
    <agent type="Female" chance="1">
        <spawn configName="Animal_UrsusArctos" chance="1"/>
        <item name="countMin" val="2"/>
        <item name="countMax" val="4"/>
    </agent>
    <item name="herdsCount" val="8"/>
</territory>
```

### Ambient Chickens
```xml
<territory type="Ambient" name="AmbientHen" behavior="DZAmbientLifeGroupBeh">
    <file usable="hen_territories"/>
    <agent type="Male" chance="1">
        <spawn configName="Animal_GallusGallusDomesticus" chance="1"/>
    </agent>
    <agent type="Female" chance="3">
        <spawn configName="Animal_GallusGallusDomesticusF_Brown" chance="1"/>
        <spawn configName="Animal_GallusGallusDomesticusF_Spotted" chance="10"/>
        <spawn configName="Animal_GallusGallusDomesticusF_White" chance="20"/>
    </agent>
    <item name="globalCountMax" val="50"/>
    <item name="zoneCountMin" val="1"/>
    <item name="zoneCountMax" val="1"/>
    <item name="playerSpawnRadiusNear" val="25"/>
    <item name="playerSpawnRadiusFar" val="75"/>
</territory>
```

---

## cfgrandompresets.xml - Loot Presets

### Food Preset for Villages
```xml
<cargo chance="0.16" name="foodVillage">
    <item name="SodaCan_Cola" chance="0.02"/>
    <item name="SodaCan_Pipsi" chance="0.02"/>
    <item name="SodaCan_Spite" chance="0.02"/>
    <item name="WaterBottle" chance="0.02"/>
    <item name="TunaCan" chance="0.05"/>
    <item name="SardinesCan" chance="0.05"/>
    <item name="PeachesCan" chance="0.05"/>
    <item name="BakedBeansCan" chance="0.05"/>
    <item name="Crackers" chance="0.05"/>
</cargo>
```

### Military Ammo Preset
```xml
<cargo chance="0.25" name="ammoArmy">
    <item name="Ammo_556x45" chance="0.15"/>
    <item name="Ammo_762x39" chance="0.15"/>
    <item name="Ammo_762x54" chance="0.10"/>
    <item name="Mag_STANAG_30Rnd" chance="0.12"/>
    <item name="Mag_AKM_30Rnd" chance="0.12"/>
    <item name="Mag_SVD_10Rnd" chance="0.08"/>
</cargo>
```

### Optics Attachments
```xml
<attachments chance="0.10" name="optics">
    <item name="M4_CarryHandleOptic" chance="0.15"/>
    <item name="ACOGOptic" chance="0.10"/>
    <item name="ReflexOptic" chance="0.12"/>
    <item name="KobraOptic" chance="0.12"/>
    <item name="PSO1Optic" chance="0.08"/>
    <item name="PSO11Optic" chance="0.08"/>
</attachments>
```

---

## cfgplayerspawnpoints.xml - Player Spawns

### Fresh Spawn Configuration
```xml
<fresh>
    <spawn_params>
        <min_dist_infected>30</min_dist_infected>
        <max_dist_infected>70</max_dist_infected>
        <min_dist_player>65</min_dist_player>
        <max_dist_player>150</max_dist_player>
        <min_dist_static>0</min_dist_static>
        <max_dist_static>2</max_dist_static>
    </spawn_params>
    <generator_params>
        <grid_density>4</grid_density>
        <grid_width>200</grid_width>
        <grid_height>200</grid_height>
        <min_steepness>-45</min_steepness>
        <max_steepness>45</max_steepness>
    </generator_params>
    <group_params>
        <enablegroups>true</enablegroups>
        <lifetime>240</lifetime>
        <counter>-1</counter>
    </group_params>
    <generator_posbubbles>
        <group name="WestCherno">
            <pos x="6063.018555" z="1931.907227"/>
            <pos x="5933.964844" z="2171.072998"/>
            <pos x="6199.782715" z="2241.805176"/>
        </group>
    </generator_posbubbles>
</fresh>
```

---

## cfgIgnoreList.xml - Cleanup Exclusions

```xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<ignore>
    <type name="Bandage"></type>
    <type name="SeaChest"></type>
    <type name="WoodenCrate"></type>
    <type name="BarrelHoles_Blue"></type>
    <type name="TerritoryFlagKit"></type>
    <type name="FenceKit"></type>
    <type name="WatchtowerKit"></type>
    <type name="BaseBuildingKit"></type>
</ignore>
```

---

## env/ folder - Territory Files

### Wolf Territory Zones
```xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<territory>
    <zone smin="0" smax="0" dmin="3" dmax="5" x="3591.8" z="8981.7" r="150"/>
    <zone smin="0" smax="0" dmin="3" dmax="5" x="6344.9" z="11341.1" r="150"/>
    <zone smin="0" smax="0" dmin="2" dmax="4" x="9847.2" z="10562.4" r="120"/>
    <zone smin="0" smax="0" dmin="2" dmax="4" x="11234.5" z="8765.3" r="120"/>
    <zone smin="0" smax="0" dmin="3" dmax="5" x="13456.7" z="12345.6" r="150"/>
</territory>
```

### Bear Territory Zones
```xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<territory>
    <zone smin="0" smax="0" dmin="1" dmax="2" x="2134.5" z="9876.4" r="200"/>
    <zone smin="0" smax="0" dmin="1" dmax="2" x="5678.9" z="13245.7" r="200"/>
    <zone smin="0" smax="0" dmin="1" dmax="1" x="11234.6" z="14567.8" r="180"/>
</territory>
```

### Cattle Territory (Domestic Animals)
```xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<territory>
    <zone smin="0" smax="0" dmin="2" dmax="4" x="6543.2" z="2345.6" r="100"/>
    <zone smin="0" smax="0" dmin="3" dmax="5" x="8765.4" z="3456.7" r="120"/>
    <zone smin="0" smax="0" dmin="2" dmax="3" x="10234.5" z="4567.8" r="100"/>
</territory>
```

### Red Deer Territory
```xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<territory>
    <zone smin="0" smax="0" dmin="4" dmax="6" x="4567.8" z="7890.1" r="180"/>
    <zone smin="0" smax="0" dmin="3" dmax="5" x="7890.1" z="9012.3" r="150"/>
    <zone smin="0" smax="0" dmin="4" dmax="6" x="10123.4" z="11234.5" r="180"/>
</territory>
```

### Territory Zone Parameters Explained

- **x**: X coordinate on the map (east-west position)
- **z**: Z coordinate on the map (north-south position)
- **r**: Radius of the spawn zone in meters
- **smin/smax**: Spawn count range (usually 0 for dynamic spawning)
- **dmin/dmax**: Number of animals in the herd (min and max)

### Typical Zone Sizes by Animal

```
Bears:       r="180-200"  (larger, solitary)
Wolves:      r="120-150"  (pack animals, medium range)
Deer:        r="150-180"  (herds, medium-large range)
Cattle:      r="100-120"  (smaller, domestic)
Chickens:    r="50-80"    (small, village areas)
Boars:       r="120-150"  (medium range)
```

### How Territories Work

1. **cfgenvironment.xml** references territory files:
```xml
<territory type="Herd" name="Wolf" behavior="DZWolfGroupBeh">
    <file usable="wolf_territories"/>
    <!-- Territory zones loaded from env/wolf_territories.xml -->
</territory>
```

2. **Zone Selection**: Server randomly selects zones from the file
3. **Herd Spawning**: Creates animal groups within zone radius
4. **Dynamic Spawning**: Animals respawn when counts drop below dmin

---

## Parameter Explanations

### types.xml Parameters

- **nominal**: Target number of items that should exist in the world
- **min**: Minimum number before respawn triggers
- **lifetime**: How long item exists before cleanup (seconds)
- **restock**: How often spawn system checks for respawn (seconds, 0 = never)
- **quantmin/quantmax**: Quantity range for stacks (-1 = not applicable)
- **cost**: CPU cost for spawning (affects performance)

### Flags Explained

- **count_in_cargo**: Count items in containers (0=no, 1=yes)
- **count_in_hoarder**: Count in buried stashes
- **count_in_map**: Count in main world spawn system
- **count_in_player**: Count in player inventory
- **crafted**: Item can be crafted
- **deloot**: Can be found as loot

### Common Lifetime Values

```
3600    = 1 hour
7200    = 2 hours
14400   = 4 hours
28800   = 8 hours
43200   = 12 hours
86400   = 24 hours
604800  = 1 week
2592000 = 30 days
3888000 = 45 days (food default)
```

### Common Restock Values

```
0     = Never respawn (static spawns)
900   = 15 minutes
1800  = 30 minutes
3600  = 1 hour
7200  = 2 hours
```

---

## db/globals.xml - Server Variables

### Complete Example with Common Values

```xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<variables>
    <!-- Animal System -->
    <var name="AnimalMaxCount" type="0" value="200"/>
    
    <!-- Cleanup Timers (seconds) -->
    <var name="CleanupLifetimeDeadAnimal" type="0" value="1200"/>
    <var name="CleanupLifetimeDeadInfected" type="0" value="330"/>
    <var name="CleanupLifetimeDeadPlayer" type="0" value="3600"/>
    <var name="CleanupLifetimeDefault" type="0" value="45"/>
    <var name="CleanupLifetimeLimit" type="0" value="50"/>
    <var name="CleanupLifetimeRuined" type="0" value="330"/>
    
    <!-- Flag System (seconds) -->
    <var name="FlagRefreshFrequency" type="0" value="432000"/>
    <var name="FlagRefreshMaxDuration" type="0" value="3456000"/>
    
    <!-- Loot System -->
    <var name="FoodDecay" type="0" value="0"/>
    <var name="LootProxyPlacement" type="0" value="0"/>
    <var name="LootSpawnAvoidance" type="0" value="1"/>
    <var name="LootDamageMin" type="1" value="0.0"/>
    <var name="LootDamageMax" type="1" value="0.4"/>
    
    <!-- Spawn Rates -->
    <var name="InitialSpawn" type="0" value="100"/>
    <var name="RestartSpawn" type="0" value="100"/>
    <var name="RespawnAttempt" type="0" value="2"/>
    <var name="RespawnLimit" type="0" value="20"/>
    <var name="RespawnTypes" type="0" value="12"/>
    
    <!-- Server Performance -->
    <var name="IdleModeCountdown" type="0" value="60"/>
    <var name="IdleModeStartup" type="0" value="1"/>
    <var name="TimeHopping" type="0" value="2700"/>
    <var name="TimeLogin" type="0" value="15"/>
    <var name="TimeLogout" type="0" value="15"/>
    <var name="TimePenalty" type="0" value="840"/>
    
    <!-- World Systems -->
    <var name="WorldWetTempUpdate" type="0" value="1"/>
    <var name="ZombieMaxCount" type="0" value="1000"/>
    <var name="ZoneSpawnDist" type="0" value="0"/>
</variables>
```

### Variable Type Reference
- **type="0"** - Integer values
- **type="1"** - Float values (decimals)

### High-Population Server Example
```xml
<var name="ZombieMaxCount" type="0" value="1500"/>
<var name="AnimalMaxCount" type="0" value="300"/>
<var name="RespawnLimit" type="0" value="30"/>
<var name="RespawnTypes" type="0" value="20"/>
```

### Fast Cleanup Server Example
```xml
<var name="CleanupLifetimeDeadInfected" type="0" value="180"/>
<var name="CleanupLifetimeDeadAnimal" type="0" value="600"/>
<var name="CleanupLifetimeDefault" type="0" value="30"/>
<var name="CleanupLifetimeRuined" type="0" value="180"/>
```

---

## db/messages.xml - Server Messages

### Welcome Message
```xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<messages>
    <message onconnect="1">
        <text>Welcome to the server, #name! Discord: discord.gg/example</text>
    </message>
</messages>
```

### Repeating Announcements
```xml
<messages>
    <!-- Every 30 minutes, starting after 15 minutes -->
    <message repeat="1800" delay="900">
        <text>Remember: No KOS in safe zones! Type /help for commands</text>
    </message>
    
    <!-- Every hour -->
    <message repeat="3600">
        <text>Join our Discord for events and updates!</text>
    </message>
</messages>
```

### Shutdown Countdown
```xml
<messages>
    <!-- 30 minutes before shutdown -->
    <message deadline="30" shutdown="1">
        <text>Server restart in #tmin minutes. Please find shelter.</text>
    </message>
    
    <!-- 15 minutes before shutdown -->
    <message deadline="15" shutdown="1">
        <text>Server restart in #tmin minutes!</text>
    </message>
    
    <!-- 5 minutes before shutdown -->
    <message deadline="5" shutdown="1">
        <text>URGENT: Server restarting in #tmin minutes! Get to safety!</text>
    </message>
    
    <!-- 1 minute before shutdown -->
    <message deadline="1" shutdown="1">
        <text>Server restarting in #tmin minute! LOGOUT NOW!</text>
    </message>
</messages>
```

### Complete Server Messages Example
```xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<messages>
    <!-- Welcome Message -->
    <message onconnect="1">
        <text>Welcome #name! Read /rules. Discord: discord.gg/example</text>
    </message>
    
    <!-- Regular Announcements -->
    <message repeat="1800" delay="900">
        <text>Server rules: No combat logging, no glitching, respect safe zones</text>
    </message>
    
    <message repeat="3600" delay="1800">
        <text>Join events every Saturday at 8PM EST. Check Discord for details!</text>
    </message>
    
    <!-- Shutdown Sequence -->
    <message deadline="30" shutdown="1">
        <text>Scheduled restart in #tmin minutes</text>
    </message>
    
    <message deadline="10" shutdown="1">
        <text>Server restart in #tmin minutes - Find shelter!</text>
    </message>
    
    <message deadline="5" shutdown="1">
        <text>RESTART IN #tmin MINUTES!</text>
    </message>
    
    <message deadline="1" shutdown="1">
        <text>RESTARTING IN #tmin MINUTE - LOGOUT NOW!</text>
    </message>
</messages>
```

### Message Variables
- **#name** - Player's character name
- **#tmin** - Time remaining in minutes (for shutdown messages)

### Message Attributes
- **onconnect="1"** - Show when player connects
- **repeat="seconds"** - Repeat interval (1800 = 30 minutes)
- **delay="seconds"** - Wait before first display (900 = 15 minutes)
- **deadline="minutes"** - Minutes before shutdown
- **shutdown="1"** - Mark as shutdown warning

---

## Tips for Editing

1. **Always validate XML syntax** - One missing `>` breaks everything
2. **Test changes incrementally** - Don't change 100 items at once
3. **Monitor server logs** - They'll show parsing errors
4. **Keep backups** - Before every major change
5. **Use this tool's validation** - Catches errors before deployment
6. **Test globals.xml carefully** - Bad values can crash server
7. **Coordinate shutdown times** - Use messages.xml to warn players

---

**Ready to configure your DayZ server like a pro! 🎮⚙️**
