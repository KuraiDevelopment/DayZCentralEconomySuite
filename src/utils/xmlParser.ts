import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import type {
  DayZItem,
  TypesXMLRoot,
  EventsXMLRoot,
  SpawnableTypesXMLRoot,
  EconomyXMLRoot,
  FileImportResult,
} from '@/types/dayz';

/**
 * XML Parser configuration for DayZ files
 */
const parserOptions = {
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  parseAttributeValue: false,
  parseTagValue: true,
  trimValues: true,
  cdataPropName: '__cdata',
  commentPropName: '__comment',
  ignoreDeclaration: false,
  ignorePiTags: false,
  arrayMode: false,
};

const builderOptions = {
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  format: true,
  indentBy: '    ',
  suppressEmptyNode: true,
  suppressBooleanAttributes: false,
  suppressUnpairedNode: false,
};

/**
 * Validate XML well-formedness before parsing
 * Lightweight validation for DayZ configuration files
 * Uses the XML parser's built-in validation for most checks to avoid false positives
 */
function validateXMLStructure(xmlContent: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // VALIDATION 1: Check for empty or whitespace-only content
  if (!xmlContent || xmlContent.trim().length === 0) {
    errors.push('File is empty or contains only whitespace.');
    return { valid: false, errors };
  }

  // VALIDATION 2: Basic sanity check - file should contain at least one XML tag
  if (!xmlContent.includes('<') || !xmlContent.includes('>')) {
    errors.push('File does not appear to contain valid XML tags.');
    return { valid: false, errors };
  }

  // That's it! Let the robust XML parser (fast-xml-parser) handle the rest.
  // It will catch:
  // - Malformed tags
  // - Mismatched opening/closing tags
  // - Invalid attributes
  // - Unclosed comments
  // - Invalid characters
  // - Any other XML structure issues
  //
  // This approach avoids false positives from overly strict pre-validation
  // while still catching genuinely invalid files.

  return { valid: true, errors };
}

/**
 * Additional type-based validation helper
 * Returns error messages specific to each file type
 */
function getTypeSpecificValidationErrors(fileType: string, data: any): string[] {
  const errors: string[] = [];
  
  // File type specific validation can be added here if needed
  // For now, we trust the parser to handle structure validation
  
  return errors;
}

/**
 * Normalize parsed item to ensure proper data types
 */
function normalizeItem(item: any): DayZItem {
  // Extract name from attribute if present
  const name = item['@_name'] || item.name;
  
  // Extract category name if it's an object
  const category = item.category 
    ? (typeof item.category === 'object' && item.category !== null && '@_name' in item.category
        ? item.category['@_name']
        : typeof item.category === 'object' && item.category !== null && 'name' in item.category
        ? item.category.name
        : item.category)
    : null;

  // Extract usage names if they're objects
  let usage: string[] | undefined;
  if (item.usage) {
    if (Array.isArray(item.usage)) {
      usage = item.usage.map((u: any) => 
        typeof u === 'object' && u !== null && '@_name' in u ? u['@_name'] :
        typeof u === 'object' && u !== null && 'name' in u ? u.name : u
      );
    } else if (typeof item.usage === 'object' && item.usage !== null) {
      const usageName = item.usage['@_name'] || item.usage.name;
      usage = usageName ? [usageName] : undefined;
    } else {
      usage = [item.usage];
    }
  }

  // Extract value/tier names if they're objects
  let value: string[] | undefined;
  if (item.value) {
    if (Array.isArray(item.value)) {
      value = item.value.map((v: any) => 
        typeof v === 'object' && v !== null && '@_name' in v ? v['@_name'] :
        typeof v === 'object' && v !== null && 'name' in v ? v.name : v
      );
    } else if (typeof item.value === 'object' && item.value !== null) {
      const valueName = item.value['@_name'] || item.value.name;
      value = valueName ? [valueName] : undefined;
    } else {
      value = [item.value];
    }
  }

  // Extract flags - they might be attributes on the flags element
  let flags: any = {};
  if (item.flags) {
    if (typeof item.flags === 'object') {
      // Extract all @_ prefixed attributes
      Object.keys(item.flags).forEach(key => {
        if (key.startsWith('@_')) {
          const flagName = key.substring(2);
          flags[flagName] = item.flags[key];
        }
      });
    }
  }

  return {
    name,
    nominal: parseInt(item.nominal) || 0,
    lifetime: parseInt(item.lifetime) || 0,
    restock: parseInt(item.restock) || 0,
    min: parseInt(item.min) || 0,
    quantmin: parseInt(item.quantmin) || -1,
    quantmax: parseInt(item.quantmax) || -1,
    cost: parseInt(item.cost) || 0,
    flags: Object.keys(flags).length > 0 ? flags : undefined,
    category,
    usage: usage as any,
    value: value as any,
  };
}

