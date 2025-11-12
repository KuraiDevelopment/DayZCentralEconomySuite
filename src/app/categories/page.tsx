'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, Package, Settings, Copy, Trash2, Download, AlertTriangle } from 'lucide-react';
import { useEconomyStore } from '@/store/economyStore';
import { ITEM_CATEGORIES } from '@/constants';
import type { DayZItem, ItemCategory } from '@/types/dayz';

export default function CategoryManagerPage() {
  const { items, batchUpdate, batchDelete } = useEconomyStore();
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | null>(null);
  const [showBatchEdit, setShowBatchEdit] = useState(false);
  const [showDangerZone, setShowDangerZone] = useState(false);
  const [showMoveItems, setShowMoveItems] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Calculate category statistics
  const categoryStats = useMemo(() => {
    const stats = new Map<ItemCategory | 'uncategorized', {
      count: number;
      totalNominal: number;
      avgLifetime: number;
      minLifetime: number;
      maxLifetime: number;
      items: DayZItem[];
      tierDistribution: { [key: string]: number };
      usageDistribution: { [key: string]: number };
    }>();

    // Initialize all categories
    const categoryKeys = Object.keys(ITEM_CATEGORIES) as ItemCategory[];
    categoryKeys.forEach(cat => {
      stats.set(cat, {
        count: 0,
        totalNominal: 0,
        avgLifetime: 0,
        minLifetime: Infinity,
        maxLifetime: 0,
        items: [],
        tierDistribution: {},
        usageDistribution: {},
      });
    });

    // Add uncategorized
    stats.set('uncategorized', {
      count: 0,
      totalNominal: 0,
      avgLifetime: 0,
      minLifetime: Infinity,
      maxLifetime: 0,
      items: [],
      tierDistribution: {},
      usageDistribution: {},
    });

    // Calculate stats for each item
    items.forEach(item => {
      const category = item.category || 'uncategorized';
      const stat = stats.get(category);
      
      if (stat) {
        stat.count++;
        stat.totalNominal += item.nominal;
        stat.minLifetime = Math.min(stat.minLifetime, item.lifetime);
        stat.maxLifetime = Math.max(stat.maxLifetime, item.lifetime);
        stat.items.push(item);

        // Tier distribution
        if (item.value) {
          item.value.forEach(tier => {
            stat.tierDistribution[tier] = (stat.tierDistribution[tier] || 0) + 1;
          });
        }

        // Usage distribution
        if (item.usage) {
          item.usage.forEach(usage => {
            stat.usageDistribution[usage] = (stat.usageDistribution[usage] || 0) + 1;
          });
        }
      }
    });

    // Calculate averages
    stats.forEach((stat, category) => {
      if (stat.count > 0) {
        stat.avgLifetime = Math.round(stat.items.reduce((sum, item) => sum + item.lifetime, 0) / stat.count);
        if (stat.minLifetime === Infinity) stat.minLifetime = 0;
      }
    });

    return stats;
  }, [items]);

  const selectedCategoryData = selectedCategory ? categoryStats.get(selectedCategory) : null;

  const getCategoryColor = (category: ItemCategory | 'uncategorized') => {
    const colors: { [key: string]: string } = {
      weapons: 'from-red-500 to-red-700',
      optics: 'from-cyan-500 to-cyan-700',
      explosives: 'from-orange-500 to-orange-700',
      tools: 'from-yellow-500 to-yellow-700',
      vehiclesparts: 'from-green-500 to-green-700',
      clothes: 'from-blue-500 to-blue-700',
      food: 'from-purple-500 to-purple-700',
      containers: 'from-pink-500 to-pink-700',
      uncategorized: 'from-gray-500 to-gray-700',
    };
    return colors[category as string] || 'from-gray-500 to-gray-700';
  };

  const getCategoryIcon = (category: ItemCategory | 'uncategorized') => {
    return <Package className="h-8 w-8" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-700 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                <ArrowLeft className="h-5 w-5 text-gray-400" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white">Category Manager</h1>
                <p className="text-sm text-gray-400">Manage and balance items by category</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">
                Total Items: <span className="text-white font-semibold">{items.length}</span>
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-6">
        {items.length === 0 ? (
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-12 text-center">
              <Package className="h-16 w-16 mx-auto mb-6 text-purple-500 opacity-50" />
              <h2 className="text-2xl font-bold text-white mb-4">No Items Loaded</h2>
              <p className="text-gray-400 text-lg mb-6">
                Import a types.xml file to start managing categories.
              </p>
              <Link
                href="/item-editor"
                className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Go to Item Editor
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Category Overview Grid */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-white mb-4">Category Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from(categoryStats.entries()).map(([category, stats]) => {
                  if (stats.count === 0) return null;
                  
                  return (
                    <button
                      key={category as string}
                      onClick={() => setSelectedCategory(category === 'uncategorized' ? null : category as ItemCategory)}
                      className={`relative overflow-hidden rounded-lg p-6 text-left transition-all hover:scale-105 ${
                        selectedCategory === category
                          ? 'ring-2 ring-blue-500 shadow-lg shadow-blue-500/50'
                          : 'hover:shadow-lg'
                      }`}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${getCategoryColor(category)} opacity-90`} />
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-white/90">
                            {getCategoryIcon(category)}
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-white">{stats.count}</div>
                            <div className="text-xs text-white/70">items</div>
                          </div>
                        </div>
                        <h3 className="text-lg font-semibold text-white capitalize mb-1">
                          {category === 'uncategorized' ? 'Uncategorized' : category}
                        </h3>
                        <div className="text-sm text-white/80">
                          Total Nominal: {stats.totalNominal}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Category Details */}
            {selectedCategory && selectedCategoryData && (
              <div className="space-y-6">
                {/* Category Header */}
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white capitalize">
                      {selectedCategory} Category
                    </h2>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedItems(new Set());
                          setShowMoveItems(true);
                        }}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Copy className="h-4 w-4" />
                        Move Items
                      </button>
                      <button
                        onClick={() => setShowBatchEdit(true)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Settings className="h-4 w-4" />
                        Batch Edit
                      </button>
                      <button
                        onClick={() => setShowDangerZone(true)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
                      >
                        <AlertTriangle className="h-4 w-4" />
                        Danger Zone
                      </button>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gray-900/50 rounded-lg p-4">
                      <div className="text-sm text-gray-400 mb-1">Total Items</div>
                      <div className="text-2xl font-bold text-white">{selectedCategoryData.count}</div>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-4">
                      <div className="text-sm text-gray-400 mb-1">Total Nominal</div>
                      <div className="text-2xl font-bold text-white">{selectedCategoryData.totalNominal}</div>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-4">
                      <div className="text-sm text-gray-400 mb-1">Avg Lifetime</div>
                      <div className="text-2xl font-bold text-white">{selectedCategoryData.avgLifetime}s</div>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-4">
                      <div className="text-sm text-gray-400 mb-1">Lifetime Range</div>
                      <div className="text-lg font-bold text-white">
                        {selectedCategoryData.minLifetime} - {selectedCategoryData.maxLifetime}s
                      </div>
                    </div>
                  </div>

                  {/* Tier Distribution */}
                  {Object.keys(selectedCategoryData.tierDistribution).length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-white mb-3">Tier Distribution</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {Object.entries(selectedCategoryData.tierDistribution).map(([tier, count]) => (
                          <div key={tier} className="bg-gray-900/50 rounded-lg p-3">
                            <div className="text-sm text-gray-400">{tier}</div>
                            <div className="text-xl font-bold text-white">{count} items</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Usage Distribution */}
                  {Object.keys(selectedCategoryData.usageDistribution).length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Usage Locations</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {Object.entries(selectedCategoryData.usageDistribution).map(([usage, count]) => (
                          <div key={usage} className="bg-gray-900/50 rounded-lg p-3">
                            <div className="text-sm text-gray-400">{usage}</div>
                            <div className="text-xl font-bold text-white">{count} items</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Items in Category */}
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">
                      Items in {selectedCategory} ({selectedCategoryData.count})
                    </h3>
                    {showMoveItems && (
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-400">
                          {selectedItems.size} selected
                        </span>
                        <button
                          onClick={() => {
                            const allItems = new Set(selectedCategoryData.items.map(i => i.name));
                            setSelectedItems(allItems);
                          }}
                          className="text-sm text-blue-400 hover:text-blue-300"
                        >
                          Select All
                        </button>
                        <button
                          onClick={() => setSelectedItems(new Set())}
                          className="text-sm text-gray-400 hover:text-gray-300"
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                    {selectedCategoryData.items.map(item => (
                      <div
                        key={item.name}
                        onClick={() => {
                          if (showMoveItems) {
                            const newSelected = new Set(selectedItems);
                            if (newSelected.has(item.name)) {
                              newSelected.delete(item.name);
                            } else {
                              newSelected.add(item.name);
                            }
                            setSelectedItems(newSelected);
                          }
                        }}
                        className={`bg-gray-900/50 rounded-lg p-3 transition-colors ${
                          showMoveItems 
                            ? 'cursor-pointer hover:bg-gray-900/70' 
                            : ''
                        } ${
                          selectedItems.has(item.name)
                            ? 'ring-2 ring-blue-500 bg-blue-500/10'
                            : ''
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {showMoveItems && (
                            <input
                              type="checkbox"
                              checked={selectedItems.has(item.name)}
                              onChange={() => {}}
                              className="w-4 h-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                            />
                          )}
                          <div className="flex-1">
                            <div className="font-medium text-white">{item.name}</div>
                            <div className="text-sm text-gray-400 mt-1">
                              Nominal: {item.nominal} | Lifetime: {item.lifetime}s
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {showMoveItems && selectedItems.size > 0 && (
                    <div className="mt-4 flex gap-3">
                      <button
                        onClick={() => {
                          setSelectedItems(new Set());
                          setShowMoveItems(false);
                        }}
                        className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <MoveItemsButton
                        selectedItems={selectedItems}
                        currentCategory={selectedCategory}
                        onMove={(targetCategory) => {
                          const itemNames = Array.from(selectedItems);
                          batchUpdate(itemNames, { category: targetCategory });
                          setSelectedItems(new Set());
                          setShowMoveItems(false);
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Batch Edit Modal */}
            {showBatchEdit && selectedCategory && selectedCategoryData && (
              <BatchEditModal
                category={selectedCategory}
                items={selectedCategoryData.items}
                onClose={() => setShowBatchEdit(false)}
                onApply={(updates) => {
                  const itemNames = selectedCategoryData.items.map(item => item.name);
                  batchUpdate(itemNames, updates);
                  setShowBatchEdit(false);
                }}
              />
            )}

            {/* Danger Zone Modal */}
            {showDangerZone && selectedCategory && selectedCategoryData && (
              <DangerZoneModal
                category={selectedCategory}
                itemCount={selectedCategoryData.count}
                onClose={() => setShowDangerZone(false)}
                onDisable={() => {
                  const itemNames = selectedCategoryData.items.map(item => item.name);
                  batchUpdate(itemNames, { nominal: 0, min: 0 });
                  setShowDangerZone(false);
                }}
                onDelete={() => {
                  if (confirm(`Are you absolutely sure you want to DELETE all ${selectedCategoryData.count} items in ${selectedCategory}? This cannot be undone!`)) {
                    const itemNames = selectedCategoryData.items.map(item => item.name);
                    batchDelete(itemNames);
                    setSelectedCategory(null);
                    setShowDangerZone(false);
                  }
                }}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

// Batch Edit Modal Component
function BatchEditModal({
  category,
  items,
  onClose,
  onApply,
}: {
  category: ItemCategory;
  items: DayZItem[];
  onClose: () => void;
  onApply: (updates: Partial<DayZItem>) => void;
}) {
  const [updates, setUpdates] = useState<Partial<DayZItem>>({});
  const [operation, setOperation] = useState<'set' | 'multiply'>('set');

  const handleApply = () => {
    onApply(updates);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full p-6 border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">
            Batch Edit: {category} ({items.length} items)
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Operation Type
            </label>
            <select
              value={operation}
              onChange={(e) => setOperation(e.target.value as 'set' | 'multiply')}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="set">Set Value</option>
              <option value="multiply">Multiply By</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nominal
              </label>
              <input
                type="number"
                placeholder={operation === 'multiply' ? 'Multiplier (e.g., 1.5)' : 'New value'}
                onChange={(e) => setUpdates(prev => ({ ...prev, nominal: operation === 'multiply' ? undefined : parseInt(e.target.value) }))}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Lifetime
              </label>
              <input
                type="number"
                placeholder={operation === 'multiply' ? 'Multiplier (e.g., 1.5)' : 'New value'}
                onChange={(e) => setUpdates(prev => ({ ...prev, lifetime: operation === 'multiply' ? undefined : parseInt(e.target.value) }))}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Restock
              </label>
              <input
                type="number"
                placeholder={operation === 'multiply' ? 'Multiplier (e.g., 1.5)' : 'New value'}
                onChange={(e) => setUpdates(prev => ({ ...prev, restock: operation === 'multiply' ? undefined : parseInt(e.target.value) }))}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Cost
              </label>
              <input
                type="number"
                placeholder={operation === 'multiply' ? 'Multiplier (e.g., 1.5)' : 'New value'}
                onChange={(e) => setUpdates(prev => ({ ...prev, cost: operation === 'multiply' ? undefined : parseInt(e.target.value) }))}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Apply to {items.length} Items
          </button>
        </div>
      </div>
    </div>
  );
}

// Danger Zone Modal Component
function DangerZoneModal({
  category,
  itemCount,
  onClose,
  onDisable,
  onDelete,
}: {
  category: ItemCategory;
  itemCount: number;
  onClose: () => void;
  onDisable: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg max-w-md w-full p-6 border border-red-700">
        <div className="flex items-center gap-3 mb-6">
          <AlertTriangle className="h-6 w-6 text-red-500" />
          <h3 className="text-xl font-bold text-white">Danger Zone</h3>
        </div>

        <p className="text-gray-300 mb-6">
          Dangerous operations for the <span className="font-semibold text-white capitalize">{category}</span> category ({itemCount} items)
        </p>

        <div className="space-y-3">
          <button
            onClick={onDisable}
            className="w-full px-4 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors text-left"
          >
            <div className="font-semibold mb-1">Disable Category</div>
            <div className="text-sm opacity-90">Set nominal and min to 0 (items won't spawn)</div>
          </button>
          
          <button
            onClick={onDelete}
            className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-left"
          >
            <div className="font-semibold mb-1">Delete All Items</div>
            <div className="text-sm opacity-90">Permanently remove all items in this category</div>
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// Move Items Button Component
function MoveItemsButton({
  selectedItems,
  currentCategory,
  onMove,
}: {
  selectedItems: Set<string>;
  currentCategory: ItemCategory;
  onMove: (targetCategory: ItemCategory) => void;
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const categoryKeys = Object.keys(ITEM_CATEGORIES) as ItemCategory[];
  const availableCategories = categoryKeys.filter(cat => cat !== currentCategory);

  return (
    <div className="relative flex-1">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <Copy className="h-4 w-4" />
        Move {selectedItems.size} Items To...
      </button>
      {showDropdown && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden z-10">
          {availableCategories.map(category => (
            <button
              key={category}
              onClick={() => {
                onMove(category);
                setShowDropdown(false);
              }}
              className="w-full px-4 py-3 text-left text-white hover:bg-gray-700 transition-colors capitalize"
            >
              {category}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
