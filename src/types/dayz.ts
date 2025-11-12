/**
 * DayZ Economy Item Type Definitions
 * Based on DayZ Standalone types.xml schema
 */

export type TierLevel = 'Tier1' | 'Tier2' | 'Tier3' | 'Tier4';

export type ItemCategory = 
  | 'weapons'
  | 'optics'
  | 'explosives'
  | 'tools'
  | 'vehiclesparts'
  | 'clothes'
  | 'food'
  | 'containers'
  | null;

export type ItemUsage = 
  | 'Military'
  | 'Medic'
  | 'Firefighter'
  | 'Police'
  | 'Industrial'
  | 'Farm'
  | 'Coast'
  | 'Town'
  | 'Village'
  | 'Hunting'
  | 'School'
  | 'Office'
  | 'Prison';

export type ValueFlag = 
  | 'Tier1'
  | 'Tier2'
  | 'Tier3'
  | 'Tier4';

export interface ItemFlags {
  count_in_cargo?: '0' | '1';
  count_in_hoarder?: '0' | '1';
  count_in_map?: '0' | '1';
  count_in_player?: '0' | '1';
  crafted?: '0' | '1';
  deloot?: '0' | '1';
}

export interface DayZItem {
  name: string;
  nominal: number;
  lifetime: number;
  restock: number;
  min: number;
  quantmin: number;
  quantmax: number;
  cost: number;
  flags?: ItemFlags;
  category?: ItemCategory;
  usage?: ItemUsage[];
  value?: ValueFlag[];
  tag?: string[];
}

export interface TypesXMLRoot {
  types: {
    type: DayZItem[];
  };
}

/**
 * Event Type Definitions for events.xml
 */
export interface EventSpawn {
  name: string;
  min: number;
  max: number;
  lifetime: number;
  restock: number;
  saferadius: number;
  distanceradius: number;
  cleanupradius: number;
  flags?: {
    deletable?: '0' | '1';
    init_random?: '0' | '1';
    remove_damaged?: '0' | '1';
  };
  position?: string;
  limit?: string;
  active?: '0' | '1';
  children?: EventChild[];
}

export interface EventChild {
  type: string;
  lootmax: number;
  lootmin: number;
  max: number;
  min: number;
  type_value?: string;
}

export interface EventsXMLRoot {
  events: {
    event: EventSpawn[];
  };
}

/**
 * Spawnable Types for spawnable_types.xml
 */
export interface SpawnableItem {
  name: string;
  attachments?: {
    item: {
      name: string;
      chance: number;
    }[];
  };
  cargo?: {
    item: {
      name: string;
      chance: number;
    }[];
  };
}

export interface SpawnableTypesXMLRoot {
  spawnabletypes: {
    type: SpawnableItem[];
  };
}

/**
 * Economy Core for economy.xml
 */
export interface EconomyCore {
  classes?: {
    rootclass?: Array<{
      '@_name': string;
      '@_act'?: 'character' | 'car';
      '@_reportMemoryLOD'?: 'yes' | 'no';
    }> | {
      '@_name': string;
      '@_act'?: 'character' | 'car';
      '@_reportMemoryLOD'?: 'yes' | 'no';
    };
  };
  defaults?: {
    default?: Array<{
      '@_name': string;
      '@_value': string;
    }> | {
      '@_name': string;
      '@_value': string;
    };
  };
}

export interface EconomyXMLRoot {
  economycore: EconomyCore;
}

/**
 * Validation schemas and utility types
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  itemName?: string;
  line?: number;
}

export interface ValidationWarning {
  field: string;
  message: string;
  itemName?: string;
  suggestion?: string;
}

/**
 * File operations types
 */
export interface FileImportResult {
  success: boolean;
  itemCount: number;
  data?: DayZItem[] | EventSpawn[] | SpawnableItem[];
  errors?: string[];
}

export interface FileExportOptions {
  filename: string;
  format: 'xml' | 'json';
  prettyPrint: boolean;
  includeComments: boolean;
}

/**
 * Analytics and Statistics
 */