/**
 * Parse types.xml file
 */
export function parseTypesXML(xmlContent: string): FileImportResult {
  try {
    // Validate XML structure first
    const validation = validateXMLStructure(xmlContent);
    if (!validation.valid) {
      return {
        success: false,
        itemCount: 0,
        errors: validation.errors,
      };
    }

    const parser = new XMLParser(parserOptions);
    const result = parser.parse(xmlContent) as TypesXMLRoot;

    if (!result.types || !result.types.type) {
      return {
        success: false,
        itemCount: 0,
        errors: ['Invalid types.xml structure: missing <types> or <type> elements'],
      };
    }

    const rawItems = Array.isArray(result.types.type)
      ? result.types.type
      : [result.types.type];

    // Normalize all items
    const items = rawItems.map(normalizeItem);

    return {
      success: true,
      itemCount: items.length,
      data: items,
    };
  } catch (error) {
    return {
      success: false,
      itemCount: 0,
      errors: [`Failed to parse XML: ${error instanceof Error ? error.message : 'Unknown error'}`],
    };
  }
}

/**
 * Parse events.xml file
 */
export function parseEventsXML(xmlContent: string): FileImportResult {
  try {
    const parser = new XMLParser(parserOptions);
    const result = parser.parse(xmlContent) as EventsXMLRoot;

    if (!result.events || !result.events.event) {
      return {
        success: false,
        itemCount: 0,
        errors: ['Invalid events.xml structure: missing <events> or <event> elements'],
      };
    }

    const events = Array.isArray(result.events.event)
      ? result.events.event
      : [result.events.event];

    return {
      success: true,
      itemCount: events.length,
      data: events,
    };
  } catch (error) {
    return {
      success: false,
      itemCount: 0,
      errors: [`Failed to parse XML: ${error instanceof Error ? error.message : 'Unknown error'}`],
    };
  }
}

/**
 * Parse spawnable_types.xml file
 */
/**
 * Parse spawnable types XML file (cfgspawnabletypes.xml)
 */
export function parseSpawnableTypesXML(xmlContent: string): FileImportResult {
  try {
    // Validate XML structure first
    const validation = validateXMLStructure(xmlContent);
    if (!validation.valid) {
      return {
        success: false,
        itemCount: 0,
        errors: validation.errors,
      };
    }

    const parser = new XMLParser(parserOptions);
    const result = parser.parse(xmlContent) as SpawnableTypesXMLRoot;

    if (!result.spawnabletypes || !result.spawnabletypes.type) {
      return {
        success: false,
        itemCount: 0,
        errors: ['Invalid cfgspawnabletypes.xml structure'],
      };
    }

    const items = Array.isArray(result.spawnabletypes.type)
      ? result.spawnabletypes.type
      : [result.spawnabletypes.type];

    return {
      success: true,
      itemCount: items.length,
      data: items,
    };
  } catch (error) {
    return {
      success: false,
      itemCount: 0,
      errors: [`Failed to parse XML: ${error instanceof Error ? error.message : 'Unknown error'}`],
    };
  }
}

/**
 * Parse economy core XML file (cfgeconomycore.xml)
 */
export function parseEconomyXML(xmlContent: string): FileImportResult {
  try {
    // Validate XML structure first
    const validation = validateXMLStructure(xmlContent);
    if (!validation.valid) {
      return {
        success: false,
        itemCount: 0,
        errors: validation.errors,
      };
    }

    const parser = new XMLParser(parserOptions);
    const result = parser.parse(xmlContent) as EconomyXMLRoot;

    if (!result.economycore) {
      return {
        success: false,
        itemCount: 0,
        errors: ['Invalid cfgeconomycore.xml structure: missing <economycore> root element'],
      };
    }

    // Validate required sections
    const errors: string[] = [];
    
    if (!result.economycore.classes) {
      errors.push('Missing required <classes> section');
    } else if (!result.economycore.classes.rootclass) {
      errors.push('Missing <rootclass> entries in <classes> section');
    }

    if (!result.economycore.defaults) {
      errors.push('Missing required <defaults> section');
    } else if (!result.economycore.defaults.default) {
      errors.push('Missing <default> entries in <defaults> section');
    }

    // Validate rootclass entries have required attributes
    if (result.economycore.classes?.rootclass) {
      const rootclasses = Array.isArray(result.economycore.classes.rootclass)
        ? result.economycore.classes.rootclass
        : [result.economycore.classes.rootclass];
      
      rootclasses.forEach((rc: any, idx: number) => {
        if (!rc['@_name']) {
          errors.push(`Rootclass at index ${idx} is missing required 'name' attribute`);
        }
      });
    }

    // Validate default entries have required attributes
    if (result.economycore.defaults?.default) {
      const defaults = Array.isArray(result.economycore.defaults.default)
        ? result.economycore.defaults.default
        : [result.economycore.defaults.default];
      
      defaults.forEach((def: any, idx: number) => {
        if (!def['@_name']) {
          errors.push(`Default at index ${idx} is missing required 'name' attribute`);
        }
        if (!def['@_value']) {
          errors.push(`Default at index ${idx} is missing required 'value' attribute`);
        }
      });
    }

    if (errors.length > 0) {
      return {
        success: false,
        itemCount: 0,
        errors,
      };
    }

    return {
      success: true,
      itemCount: 1,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: [result.economycore as any],
    };
  } catch (error) {
    return {
      success: false,
      itemCount: 0,
      errors: [`Failed to parse XML: ${error instanceof Error ? error.message : 'Unknown error'}`],
    };
  }
}

