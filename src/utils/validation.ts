import type { DayZItem, ValidationResult, ValidationError, ValidationWarning } from '@/types/dayz';

/**
 * Validate a single DayZ item configuration
 */
export function validateItem(item: DayZItem): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Required fields
  if (!item.name || item.name.trim() === '') {
    errors.push({
      field: 'name',
      message: 'Item name is required',
      itemName: item.name,
    });
  }

  // Nominal validation
  if (typeof item.nominal !== 'number' || item.nominal < 0) {
    errors.push({
      field: 'nominal',
      message: 'Nominal must be a non-negative number',
      itemName: item.name,
    });
  }

  // Min validation
  if (typeof item.min !== 'number' || item.min < 0) {
    errors.push({
      field: 'min',
      message: 'Min must be a non-negative number',
      itemName: item.name,
    });
  }

  // Min should not exceed nominal
  if (item.min > item.nominal) {
    warnings.push({
      field: 'min',
      message: 'Min value exceeds nominal value',
      itemName: item.name,
      suggestion: `Set min to a value <= ${item.nominal}`,
    });
  }

  // Lifetime validation
  if (typeof item.lifetime !== 'number' || item.lifetime < 0) {
    errors.push({
      field: 'lifetime',
      message: 'Lifetime must be a non-negative number',
      itemName: item.name,
    });
  }

  // Restock validation
  if (typeof item.restock !== 'number' || item.restock < 0) {
    errors.push({
      field: 'restock',
      message: 'Restock must be a non-negative number',
      itemName: item.name,
    });
  }

  // Quantity validation
  if (typeof item.quantmin !== 'number' || item.quantmin < -1) {
    errors.push({
      field: 'quantmin',
      message: 'Quantmin must be -1 or greater',
      itemName: item.name,
    });
  }

  if (typeof item.quantmax !== 'number' || item.quantmax < -1) {
    errors.push({
      field: 'quantmax',
      message: 'Quantmax must be -1 or greater',
      itemName: item.name,
    });
  }

  // Quantmin should not exceed quantmax
  if (item.quantmin > item.quantmax && item.quantmax !== -1) {
    warnings.push({
      field: 'quantmin',
      message: 'Quantmin exceeds quantmax',
      itemName: item.name,
      suggestion: `Set quantmin to a value <= ${item.quantmax}`,
    });
  }

  // Cost validation
  if (typeof item.cost !== 'number' || item.cost < 0) {
    errors.push({
      field: 'cost',
      message: 'Cost must be a non-negative number',
      itemName: item.name,
    });
  }

  // Balance warnings
  if (item.nominal === 0) {
    warnings.push({
      field: 'nominal',
      message: 'Nominal is 0, item will not spawn naturally',
      itemName: item.name,
      suggestion: 'Consider setting a nominal value > 0',
    });
  }

  if (item.lifetime > 0 && item.lifetime < 300) {
    warnings.push({
      field: 'lifetime',
      message: 'Lifetime is very short (less than 5 minutes)',
      itemName: item.name,
      suggestion: 'Consider increasing lifetime for better persistence',
    });
  }

  if (item.restock > 0 && item.restock < 60) {
    warnings.push({
      field: 'restock',
      message: 'Restock time is very short (less than 1 minute)',
      itemName: item.name,
      suggestion: 'Consider increasing restock time to avoid spam spawning',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate an array of items
 */
export function validateItems(items: DayZItem[]): ValidationResult {
  const allErrors: ValidationError[] = [];
  const allWarnings: ValidationWarning[] = [];

  items.forEach((item, index) => {
    const result = validateItem(item);
    allErrors.push(...result.errors.map(e => ({ ...e, line: index + 1 })));
    allWarnings.push(...result.warnings.map(w => ({ ...w, line: index + 1 })));
  });

  // Check for duplicate names
  const nameCount = new Map<string, number>();
  items.forEach((item, index) => {
    const count = nameCount.get(item.name) || 0;
    nameCount.set(item.name, count + 1);
    
    if (count > 0) {
      allErrors.push({
        field: 'name',
        message: `Duplicate item name: ${item.name}`,
        itemName: item.name,
        line: index + 1,
      });
    }
  });

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
  };
}

/**
 * Calculate economy statistics
 */
export function calculateEconomyStats(items: DayZItem[]) {
  const stats = {
    totalItems: items.length,
    itemsByCategory: {} as Record<string, number>,
    itemsByTier: {} as Record<string, number>,
    averageNominal: 0,
    averageLifetime: 0,
    totalSpawnedItems: 0,
  };

  let totalNominal = 0;
  let totalLifetime = 0;

  items.forEach(item => {
    // Count by category
    const category = item.category || 'uncategorized';
    stats.itemsByCategory[category] = (stats.itemsByCategory[category] || 0) + 1;

    // Count by tier
    if (item.value) {
      const tiers = Array.isArray(item.value) ? item.value : [item.value];
      tiers.forEach(tier => {
        stats.itemsByTier[tier] = (stats.itemsByTier[tier] || 0) + 1;
      });
    }

    // Calculate totals
    totalNominal += item.nominal;
    totalLifetime += item.lifetime;
    stats.totalSpawnedItems += item.nominal;
  });

  stats.averageNominal = items.length > 0 ? totalNominal / items.length : 0;
  stats.averageLifetime = items.length > 0 ? totalLifetime / items.length : 0;

  return stats;
}

/**
 * Format lifetime in seconds to human-readable format
 */
export function formatLifetime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}

/**
 * Parse human-readable lifetime to seconds
 */
export function parseLifetime(value: string): number {
  const match = value.match(/^(\d+)([smhd])$/);
  if (!match) return 0;

  const [, num, unit] = match;
  const number = parseInt(num, 10);

  switch (unit) {
    case 's': return number;
    case 'm': return number * 60;
    case 'h': return number * 3600;
    case 'd': return number * 86400;
    default: return 0;
  }
}