export interface EconomyStats {
  totalItems: number;
  itemsByCategory: Record<string, number>;
  itemsByTier: Record<string, number>;
  averageNominal: number;
  averageLifetime: number;
  totalSpawnedItems: number;
}

/**
 * Backup and version control
 */
export interface ConfigBackup {
  id: string;
  timestamp: Date;
  filename: string;
  fileType: 'types' | 'events' | 'spawnable' | 'economy';
  description?: string;
  itemCount: number;
}

/**
 * Templates
 */
export type MapType = 'chernarus' | 'livonia' | 'sakhal' | 'custom';
export type TemplateType = 'map' | 'playstyle' | 'community' | 'custom';
export type PlaystyleType = 'pvp' | 'survival' | 'balanced' | 'roleplay';

export interface EconomyTemplate {
  id: string;
  name: string;
  description: string;
  type: TemplateType;
  map?: MapType;
  playstyle?: PlaystyleType;
  author?: string;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  
  // Template data
  items: DayZItem[];
  
  // Metadata
  totalItems: number;
  categoryMultipliers?: Partial<Record<NonNullable<ItemCategory>, number>>;
  globalMultipliers?: {
    nominal?: number;
    lifetime?: number;
    restock?: number;
  };
}

export interface TemplateApplyOptions {
  mode: 'full' | 'category' | 'selective';
  categories?: ItemCategory[];
  selectedItems?: string[];
  adjustmentPercentage?: number; // e.g., 120 means increase all by 20%
  preserveCustom?: boolean; // Don't overwrite user-modified items
}

export interface TemplateComparison {
  template1: EconomyTemplate;
  template2: EconomyTemplate;
  differences: {
    itemName: string;
    field: keyof DayZItem;
    value1: any;
    value2: any;
  }[];
  summary: {
    totalDifferences: number;
    categoriesAffected: ItemCategory[];
    avgNominalDiff: number;
    avgLifetimeDiff: number;
  };
}

/**
 * ========================
 * Additional DayZ Server Configuration Files
 * ========================
 */

/**
 * cfgEffectArea.json - Contaminated zones and safe positions
 */
export interface EffectAreaData {
  Pos: number[]; // [x, y, z]
  Radius: number;
  PosHeight: number;
  NegHeight: number;
  InnerPartDist: number;
  OuterOffset: number;
  ParticleName: string;
}

export interface EffectAreaPlayerData {
  AroundPartName: string;
  TinyPartName: string;
  PPERequesterType: string;
}

export interface ContaminatedArea {
  AreaName: string;
  Type: string;
  TriggerType: string;
  Data: EffectAreaData;
  PlayerData: EffectAreaPlayerData;
}

export interface EffectAreaConfig {
  Areas: ContaminatedArea[];
  SafePositions: number[][]; // Array of [x, z] coordinates
}

/**
 * cfgenvironment.xml - Animal territories and ambient life
 */
export interface TerritoryFile {
  '@_path'?: string;
  '@_usable'?: string;
}

export interface TerritoryAgent {
  '@_type': string;
  '@_chance': string;
  spawn?: Array<{
    '@_configName': string;
    '@_chance': string;
  }> | {
    '@_configName': string;
    '@_chance': string;
  };
  item?: Array<{
    '@_name': string;
    '@_val': string;
  }> | {
    '@_name': string;
    '@_val': string;
  };
}

export interface Territory {
  '@_type': string;
  '@_name': string;
  '@_behavior': string;
  file?: TerritoryFile | TerritoryFile[];
  agent?: TerritoryAgent | TerritoryAgent[];
  item?: Array<{
    '@_name': string;
    '@_val': string;
  }> | {
    '@_name': string;
    '@_val': string;
  };
}

export interface EnvironmentConfig {
  env: {
    territories: {
      file?: Array<{ '@_path': string }> | { '@_path': string };
      territory?: Territory | Territory[];
    };
  };
}

/**
 * cfgeventgroups.xml - Event group definitions (train wrecks, etc.)
 */
export interface EventGroupChild {
  '@_type': string;
  '@_deloot': string;
  '@_lootmax': string;
  '@_lootmin': string;
  '@_x': string;
  '@_z': string;
  '@_a': string;
  '@_y': string;
}