/**
 * Build types.xml from items array
 */
export function buildTypesXML(items: DayZItem[]): string {
  const builder = new XMLBuilder(builderOptions);
  
  // Transform items to match DayZ XML structure
  const transformedItems = items.map(item => {
    const xmlItem: any = {
      '@_name': item.name,
      nominal: item.nominal,
      lifetime: item.lifetime,
      restock: item.restock,
      min: item.min,
      quantmin: item.quantmin,
      quantmax: item.quantmax,
      cost: item.cost,
    };

    // Add flags as attributes (only if flags exist and have values)
    if (item.flags) {
      const flagEntries = Object.entries(item.flags).filter(([_, value]) => value !== undefined);
      if (flagEntries.length > 0) {
        xmlItem.flags = {};
        flagEntries.forEach(([key, value]) => {
          xmlItem.flags[`@_${key}`] = value;
        });
      }
    }

    // Add category with name attribute (only if defined)
    if (item.category) {
      xmlItem.category = { '@_name': item.category };
    }

    // Add usage elements with name attributes (only if array has items)
    if (item.usage && item.usage.length > 0) {
      xmlItem.usage = item.usage.map(u => ({ '@_name': u }));
    }

    // Add value elements with name attributes (only if array has items)
    if (item.value && item.value.length > 0) {
      xmlItem.value = item.value.map(v => ({ '@_name': v }));
    }

    return xmlItem;
  });

  const xmlData = {
    '?xml': {
      '@_version': '1.0',
      '@_encoding': 'UTF-8',
      '@_standalone': 'yes'
    },
    types: {
      type: transformedItems,
    },
  };

  return builder.build(xmlData);
}

/**
 * Build events.xml from events array
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildEventsXML(events: any[]): string {
  const builder = new XMLBuilder(builderOptions);
  
  const xmlData: EventsXMLRoot = {
    events: {
      event: events,
    },
  };

  const xmlString = builder.build(xmlData);
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n${xmlString}`;
}

/**
 * Detect XML file type based on content
 */
export function detectXMLType(xmlContent: string): 'types' | 'events' | 'spawnable' | 'economy' | 'unknown' {
  if (xmlContent.includes('<types>')) return 'types';
  if (xmlContent.includes('<events>')) return 'events';
  if (xmlContent.includes('<spawnabletypes>')) return 'spawnable';
  if (xmlContent.includes('<economycore>')) return 'economy';
  return 'unknown';
}

/**
 * Generic XML parser that auto-detects file type
 */
export function parseXMLFile(xmlContent: string): FileImportResult & { fileType: string } {
  const fileType = detectXMLType(xmlContent);
  
  let result: FileImportResult;
  
  switch (fileType) {
    case 'types':
      result = parseTypesXML(xmlContent);
      break;
    case 'events':
      result = parseEventsXML(xmlContent);
      break;
    case 'spawnable':
      result = parseSpawnableTypesXML(xmlContent);
      break;
    case 'economy':
      result = parseEconomyXML(xmlContent);
      break;
    default:
      result = {
        success: false,
        itemCount: 0,
        errors: ['Unknown XML file type'],
      };
  }
  
  return { ...result, fileType };
}

/**
 * ========================
 * Additional Configuration File Parsers
 * ========================
 */

/**
 * Parse cfgEffectArea.json
 */
