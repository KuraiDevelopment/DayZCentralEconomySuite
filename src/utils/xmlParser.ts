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
 * Production-grade validation for DayZ configuration files
 */
function validateXMLStructure(xmlContent: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const lines = xmlContent.split('\n');

  // VALIDATION 1: Check for empty or whitespace-only content
  if (!xmlContent || xmlContent.trim().length === 0) {
    errors.push('CRITICAL: File is empty or contains only whitespace.');
    return { valid: false, errors };
  }

  // VALIDATION 2: Check for XML declaration (should be present and valid)
  if (!xmlContent.trim().startsWith('<?xml')) {
    errors.push('WARNING: Missing XML declaration (<?xml version="1.0" encoding="UTF-8"?>). While not strictly required, it\'s recommended for DayZ config files.');
  } else {
    // Validate XML declaration format
    const xmlDeclMatch = xmlContent.match(/<\?xml\s+([^?]*)\?>/);
    if (xmlDeclMatch) {
      const declContent = xmlDeclMatch[1];
      if (!declContent.includes('version=')) {
        errors.push('ERROR: XML declaration missing version attribute.');
      }
      if (!declContent.includes('encoding=')) {
        errors.push('WARNING: XML declaration missing encoding attribute. UTF-8 encoding is recommended.');
      }
    }
  }

  // VALIDATION 3: Check for malformed/incomplete tags
  const incompleteTags = xmlContent.match(/<[^>]*$/gm);
  if (incompleteTags && incompleteTags.length > 0) {
    errors.push('CRITICAL: Found incomplete/unclosed tags. Check for tags missing the closing ">" character.');
  }

  // VALIDATION 4: Check for mismatched opening and closing tags
  const tagStack: Array<{ name: string; line: number }> = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Match all tags in this line (excluding self-closing and comments)
    const tagMatches = line.matchAll(/<(\/?)([\w-]+)[^>]*?(\/?)>/g);
    
    for (const match of tagMatches) {
      const isClosing = match[1] === '/';
      const tagName = match[2];
      const isSelfClosing = match[3] === '/';
      
      // Skip XML declarations and comments
      if (tagName === '?xml' || tagName.startsWith('!')) continue;
      
      if (isClosing) {
        // Closing tag - check if it matches the most recent opening tag
        if (tagStack.length === 0) {
          errors.push(`ERROR (Line ${i + 1}): Found closing tag </${tagName}> without matching opening tag.`);
        } else {
          const lastOpened = tagStack.pop();
          if (lastOpened && lastOpened.name !== tagName) {
            errors.push(`ERROR (Line ${i + 1}): Mismatched tags - expected </${lastOpened.name}> but found </${tagName}>. Opening tag was on line ${lastOpened.line}.`);
          }
        }
      } else if (!isSelfClosing) {
        // Opening tag (not self-closing)
        tagStack.push({ name: tagName, line: i + 1 });
      }
    }
  }
  
  // Check for unclosed tags at the end
  if (tagStack.length > 0) {
    tagStack.forEach(tag => {
      errors.push(`ERROR: Unclosed tag <${tag.name}> (opened on line ${tag.line}). Missing closing tag </${tag.name}>.`);
    });
  }

  // VALIDATION 5: Check for invalid tag names
  const invalidTagPattern = /<\/?([a-zA-Z_][\w.-]*-)(?:\s|>|$)/g;
  let invalidTagMatch;
  while ((invalidTagMatch = invalidTagPattern.exec(xmlContent)) !== null) {
    const lineNumber = xmlContent.substring(0, invalidTagMatch.index).split('\n').length;
    errors.push(`ERROR (Line ${lineNumber}): Invalid tag name "${invalidTagMatch[1]}". Tag names cannot end with a hyphen.`);
  }

  // VALIDATION 6: Check for invalid characters in tag names
  // Extract just the tag names (without attributes) and validate them
  const tagNamePattern = /<\/?([a-zA-Z_][\w.-]*?)[\s\/>]/g;
  let tagNameMatch;
  while ((tagNameMatch = tagNamePattern.exec(xmlContent)) !== null) {
    const tagName = tagNameMatch[1];
    // Check if tag name contains invalid characters (only letters, numbers, hyphens, underscores, periods allowed)
    if (!/^[a-zA-Z_][\w.-]*$/.test(tagName)) {
      const lineNumber = xmlContent.substring(0, tagNameMatch.index).split('\n').length;
      errors.push(`ERROR (Line ${lineNumber}): Invalid characters in tag name "${tagName}". Tag names can only contain letters, numbers, hyphens, underscores, and periods.`);
    }
  }

  // VALIDATION 7: Check for unclosed comment blocks
  const openComments = (xmlContent.match(/<!--/g) || []).length;
  const closeComments = (xmlContent.match(/-->/g) || []).length;
  if (openComments !== closeComments) {
    errors.push(`ERROR: Mismatched comment blocks. Found ${openComments} opening <!-- and ${closeComments} closing -->. Every comment must be properly closed.`);
  }

  // VALIDATION 8: Check for invalid comment content (-- inside comments)
  const invalidCommentPattern = /<!--[^-]*--(?!>)[^-]*-->/g;
  if (invalidCommentPattern.test(xmlContent)) {
    errors.push('ERROR: Invalid comment content. Double hyphens (--) are not allowed inside XML comments except in the closing tag (-->).');
  }

  // VALIDATION 9: Check for random text content outside of tags
  // This checks for text that appears outside of any XML structure
  // We need to be careful not to flag legitimate text content inside tags
  const xmlDeclarationRemoved = xmlContent.replace(/<\?xml[^?]*\?>/g, '');
  const commentsRemoved = xmlDeclarationRemoved.replace(/<!--[\s\S]*?-->/g, '');
  
  // Remove all complete tag pairs with their content: <tag>content</tag>
  // This is more sophisticated - we keep removing matched pairs until none are left
  let cleaned = commentsRemoved;
  let previousLength;
  do {
    previousLength = cleaned.length;
    // Remove self-closing tags
    cleaned = cleaned.replace(/<[^>]+\/>/g, '');
    // Remove empty tags
    cleaned = cleaned.replace(/<([a-zA-Z_][\w.-]*)[^>]*>\s*<\/\1>/g, '');
    // Remove tags with simple text content (numbers, words, etc.)
    cleaned = cleaned.replace(/<([a-zA-Z_][\w.-]*)[^>]*>[^<>]*<\/\1>/g, '');
  } while (cleaned.length < previousLength && cleaned.includes('<'));
  
  // Now remove any remaining whitespace
  cleaned = cleaned.replace(/[\s\n\r\t]+/g, '');
  
  // If there's still content left, it's likely invalid text outside tags
  if (cleaned.trim().length > 0) {
    // Check if it's actually problematic (not just numbers from tag content)
    // Only flag if we find substantial text that looks like it shouldn't be there
    const suspiciousContent = cleaned.trim();
    if (suspiciousContent.length > 10 && /[a-zA-Z]{3,}/.test(suspiciousContent)) {
      const invalidContent = suspiciousContent.substring(0, 100);
      errors.push(`ERROR: Found invalid text content outside of XML tags: "${invalidContent}${suspiciousContent.length > 100 ? '...' : ''}". All text must be enclosed in tags.`);
    }
  }

  // VALIDATION 10: Check for unescaped special characters in text content
  const unescapedAmpersand = />([^<]*&(?!(?:amp|lt|gt|quot|apos);)[^<]*)</g;
  let ampMatch;
  while ((ampMatch = unescapedAmpersand.exec(xmlContent)) !== null) {
    const lineNumber = xmlContent.substring(0, ampMatch.index).split('\n').length;
    errors.push(`WARNING (Line ${lineNumber}): Found unescaped ampersand (&). Use &amp; instead to avoid parsing issues.`);
  }

  // VALIDATION 11: Check for malformed attributes (missing quotes, etc.)
  const malformedAttrPattern = /<[^>]+\s+(\w+)=(?!["\'])[^>\s]+/g;
  let attrMatch;
  while ((attrMatch = malformedAttrPattern.exec(xmlContent)) !== null) {
    const lineNumber = xmlContent.substring(0, attrMatch.index).split('\n').length;
    errors.push(`ERROR (Line ${lineNumber}): Malformed attribute "${attrMatch[1]}". Attribute values must be enclosed in quotes.`);
  }

  // VALIDATION 12: Check for duplicate attributes in the same tag
  const tagWithAttrs = /<([^>]+)>/g;
  let tagMatch;
  while ((tagMatch = tagWithAttrs.exec(xmlContent)) !== null) {
    const tagContent = tagMatch[1];
    const attrNames = new Set<string>();
    const attrPattern = /(\w+)\s*=/g;
    let attr;
    while ((attr = attrPattern.exec(tagContent)) !== null) {
      const attrName = attr[1];
      if (attrNames.has(attrName)) {
        const lineNumber = xmlContent.substring(0, tagMatch.index).split('\n').length;
        errors.push(`ERROR (Line ${lineNumber}): Duplicate attribute "${attrName}" found in tag. Each attribute can only appear once per tag.`);
      }
      attrNames.add(attrName);
    }
  }

  // VALIDATION 13: Check for duplicate sibling tags in events.xml
  // This is a common error that XML parsers silently handle by taking the last value
  if (xmlContent.includes('<event ') || xmlContent.includes('<event>')) {
    const commonTags = ['nominal', 'min', 'max', 'lifetime', 'restock', 'saferadius', 'distanceradius', 'cleanupradius'];
    let currentContext = '';
    let seenTags = new Set<string>();
    let currentEventName = '';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.includes('<event ') || line.includes('<event>')) {
        seenTags.clear();
        const nameMatch = line.match(/name="([^"]+)"/);
        currentEventName = nameMatch ? nameMatch[1] : 'unknown';
        currentContext = 'event';
      } else if (line.includes('</event>')) {
        seenTags.clear();
        currentContext = '';
      } else if (line.includes('<children>')) {
        currentContext = 'children';
      } else if (line.includes('</children>')) {
        currentContext = 'event';
      }
      
      if (currentContext === 'event') {
        for (const tagName of commonTags) {
          const openTag = `<${tagName}>`;
          if (line.includes(openTag)) {
            if (seenTags.has(tagName)) {
              errors.push(`ERROR (Line ${i + 1}): Event "${currentEventName}" has duplicate <${tagName}> tags. Each tag should appear only once per event. The XML parser will silently use the last value, which may not be your intent.`);
            }
            seenTags.add(tagName);
          }
        }
      }
    }
  }

  // VALIDATION 14: Deep validation with fast-xml-parser
  try {
    const parser = new XMLParser({ 
      ignoreAttributes: false,
      allowBooleanAttributes: false,
      parseTagValue: true,
      parseAttributeValue: false,
      trimValues: true,
      stopNodes: [],
    });
    parser.parse(xmlContent);
  } catch (parseError) {
    const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown parsing error';
    errors.push(`CRITICAL: XML Parser failed - ${errorMessage}. This usually indicates severely malformed XML structure.`);
  }

  // VALIDATION 15: Check file encoding (basic check for non-ASCII characters that might cause issues)
  const nonAsciiPattern = /[^\x00-\x7F]+/;
  if (nonAsciiPattern.test(xmlContent)) {
    // Check if file has proper encoding declaration
    if (!xmlContent.includes('encoding="UTF-8"') && !xmlContent.includes('encoding="utf-8"')) {
      errors.push('WARNING: File contains non-ASCII characters but encoding is not explicitly set to UTF-8. This may cause issues on some systems.');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
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