export interface EventGroup {
  '@_name': string;
  child: EventGroupChild | EventGroupChild[];
}

export interface EventGroupsConfig {
  eventgroupdef: {
    group: EventGroup | EventGroup[];
  };
}

/**
 * cfgeventspawns.xml - Event spawn positions
 */
export interface EventPosition {
  '@_x': string;
  '@_z': string;
  '@_a': string;
}

export interface EventSpawnDefinition {
  '@_name': string;
  pos?: EventPosition | EventPosition[];
}

export interface EventSpawnsConfig {
  eventposdef: {
    event: EventSpawnDefinition | EventSpawnDefinition[];
  };
}

/**
 * cfggameplay.json - Core gameplay mechanics
 */
export interface StaminaData {
  sprintStaminaModifierErc: number;
  sprintStaminaModifierCro: number;
  staminaWeightLimitThreshold: number;
  staminaMax: number;
  staminaKgToStaminaPercentPenalty: number;
  staminaMinCap: number;
  sprintSwimmingStaminaModifier: number;
  sprintLadderStaminaModifier: number;
  meleeStaminaModifier: number;
  obstacleTraversalStaminaModifier: number;
  holdBreathStaminaModifier: number;
}

export interface ShockHandlingData {
  shockRefillSpeedConscious: number;
  shockRefillSpeedUnconscious: number;
  allowRefillSpeedModifier: boolean;
}

export interface MovementData {
  timeToStrafeJog: number;
  rotationSpeedJog: number;
  timeToSprint: number;
  timeToStrafeSprint: number;
  rotationSpeedSprint: number;
  allowStaminaAffectInertia: boolean;
}

export interface DrowningData {
  staminaDepletionSpeed: number;
  healthDepletionSpeed: number;
  shockDepletionSpeed: number;
}

export interface WeaponObstructionData {
  staticMode: number;
  dynamicMode: number;
}

export interface PlayerData {
  disablePersonalLight: boolean;
  StaminaData: StaminaData;
  ShockHandlingData: ShockHandlingData;
  MovementData: MovementData;
  DrowningData: DrowningData;
  WeaponObstructionData: WeaponObstructionData;
}

export interface WorldsData {
  lightingConfig: number;
  objectSpawnersArr: any[];
  environmentMinTemps: number[];
  environmentMaxTemps: number[];
  wetnessWeightModifiers: number[];
}

export interface HologramData {
  disableIsCollidingBBoxCheck: boolean;
  disableIsCollidingPlayerCheck: boolean;
  disableIsClippingRoofCheck: boolean;
  disableIsBaseViableCheck: boolean;
  disableIsCollidingGPlotCheck: boolean;
  disableIsCollidingAngleCheck: boolean;
  disableIsPlacementPermittedCheck: boolean;
  disableHeightPlacementCheck: boolean;
  disableIsUnderwaterCheck: boolean;
  disableIsInTerrainCheck: boolean;
  disableColdAreaBuildingCheck: boolean;
  disallowedTypesInUnderground: string[];
}

export interface ConstructionData {
  disablePerformRoofCheck: boolean;
  disableIsCollidingCheck: boolean;
  disableDistanceCheck: boolean;
}

export interface BaseBuildingData {
  HologramData: HologramData;
  ConstructionData: ConstructionData;
}

export interface HitIndicationData {
  hitDirectionOverrideEnabled: boolean;
  hitDirectionBehaviour: number;
  hitDirectionStyle: number;
  hitDirectionIndicatorColorStr: string;
  hitDirectionMaxDuration: number;
  hitDirectionBreakPointRelative: number;
  hitDirectionScatter: number;
  hitIndicationPostProcessEnabled: boolean;
}

export interface UIData {
  use3DMap: boolean;
  HitIndicationData: HitIndicationData;
}

export interface MapData {
  ignoreMapOwnership: boolean;
  ignoreNavItemsOwnership: boolean;
  displayPlayerPosition: boolean;
  displayNavInfo: boolean;
}

export interface VehicleData {
  boatDecayMultiplier: number;
}