export function parseEffectAreaJSON(jsonContent: string): { success: boolean; data?: any; errors?: string[] } {
  try {
    const data = JSON.parse(jsonContent);
    
    if (!data.Areas || !Array.isArray(data.Areas)) {
      return {
        success: false,
        errors: ['Invalid cfgEffectArea.json: Missing or invalid Areas array'],
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      errors: [`Failed to parse JSON: ${error instanceof Error ? error.message : 'Unknown error'}`],
    };
  }
}

/**
 * Parse cfgenvironment.xml
 */
export function parseEnvironmentXML(xmlContent: string): { success: boolean; data?: any; errors?: string[] } {
  try {
    const validation = validateXMLStructure(xmlContent);
    if (!validation.valid) {
      return {
        success: false,
        errors: validation.errors,
      };
    }

    const parser = new XMLParser(parserOptions);
    const parsed = parser.parse(xmlContent);

    if (!parsed.env || !parsed.env.territories) {
      return {
        success: false,
        errors: ['Invalid cfgenvironment.xml: Missing env or territories section'],
      };
    }

    return {
      success: true,
      data: parsed,
    };
  } catch (error) {
    return {
      success: false,
      errors: [`Failed to parse XML: ${error instanceof Error ? error.message : 'Unknown error'}`],
    };
  }
}

/**
 * Parse cfgeventgroups.xml
 */
export function parseEventGroupsXML(xmlContent: string): { success: boolean; data?: any; errors?: string[] } {
  try {
    const validation = validateXMLStructure(xmlContent);
    if (!validation.valid) {
      return {
        success: false,
        errors: validation.errors,
      };
    }

    const parser = new XMLParser(parserOptions);
    const parsed = parser.parse(xmlContent);

    if (!parsed.eventgroupdef) {
      return {
        success: false,
        errors: ['Invalid cfgeventgroups.xml: Missing eventgroupdef root element'],
      };
    }

    return {
      success: true,
      data: parsed,
    };
  } catch (error) {
    return {
      success: false,
      errors: [`Failed to parse XML: ${error instanceof Error ? error.message : 'Unknown error'}`],
    };
  }
}

/**
 * Parse cfgeventspawns.xml
 */
export function parseEventSpawnsXML(xmlContent: string): { success: boolean; data?: any; errors?: string[] } {
  try {
    const validation = validateXMLStructure(xmlContent);
    if (!validation.valid) {
      return {
        success: false,
        errors: validation.errors,
      };
    }

    const parser = new XMLParser(parserOptions);
    const parsed = parser.parse(xmlContent);

    if (!parsed.eventposdef) {
      return {
        success: false,
        errors: ['Invalid cfgeventspawns.xml: Missing eventposdef root element'],
      };
    }

    return {
      success: true,
      data: parsed,
    };
  } catch (error) {
    return {
      success: false,
      errors: [`Failed to parse XML: ${error instanceof Error ? error.message : 'Unknown error'}`],
    };
  }
}

/**
 * Parse cfggameplay.json
 */
export function parseGameplayJSON(jsonContent: string): { success: boolean; data?: any; errors?: string[] } {
  try {
    const data = JSON.parse(jsonContent);
    
    if (!data.version || !data.PlayerData || !data.WorldsData) {
      return {
        success: false,
        errors: ['Invalid cfggameplay.json: Missing required sections (version, PlayerData, or WorldsData)'],
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      errors: [`Failed to parse JSON: ${error instanceof Error ? error.message : 'Unknown error'}`],
    };
  }
}

/**
 * Parse cfgIgnoreList.xml
 */
export function parseIgnoreListXML(xmlContent: string): { success: boolean; data?: any; errors?: string[] } {
  try {
    const validation = validateXMLStructure(xmlContent);
    if (!validation.valid) {
      return {
        success: false,
        errors: validation.errors,
      };
    }

    const parser = new XMLParser(parserOptions);
    const parsed = parser.parse(xmlContent);

    if (!parsed.ignore) {
      return {
        success: false,
        errors: ['Invalid cfgIgnoreList.xml: Missing ignore root element'],
      };
    }

    return {
      success: true,
      data: parsed,
    };
  } catch (error) {
    return {
      success: false,
      errors: [`Failed to parse XML: ${error instanceof Error ? error.message : 'Unknown error'}`],
    };
  }
}

/**
 * Parse cfgplayerspawnpoints.xml
 */
export function parseSpawnPointsXML(xmlContent: string): { success: boolean; data?: any; errors?: string[] } {
  try {
    const validation = validateXMLStructure(xmlContent);
    if (!validation.valid) {
      return {
        success: false,
        errors: validation.errors,
      };
    }

    const parser = new XMLParser(parserOptions);
    const parsed = parser.parse(xmlContent);

    if (!parsed.playerspawnpoints) {
      return {
        success: false,
        errors: ['Invalid cfgplayerspawnpoints.xml: Missing playerspawnpoints root element'],
      };
    }

    return {
      success: true,
      data: parsed,
    };
  } catch (error) {
    return {
      success: false,
      errors: [`Failed to parse XML: ${error instanceof Error ? error.message : 'Unknown error'}`],
    };
  }
}

/**
 * Parse cfgrandompresets.xml
 */
export function parseRandomPresetsXML(xmlContent: string): { success: boolean; data?: any; errors?: string[] } {
  try {
    const validation = validateXMLStructure(xmlContent);
    if (!validation.valid) {
      return {
        success: false,
        errors: validation.errors,
      };
    }

    const parser = new XMLParser(parserOptions);
    const parsed = parser.parse(xmlContent);

    if (!parsed.randompresets) {
      return {
        success: false,
        errors: ['Invalid cfgrandompresets.xml: Missing randompresets root element'],
      };
    }

    return {
      success: true,
      data: parsed,
    };
  } catch (error) {
    return {
      success: false,
      errors: [`Failed to parse XML: ${error instanceof Error ? error.message : 'Unknown error'}`],
    };
  }
}

/**
 * Parse cfgundergroundtriggers.json
 */
export function parseUndergroundTriggersJSON(jsonContent: string): { success: boolean; data?: any; errors?: string[] } {
  try {
    const data = JSON.parse(jsonContent);
    
    if (!data.Triggers || !Array.isArray(data.Triggers)) {
      return {
        success: false,
        errors: ['Invalid cfgundergroundtriggers.json: Missing or invalid Triggers array'],
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      errors: [`Failed to parse JSON: ${error instanceof Error ? error.message : 'Unknown error'}`],
    };
  }
}

/**
 * Parse cfgweather.xml
 */
export function parseWeatherXML(xmlContent: string): { success: boolean; data?: any; errors?: string[] } {
  try {
    const validation = validateXMLStructure(xmlContent);
    if (!validation.valid) {
      return {
        success: false,
        errors: validation.errors,
      };
    }

    const parser = new XMLParser(parserOptions);
    const parsed = parser.parse(xmlContent);

    if (!parsed.weather) {
      return {
        success: false,
        errors: ['Invalid cfgweather.xml: Missing weather root element'],
      };
    }

    return {
      success: true,
      data: parsed,
    };
  } catch (error) {
    return {
      success: false,
      errors: [`Failed to parse XML: ${error instanceof Error ? error.message : 'Unknown error'}`],
    };
  }
}

/**
 * Parse territory files (env/ folder)
 * Examples: wolf_territories.xml, bear_territories.xml, cattle_territories.xml, etc.
 */
export function parseTerritoryXML(xmlContent: string): { success: boolean; data?: any; errors?: string[]; zoneCount?: number } {
  try {
    const validation = validateXMLStructure(xmlContent);
    if (!validation.valid) {
      return {
        success: false,
        errors: validation.errors,
      };
    }

    const parser = new XMLParser(parserOptions);
    const parsed = parser.parse(xmlContent);

    if (!parsed.territory) {
      return {
        success: false,
        errors: ['Invalid territory file: Missing territory root element'],
      };
    }

    // Count zones for reporting
    let zoneCount = 0;
    if (parsed.territory.zone) {
      zoneCount = Array.isArray(parsed.territory.zone) ? parsed.territory.zone.length : 1;
    }

    return {
      success: true,
      data: parsed,
      zoneCount,
    };
  } catch (error) {
    return {
      success: false,
      errors: [`Failed to parse XML: ${error instanceof Error ? error.message : 'Unknown error'}`],
    };
  }
}

/**
 * Parse db/globals.xml - Global server variables
 */
export function parseGlobalsXML(xmlContent: string): { success: boolean; data?: any; errors?: string[]; varCount?: number } {
  try {
    const validation = validateXMLStructure(xmlContent);
    if (!validation.valid) {
      return {
        success: false,
        errors: validation.errors,
      };
    }

    const parser = new XMLParser(parserOptions);
    const parsed = parser.parse(xmlContent);

    if (!parsed.variables) {
      return {
        success: false,
        errors: ['Invalid globals.xml: Missing variables root element'],
      };
    }

    // Count variables for reporting
    let varCount = 0;
    if (parsed.variables.var) {
      varCount = Array.isArray(parsed.variables.var) ? parsed.variables.var.length : 1;
    }

    return {
      success: true,
      data: parsed,
      varCount,
    };
  } catch (error) {
    return {
      success: false,
      errors: [`Failed to parse XML: ${error instanceof Error ? error.message : 'Unknown error'}`],
    };
  }
}

/**
 * Parse db/messages.xml - Server message configuration
 */
export function parseMessagesXML(xmlContent: string): { success: boolean; data?: any; errors?: string[]; messageCount?: number } {
  try {
    const validation = validateXMLStructure(xmlContent);
    if (!validation.valid) {
      return {
        success: false,
        errors: validation.errors,
      };
    }

    const parser = new XMLParser(parserOptions);
    const parsed = parser.parse(xmlContent);

    if (!parsed.messages) {
      return {
        success: false,
        errors: ['Invalid messages.xml: Missing messages root element'],
      };
    }

    // Count messages for reporting
    let messageCount = 0;
    if (parsed.messages.message) {
      messageCount = Array.isArray(parsed.messages.message) ? parsed.messages.message.length : 1;
    }

    return {
      success: true,
      data: parsed,
      messageCount,
    };
  } catch (error) {
    return {
      success: false,
      errors: [`Failed to parse XML: ${error instanceof Error ? error.message : 'Unknown error'}`],
    };
  }
}

/**
 * Parse mapgroupproto.xml - Loot spawn point definitions in buildings
 */
export function parseMapGroupProtoXML(xmlContent: string): { success: boolean; data?: any; errors?: string[]; groupCount?: number } {
  try {
    const validation = validateXMLStructure(xmlContent);
    if (!validation.valid) {
      return {
        success: false,
        errors: validation.errors,
      };
    }

    const parser = new XMLParser(parserOptions);
    const parsed = parser.parse(xmlContent);

    if (!parsed.prototype) {
      return {
        success: false,
        errors: ['Invalid mapgroupproto.xml: Missing prototype root element'],
      };
    }

    // Count groups for reporting
    let groupCount = 0;
    if (parsed.prototype.group) {
      groupCount = Array.isArray(parsed.prototype.group) ? parsed.prototype.group.length : 1;
    }

    return {
      success: true,
      data: parsed,
      groupCount,
    };
  } catch (error) {
    return {
      success: false,
      errors: [`Failed to parse XML: ${error instanceof Error ? error.message : 'Unknown error'}`],
    };
  }
}

/**
 * Parse mapgrouppos.xml - World positions of loot groups
 */
export function parseMapGroupPosXML(xmlContent: string): { success: boolean; data?: any; errors?: string[]; positionCount?: number } {
  try {
    const validation = validateXMLStructure(xmlContent);
    if (!validation.valid) {
      return {
        success: false,
        errors: validation.errors,
      };
    }

    const parser = new XMLParser(parserOptions);
    const parsed = parser.parse(xmlContent);

    if (!parsed.map) {
      return {
        success: false,
        errors: ['Invalid mapgrouppos.xml: Missing map root element'],
      };
    }

    // Count positions for reporting
    let positionCount = 0;
    if (parsed.map.group) {
      positionCount = Array.isArray(parsed.map.group) ? parsed.map.group.length : 1;
    }

    return {
      success: true,
      data: parsed,
      positionCount,
    };
  } catch (error) {
    return {
      success: false,
      errors: [`Failed to parse XML: ${error instanceof Error ? error.message : 'Unknown error'}`],
    };
  }
}

/**
 * Parse mapgroupcluster.xml - Regional loot clustering
 * Same structure as mapgrouppos.xml
 */
export function parseMapGroupClusterXML(xmlContent: string): { success: boolean; data?: any; errors?: string[]; clusterCount?: number } {
  try {
    const validation = validateXMLStructure(xmlContent);
    if (!validation.valid) {
      return {
        success: false,
        errors: validation.errors,
      };
    }

    const parser = new XMLParser(parserOptions);
    const parsed = parser.parse(xmlContent);

    if (!parsed.map) {
      return {
        success: false,
        errors: ['Invalid mapgroupcluster.xml: Missing map root element'],
      };
    }

    // Count clusters for reporting
    let clusterCount = 0;
    if (parsed.map.group) {
      clusterCount = Array.isArray(parsed.map.group) ? parsed.map.group.length : 1;
    }

    return {
      success: true,
      data: parsed,
      clusterCount,
    };
  } catch (error) {
    return {
      success: false,
      errors: [`Failed to parse XML: ${error instanceof Error ? error.message : 'Unknown error'}`],
    };
  }
}

/**
 * Parse cfglimitsdefinition.xml - Item limit definitions
 */
export function parseLimitsDefinitionXML(xmlContent: string): { success: boolean; data?: any; errors?: string[]; categoryCount?: number } {
  try {
    const validation = validateXMLStructure(xmlContent);
    if (!validation.valid) {
      return {
        success: false,
        errors: validation.errors,
      };
    }

    const parser = new XMLParser(parserOptions);
    const parsed = parser.parse(xmlContent);

    if (!parsed.lists) {
      return {
        success: false,
        errors: ['Invalid cfglimitsdefinition.xml: Missing lists root element'],
      };
    }

    // Count categories for reporting
    let categoryCount = 0;
    if (parsed.lists.categories?.category) {
      categoryCount = Array.isArray(parsed.lists.categories.category) ? parsed.lists.categories.category.length : 1;
    }

    return {
      success: true,
      data: parsed,
      categoryCount,
    };
  } catch (error) {
    return {
      success: false,
      errors: [`Failed to parse XML: ${error instanceof Error ? error.message : 'Unknown error'}`],
    };
  }
}

/**
 * Parse db/economy.xml - Central economy controller
 */
export function parseDBEconomyXML(xmlContent: string): { success: boolean; data?: any; errors?: string[]; systemCount?: number } {
  try {
    const validation = validateXMLStructure(xmlContent);
    if (!validation.valid) {
      return {
        success: false,
        errors: validation.errors,
      };
    }

    const parser = new XMLParser(parserOptions);
    const parsed = parser.parse(xmlContent);

    if (!parsed.economy) {
      return {
        success: false,
        errors: ['Invalid db/economy.xml: Missing economy root element'],
      };
    }

    // Count systems for reporting
    const systems = ['dynamic', 'animals', 'zombies', 'vehicles', 'randoms', 'custom', 'building', 'player'];
    const systemCount = systems.filter(sys => parsed.economy[sys]).length;

    return {
      success: true,
      data: parsed,
      systemCount,
    };
  } catch (error) {
    return {
      success: false,
      errors: [`Failed to parse XML: ${error instanceof Error ? error.message : 'Unknown error'}`],
    };
  }
}

/**
 * Parse init.c - Server initialization script
 * Extracts configuration from C++ code
 */
export function parseInitC(content: string): { success: boolean; data?: any; errors?: string[]; configCount?: number } {
  try {
    const config: any = {
      rawContent: content,
    };
    
    let configCount = 0;

    // Extract date reset configuration
    const dateResetMatch = content.match(/reset_month\s*=\s*(\d+)[\s\S]*?reset_day\s*=\s*(\d+)/);
    if (dateResetMatch) {
      config.dateReset = {
        month: parseInt(dateResetMatch[1]),
        day: parseInt(dateResetMatch[2]),
      };
      configCount++;
    }

    // Extract starting equipment
    const equipmentMatches = content.match(/CreateInInventory\(\s*"([^"]+)"\s*\)/g);
    if (equipmentMatches) {
      config.startingEquipment = equipmentMatches.map(match => {
        const item = match.match(/"([^"]+)"/);
        return item ? item[1] : '';
      }).filter(item => item);
      configCount++;
    }

    // Extract random health range
    const healthMatch = content.match(/RandomFloat\(\s*([\d.]+)\s*,\s*([\d.]+)\s*\)/);
    if (healthMatch) {
      config.healthRange = {
        min: parseFloat(healthMatch[1]),
        max: parseFloat(healthMatch[2]),
      };
      configCount++;
    }

    return {
      success: true,
      data: config,
      configCount: configCount || 1,
    };
  } catch (error) {
    return {
      success: false,
      errors: [`Failed to parse init.c: ${error instanceof Error ? error.message : 'Unknown error'}`],
    };
  }
}

/**
 * Auto-detect configuration file type from filename or content
 */
export function detectConfigFileType(filename: string, content: string): string {
  const lowerFilename = filename.toLowerCase();
  
  // Check by filename first
  if (lowerFilename.includes('types.xml')) return 'types';
  if (lowerFilename.includes('events.xml')) return 'events';
  if (lowerFilename.includes('spawnable') || lowerFilename.includes('cfgspawnabletypes')) return 'spawnable';
  if (lowerFilename.includes('economy') || lowerFilename.includes('cfgeconomycore')) return 'economy';
  if (lowerFilename.includes('effectarea') || lowerFilename.includes('cfgeffectarea')) return 'effectarea';
  if (lowerFilename.includes('environment') || lowerFilename.includes('cfgenvironment')) return 'environment';
  if (lowerFilename.includes('eventgroups') || lowerFilename.includes('cfgeventgroups')) return 'eventgroups';
  if (lowerFilename.includes('eventspawns') || lowerFilename.includes('cfgeventspawns')) return 'eventspawns';
  if (lowerFilename.includes('gameplay') || lowerFilename.includes('cfggameplay')) return 'gameplay';
  if (lowerFilename.includes('ignore') || lowerFilename.includes('cfgignorelist')) return 'ignorelist';
  if (lowerFilename.includes('spawnpoints') || lowerFilename.includes('cfgplayerspawnpoints')) return 'spawnpoints';
  if (lowerFilename.includes('randompresets') || lowerFilename.includes('cfgrandompresets')) return 'randompresets';
  if (lowerFilename.includes('underground') || lowerFilename.includes('cfgundergroundtriggers')) return 'undergroundtriggers';
  if (lowerFilename.includes('weather') || lowerFilename.includes('cfgweather')) return 'weather';
  
  // Check for territory files (env/ folder)
  if (lowerFilename.includes('territories') || lowerFilename.includes('_territories.xml')) return 'territory';
  
  // Check for database files (db/ folder)
  if (lowerFilename.includes('globals.xml')) return 'globals';
  if (lowerFilename.includes('messages.xml')) return 'messages';
  if (lowerFilename.includes('db') && lowerFilename.includes('economy.xml')) return 'dbeconomy';
  
  // Check for map group files
  if (lowerFilename.includes('mapgroupproto')) return 'mapgroupproto';
  if (lowerFilename.includes('mapgrouppos')) return 'mapgrouppos';
  if (lowerFilename.includes('mapgroupcluster')) return 'mapgroupcluster';
  if (lowerFilename.includes('mapgroupdirt')) return 'mapgroupdirt';
  
  // Check for limits files
  if (lowerFilename.includes('limitsdefinitionuser')) return 'limitsdefinitionuser';
  if (lowerFilename.includes('limitsdefinition')) return 'limitsdefinition';
  
  // Check for init.c
  if (lowerFilename.includes('init.c')) return 'initc';
  
  // Check by content for XML files
  if (content.includes('<types>')) return 'types';
  if (content.includes('<events>')) return 'events';
  if (content.includes('<spawnabletypes>')) return 'spawnable';
  if (content.includes('<economycore>')) return 'economy';
  if (content.includes('<env>') && content.includes('territories')) return 'environment';
  if (content.includes('<eventgroupdef>')) return 'eventgroups';
  if (content.includes('<eventposdef>')) return 'eventspawns';
  if (content.includes('<ignore>')) return 'ignorelist';
  if (content.includes('<playerspawnpoints>')) return 'spawnpoints';
  if (content.includes('<randompresets>')) return 'randompresets';
  if (content.includes('<weather>')) return 'weather';
  
  // Check for territory root element
  if (content.includes('<territory>') && (content.includes('<zone') || content.includes('smin') || content.includes('smax'))) return 'territory';
  
  // Check for database files
  if (content.includes('<variables>') && content.includes('<var ')) return 'globals';
  if (content.includes('<messages>') && content.includes('<message')) return 'messages';
  if (content.includes('<economy>') && content.includes('<dynamic')) return 'dbeconomy';
  
  // Check for map group files
  if (content.includes('<prototype>') && content.includes('<group name=')) return 'mapgroupproto';
  if (content.includes('<map>') && content.includes('group name=') && content.includes('pos=')) return 'mapgrouppos';
  
  // Check for limits files
  if (content.includes('<lists>') && content.includes('<categories>')) return 'limitsdefinition';
  
  // Check for init.c (C++ code)
  if (content.includes('void main()') || content.includes('CreateCustomMission')) return 'initc';
  
  // Check by content for JSON files
  try {
    const json = JSON.parse(content);
    if (json.Areas && json.SafePositions) return 'effectarea';
    if (json.version && json.PlayerData && json.WorldsData) return 'gameplay';
    if (json.Triggers !== undefined) return 'undergroundtriggers';
  } catch {
    // Not valid JSON or doesn't match patterns
  }
  
  return 'unknown';
}

/**
 * Universal configuration file parser
 */
export function parseConfigFile(filename: string, content: string): { success: boolean; fileType: string; data?: any; errors?: string[]; zoneCount?: number } {
  const fileType = detectConfigFileType(filename, content);
  
  let result: { success: boolean; data?: any; errors?: string[]; zoneCount?: number };
  
  switch (fileType) {
    case 'types':
      result = parseTypesXML(content);
      break;
    case 'events':
      result = parseEventsXML(content);
      break;
    case 'spawnable':
      result = parseSpawnableTypesXML(content);
      break;
    case 'economy':
      result = parseEconomyXML(content);
      break;
    case 'effectarea':
      result = parseEffectAreaJSON(content);
      break;
    case 'environment':
      result = parseEnvironmentXML(content);
      break;
    case 'eventgroups':
      result = parseEventGroupsXML(content);
      break;
    case 'eventspawns':
      result = parseEventSpawnsXML(content);
      break;
    case 'gameplay':
      result = parseGameplayJSON(content);
      break;
    case 'ignorelist':
      result = parseIgnoreListXML(content);
      break;
    case 'spawnpoints':
      result = parseSpawnPointsXML(content);
      break;
    case 'randompresets':
      result = parseRandomPresetsXML(content);
      break;
    case 'undergroundtriggers':
      result = parseUndergroundTriggersJSON(content);
      break;
    case 'weather':
      result = parseWeatherXML(content);
      break;
    case 'territory':
      result = parseTerritoryXML(content);
      break;
    case 'globals':
      result = parseGlobalsXML(content);
      break;
    case 'messages':
      result = parseMessagesXML(content);
      break;
    case 'mapgroupproto':
      result = parseMapGroupProtoXML(content);
      break;
    case 'mapgrouppos':
      result = parseMapGroupPosXML(content);
      break;
    case 'mapgroupcluster':
      result = parseMapGroupClusterXML(content);
      break;
    case 'mapgroupdirt':
      result = parseMapGroupClusterXML(content); // Same parser as cluster
      break;
    case 'limitsdefinition':
      result = parseLimitsDefinitionXML(content);
      break;
    case 'limitsdefinitionuser':
      result = parseLimitsDefinitionXML(content); // Same parser as main
      break;
    case 'dbeconomy':
      result = parseDBEconomyXML(content);
      break;
    case 'initc':
      result = parseInitC(content);
      break;
    default:
      result = {
        success: false,
        errors: ['Unknown configuration file type'],
      };
  }
  
  return { ...result, fileType };
}
