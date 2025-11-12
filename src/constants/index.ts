/**
 * DayZ item categories with descriptions
 */
export const ITEM_CATEGORIES = {
  weapons: { label: 'Weapons', color: 'red', icon: '🔫' },
  optics: { label: 'Optics', color: 'cyan', icon: '🔭' },
  explosives: { label: 'Explosives', color: 'orange', icon: '💣' },
  tools: { label: 'Tools', color: 'blue', icon: '🔧' },
  vehiclesparts: { label: 'Vehicle Parts', color: 'purple', icon: '🚗' },
  clothes: { label: 'Clothes', color: 'green', icon: '👕' },
  food: { label: 'Food', color: 'yellow', icon: '🍖' },
  containers: { label: 'Containers', color: 'gray', icon: '🎒' },
} as const;

/**
 * DayZ tier levels
 */
export const TIER_LEVELS = ['Tier1', 'Tier2', 'Tier3', 'Tier4'] as const;

/**
 * DayZ item usage locations
 */
export const USAGE_LOCATIONS = [
  'Military',
  'Medic',
  'Firefighter',
  'Police',
  'Industrial',
  'Farm',
  'Coast',
  'Town',
  'Village',
  'Hunting',
  'School',
  'Office',
  'Prison',
] as const;

/**
 * Item flag options
 */
export const ITEM_FLAGS = {
  count_in_cargo: { label: 'Count in Cargo', description: 'Count items stored in vehicles/containers' },
  count_in_hoarder: { label: 'Count in Hoarder', description: 'Count items in buried stashes' },
  count_in_map: { label: 'Count in Map', description: 'Count items placed in the world' },
  count_in_player: { label: 'Count in Player', description: 'Count items in player inventory' },
  crafted: { label: 'Crafted', description: 'Item can be crafted' },
  deloot: { label: 'Deloot', description: 'Remove from loot spawns' },
} as const;

/**
 * Default item template
 */
export const DEFAULT_ITEM = {
  name: 'NewItem',
  nominal: 10,
  lifetime: 3600,
  restock: 300,
  min: 5,
  quantmin: -1,
  quantmax: -1,
  cost: 100,
  flags: {
    count_in_cargo: '0',
    count_in_hoarder: '0',
    count_in_map: '1',
    count_in_player: '0',
    crafted: '0',
    deloot: '0',
  },
  category: null,
  usage: [],
  value: [],
  tag: [],
} as const;

/**
 * Recommended lifetime values (in seconds)
 */
export const LIFETIME_PRESETS = {
  'Very Short (5 min)': 300,
  'Short (15 min)': 900,
  'Medium (1 hour)': 3600,
  'Long (2 hours)': 7200,
  'Very Long (4 hours)': 14400,
  'Persistent (8 hours)': 28800,
} as const;

/**
 * Recommended restock values (in seconds)
 */
export const RESTOCK_PRESETS = {
  'Very Fast (1 min)': 60,
  'Fast (5 min)': 300,
  'Medium (10 min)': 600,
  'Slow (20 min)': 1200,
  'Very Slow (30 min)': 1800,
} as const;

/**
 * File type configurations
 */
export const FILE_TYPES = {
  types: {
    label: 'Types.xml',
    description: 'Main item configuration file',
    icon: '📄',
    extensions: ['.xml'],
  },
  events: {
    label: 'Events.xml',
    description: 'Dynamic event configurations',
    icon: '🎯',
    extensions: ['.xml'],
  },
  spawnable: {
    label: 'Spawnable Types',
    description: 'Item attachment and cargo configurations',
    icon: '🎒',
    extensions: ['.xml'],
  },
  economy: {
    label: 'Economy.xml',
    description: 'Core economy settings',
    icon: '⚙️',
    extensions: ['.xml'],
  },
} as const;

/**
 * Validation severity levels
 */
export const VALIDATION_SEVERITY = {
  error: { label: 'Error', color: 'red', icon: '❌' },
  warning: { label: 'Warning', color: 'yellow', icon: '⚠️' },
  info: { label: 'Info', color: 'blue', icon: 'ℹ️' },
  success: { label: 'Success', color: 'green', icon: '✅' },
} as const;

/**
 * Keyboard shortcuts
 */
export const KEYBOARD_SHORTCUTS = {
  save: { key: 'Ctrl+S', mac: 'Cmd+S', description: 'Save changes' },
  search: { key: 'Ctrl+F', mac: 'Cmd+F', description: 'Search items' },
  newItem: { key: 'Ctrl+N', mac: 'Cmd+N', description: 'Create new item' },
  delete: { key: 'Delete', mac: 'Delete', description: 'Delete selected item' },
  undo: { key: 'Ctrl+Z', mac: 'Cmd+Z', description: 'Undo last change' },
  redo: { key: 'Ctrl+Y', mac: 'Cmd+Shift+Z', description: 'Redo change' },
} as const;