export interface GameplayConfig {
  version: number;
  GeneralData: {
    disableBaseDamage: boolean;
    disableContainerDamage: boolean;
    disableRespawnDialog: boolean;
    disableRespawnInUnconsciousness: boolean;
  };
  PlayerData: PlayerData;
  WorldsData: WorldsData;
  BaseBuildingData: BaseBuildingData;
  UIData: UIData;
  MapData: MapData;
  VehicleData: VehicleData;
}

/**
 * cfgIgnoreList.xml - Items excluded from cleanup
 */
export interface IgnoreListItem {
  '@_name': string;
}

export interface IgnoreListConfig {
  ignore: {
    type: IgnoreListItem | IgnoreListItem[];
  };
}

/**
 * cfgplayerspawnpoints.xml - Player spawn configurations
 */
export interface SpawnParams {
  min_dist_infected: number;
  max_dist_infected: number;
  min_dist_player: number;
  max_dist_player: number;
  min_dist_static: number;
  max_dist_static: number;
}

export interface GeneratorParams {
  grid_density: number;
  grid_width: number;
  grid_height: number;
  min_dist_static: number;
  max_dist_static: number;
  min_steepness: number;
  max_steepness: number;
}

export interface GroupParams {
  enablegroups: boolean;
  groups_as_regular: boolean;
  lifetime: number;
  counter: number;
}

export interface SpawnPosition {
  '@_x': string;
  '@_z': string;
}

export interface SpawnGroup {
  '@_name': string;
  pos: SpawnPosition | SpawnPosition[];
}

export interface SpawnConfiguration {
  spawn_params: SpawnParams;
  generator_params: GeneratorParams;
  group_params: GroupParams;
  generator_posbubbles: {
    group: SpawnGroup | SpawnGroup[];
  };
}

export interface PlayerSpawnPointsConfig {
  playerspawnpoints: {
    fresh: SpawnConfiguration;
    hop: SpawnConfiguration;
    travel: SpawnConfiguration;
  };
}

/**
 * cfgrandompresets.xml - Loot presets
 */
export interface RandomPresetItem {
  '@_name': string;
  '@_chance': string;
}

export interface RandomPreset {
  '@_chance': string;
  '@_name': string;
  item: RandomPresetItem | RandomPresetItem[];
}

export interface RandomPresetsConfig {
  randompresets: {
    cargo?: RandomPreset | RandomPreset[];
    attachments?: RandomPreset | RandomPreset[];
  };
}

/**
 * cfgundergroundtriggers.json - Underground area triggers
 */
export interface UndergroundTriggersConfig {
  Triggers: any[];
}

/**
 * cfgweather.xml - Weather system configuration
 */
export interface WeatherParameter {
  current: {
    '@_actual': string;
    '@_time': string;
    '@_duration': string;
  };
  limits: {
    '@_min': string;
    '@_max': string;
  };
  timelimits: {
    '@_min': string;
    '@_max': string;
  };
  changelimits: {
    '@_min': string;
    '@_max': string;
  };
  thresholds?: {
    '@_min': string;
    '@_max': string;
    '@_end': string;
  };
}

export interface WeatherStorm {
  '@_density': string;
  '@_threshold': string;
  '@_timeout': string;
}

export interface WeatherConfig {
  weather: {
    '@_reset': string;
    '@_enable': string;
    overcast: WeatherParameter;
    fog: WeatherParameter;
    rain: WeatherParameter;
    windMagnitude: WeatherParameter;
    windDirection: WeatherParameter;
    snowfall: WeatherParameter;
    storm: WeatherStorm;
  };
}

/**
 * Territory Files (env/ folder) - Animal spawn zones
 */
export interface TerritoryZone {
  '@_smin'?: string;
  '@_smax'?: string;
  '@_dmin'?: string;
  '@_dmax'?: string;
  '@_x'?: string;
  '@_z'?: string;
  '@_r'?: string;
  '#text'?: string;
}

export interface TerritoryConfig {
  territory: {
    zone?: TerritoryZone | TerritoryZone[];
  };
}

export type TerritoryFileType =
  | 'wolf_territories'
  | 'bear_territories'
  | 'cattle_territories'
  | 'domestic_animals_territories'
  | 'fox_territories'
  | 'hare_territories'
  | 'hen_territories'
  | 'pig_territories'
  | 'red_deer_territories'
  | 'roe_deer_territories'
  | 'sheep_goat_territories'
  | 'wild_boar_territories'
  | 'zombie_territories';

/**
 * Database Files (db/ folder) - Server core configuration
 */

/**
 * db/globals.xml - Global server variables
 */
export interface GlobalVariable {
  '@_name': string;
  '@_type': '0' | '1'; // 0 = integer, 1 = float/decimal
  '@_value': string;
}

export interface GlobalsConfig {
  variables: {
    var: GlobalVariable | GlobalVariable[];
  };
}

export type GlobalVariableName =
  | 'AnimalMaxCount'
  | 'CleanupAvoidance'
  | 'CleanupLifetimeDeadAnimal'
  | 'CleanupLifetimeDeadInfected'
  | 'CleanupLifetimeDeadPlayer'
  | 'CleanupLifetimeDefault'
  | 'CleanupLifetimeLimit'
  | 'CleanupLifetimeRuined'
  | 'FlagRefreshFrequency'
  | 'FlagRefreshMaxDuration'
  | 'FoodDecay'
  | 'IdleModeCountdown'
  | 'IdleModeStartup'
  | 'InitialSpawn'
  | 'LootDamageMax'
  | 'LootDamageMin'
  | 'LootProxyPlacement'
  | 'LootSpawnAvoidance'
  | 'RespawnAttempt'
  | 'RespawnLimit'
  | 'RespawnTypes'
  | 'RestartSpawn'
  | 'SpawnInitial'
  | 'TimeHopping'
  | 'TimeLogin'
  | 'TimeLogout'
  | 'TimePenalty'
  | 'WorldWetTempUpdate'
  | 'ZombieMaxCount'
  | 'ZoneSpawnDist';

/**
 * db/messages.xml - Server message configuration
 */
export interface ServerMessage {
  deadline?: string | number;  // Minutes until shutdown (countdown)
  shutdown?: '0' | '1';        // Whether message triggers shutdown
  repeat?: string | number;    // Repeat interval in minutes
  delay?: string | number;     // Delay before first display
  onconnect?: '0' | '1';       // Show on player connect
  text: string;                // Message text (supports #name, #tmin variables)
}

export interface MessagesConfig {
  messages: {
    message?: ServerMessage | ServerMessage[];
  };
}

/**
 * Unified file type detector
 */
export type DayZConfigFileType = 
  | 'types'
  | 'events'
  | 'spawnable'
  | 'economy'
  | 'effectarea'
  | 'environment'
  | 'eventgroups'
  | 'eventspawns'
  | 'gameplay'
  | 'ignorelist'
  | 'spawnpoints'
  | 'randompresets'
  | 'undergroundtriggers'
  | 'weather'
  | 'territory'
  | 'globals'
  | 'messages'
  | 'mapgroupproto'
  | 'mapgrouppos'
  | 'mapgroupcluster'
  | 'mapgroupdirt'
  | 'limitsdefinition'
  | 'limitsdefinitionuser'
  | 'dbeconomy'
  | 'initc'
  | 'unknown';

/**
 * Unified import result for all config types
 */
export interface ConfigFileImportResult {
  success: boolean;
  fileType: DayZConfigFileType;
  data?: any;
  itemCount?: number;
  errors?: string[];
  warnings?: string[];
}

/**
 * ========================
 * Map Group System Files
 * ========================
 */

/**
 * mapgroupproto.xml - Defines loot spawn points in buildings/objects
 */
export interface MapGroupProtoPoint {
  '@_pos': string;           // 3D position "x y z"
  '@_range': string;         // Spawn radius
  '@_height': string;        // Spawn height
  '@_flags': string;         // Flags (typically "32")
}

export interface MapGroupProtoContainer {
  '@_name': string;          // Container name (e.g., "lootFloor", "lootShelves")
  '@_lootmax': string;       // Max items in container
  category?: Array<{ '@_name': string }> | { '@_name': string };  // Loot categories
  tag?: Array<{ '@_name': string }> | { '@_name': string };       // Tags (floor, shelves, ground)
  point?: MapGroupProtoPoint | MapGroupProtoPoint[];              // Spawn points
}

export interface MapGroupProtoGroup {
  '@_name': string;          // Building/object classname
  '@_lootmax': string;       // Max items in group
  usage?: Array<{ '@_name': string }> | { '@_name': string };     // Usage flags (Military, Farm, etc.)
  container?: MapGroupProtoContainer | MapGroupProtoContainer[];  // Loot containers
}

export interface MapGroupProtoDefaults {
  default: Array<{
    '@_name': string;
    '@_lootmax'?: string;
    '@_enabled'?: string;
    '@_de'?: string;
    '@_width'?: string;
    '@_height'?: string;
  }> | {
    '@_name': string;
    '@_lootmax'?: string;
    '@_enabled'?: string;
    '@_de'?: string;
    '@_width'?: string;
    '@_height'?: string;
  };
}

export interface MapGroupProtoConfig {
  prototype: {
    defaults?: MapGroupProtoDefaults;
    group: MapGroupProtoGroup | MapGroupProtoGroup[];
  };
}

/**
 * mapgrouppos.xml - Positions of loot groups in the world
 */
export interface MapGroupPosEntry {
  '@_name': string;          // Group name (matches mapgroupproto.xml)
  '@_pos': string;           // World position "x y z"
  '@_rpy'?: string;          // Rotation pitch yaw
  '@_a': string;             // Angle/azimuth
}

export interface MapGroupPosConfig {
  map: {
    group: MapGroupPosEntry | MapGroupPosEntry[];
  };
}

/**
 * mapgroupcluster.xml - Regional loot clustering (same structure as mapgrouppos)
 */
export type MapGroupClusterConfig = MapGroupPosConfig;

/**
 * cfglimitsdefinition.xml - Item limit definitions
 */
export interface LimitsCategory {
  '@_name': string;          // Category name (tools, weapons, etc.)
}

export interface LimitsTag {
  '@_name': string;          // Tag name (floor, shelves, ground)
}

export interface LimitsUsage {
  '@_name': string;          // Usage flag (Military, Police, etc.)
}

export interface LimitsValue {
  '@_name': string;          // Value flag (Tier1-4, Unique)
}

export interface LimitsDefinitionConfig {
  lists: {
    categories?: {
      category: LimitsCategory | LimitsCategory[];
    };
    tags?: {
      tag: LimitsTag | LimitsTag[];
    };
    usageflags?: {
      usage: LimitsUsage | LimitsUsage[];
    };
    valueflags?: {
      value: LimitsValue | LimitsValue[];
    };
  };
}

/**
 * cfglimitsdefinitionuser.xml - User-defined custom limits (same structure)
 */
export type LimitsDefinitionUserConfig = LimitsDefinitionConfig;

/**
 * db/economy.xml - Central economy controller
 */
export interface EconomySystemConfig {
  '@_init': '0' | '1';       // Initialize system
  '@_load': '0' | '1';       // Load from save
  '@_respawn': '0' | '1';    // Allow respawning
  '@_save': '0' | '1';       // Save state
}

export interface DBEconomyConfig {
  economy: {
    dynamic?: EconomySystemConfig;    // Dynamic events
    animals?: EconomySystemConfig;    // Animal spawning
    zombies?: EconomySystemConfig;    // Zombie spawning
    vehicles?: EconomySystemConfig;   // Vehicle spawning
    randoms?: EconomySystemConfig;    // Random spawns
    custom?: EconomySystemConfig;     // Custom spawns
    building?: EconomySystemConfig;   // Building persistence
    player?: EconomySystemConfig;     // Player persistence
  };
}

/**
 * init.c - Server initialization script (parsed as text)
 */
export interface InitCConfig {
  rawContent: string;                 // Full C++ code
  dateReset?: {                       // Extracted date reset config
    month: number;
    day: number;
  };
  startingEquipment?: string[];       // Extracted starting items
  customSettings?: Record<string, any>;  // Other extracted settings
}
