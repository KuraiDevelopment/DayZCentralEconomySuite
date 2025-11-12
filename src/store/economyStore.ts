import { create } from 'zustand';
import type { DayZItem, ConfigBackup, EconomyTemplate } from '@/types/dayz';

interface EconomyStore {
  // Current items
  items: DayZItem[];
  selectedItem: DayZItem | null;
  originalFilePath: string | null;
  
  // Filters and search
  searchQuery: string;
  categoryFilter: string | null;
  tierFilter: string | null;
  
  // Backups
  backups: ConfigBackup[];
  
  // Templates
  templates: EconomyTemplate[];
  
  // Actions
  setItems: (items: DayZItem[], filePath?: string) => void;
  addItem: (item: DayZItem) => void;
  updateItem: (name: string, updates: Partial<DayZItem>) => void;
  deleteItem: (name: string) => void;
  selectItem: (item: DayZItem | null) => void;
  setOriginalFilePath: (path: string | null) => void;
  
  // Search and filter
  setSearchQuery: (query: string) => void;
  setCategoryFilter: (category: string | null) => void;
  setTierFilter: (tier: string | null) => void;
  
  // Backups
  createBackup: (backup: ConfigBackup) => void;
  restoreBackup: (backupId: string) => void;
  deleteBackup: (backupId: string) => void;
  
  // Templates
  addTemplate: (template: EconomyTemplate) => void;
  updateTemplate: (id: string, updates: Partial<EconomyTemplate>) => void;
  deleteTemplate: (id: string) => void;
  applyTemplate: (templateId: string, adjustmentPercentage?: number) => void;
  
  // Batch operations
  batchUpdate: (names: string[], updates: Partial<DayZItem>) => void;
  batchDelete: (names: string[]) => void;
}

export const useEconomyStore = create<EconomyStore>((set, get) => ({
  items: [],
  selectedItem: null,
  originalFilePath: null,
  searchQuery: '',
  categoryFilter: null,
  tierFilter: null,
  backups: [],
  templates: [],

  setItems: (items, filePath) => set({ items, originalFilePath: filePath || null }),

  setOriginalFilePath: (path) => set({ originalFilePath: path }),

  addItem: (item) => set((state) => ({
    items: [...state.items, item],
  })),

  updateItem: (name, updates) => set((state) => {
    const updatedItems = state.items.map((item) =>
      item.name === name ? { ...item, ...updates } : item
    );
    const updatedSelectedItem = state.selectedItem?.name === name 
      ? { ...state.selectedItem, ...updates }
      : state.selectedItem;
    
    return {
      items: updatedItems,
      selectedItem: updatedSelectedItem,
    };
  }),

  deleteItem: (name) => set((state) => ({
    items: state.items.filter((item) => item.name !== name),
    selectedItem: state.selectedItem?.name === name ? null : state.selectedItem,
  })),

  selectItem: (item) => set({ selectedItem: item }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  setCategoryFilter: (category) => set({ categoryFilter: category }),

  setTierFilter: (tier) => set({ tierFilter: tier }),

  createBackup: (backup) => set((state) => ({
    backups: [...state.backups, backup],
  })),

  restoreBackup: (backupId) => {
    const backup = get().backups.find((b) => b.id === backupId);
    if (backup) {
      // In a real implementation, you'd load the backup data
      console.log('Restoring backup:', backupId);
    }
  },

  deleteBackup: (backupId) => set((state) => ({
    backups: state.backups.filter((b) => b.id !== backupId),
  })),

  addTemplate: (template) => set((state) => ({
    templates: [...state.templates, template],
  })),

  updateTemplate: (id, updates) => set((state) => ({
    templates: state.templates.map((t) =>
      t.id === id ? { ...t, ...updates, updatedAt: new Date() } : t
    ),
  })),

  deleteTemplate: (id) => set((state) => ({
    templates: state.templates.filter((t) => t.id !== id),
  })),

  applyTemplate: (templateId, adjustmentPercentage = 100) => {
    const template = get().templates.find((t) => t.id === templateId);
    if (!template) return;

    const multiplier = adjustmentPercentage / 100;
    const updatedItems = get().items.map((currentItem) => {
      const templateItem = template.items.find((ti) => ti.name === currentItem.name);
      if (!templateItem) return currentItem;

      return {
        ...currentItem,
        nominal: Math.round(templateItem.nominal * multiplier),
        min: Math.round(templateItem.min * multiplier),
        lifetime: Math.round(templateItem.lifetime * multiplier),
        restock: Math.round(templateItem.restock * multiplier),
        quantmin: templateItem.quantmin,
        quantmax: templateItem.quantmax,
        cost: templateItem.cost,
        category: templateItem.category,
        usage: templateItem.usage,
        value: templateItem.value,
        flags: templateItem.flags,
      };
    });

    set({ items: updatedItems });
  },

  batchUpdate: (names, updates) => set((state) => ({
    items: state.items.map((item) =>
      names.includes(item.name) ? { ...item, ...updates } : item
    ),
  })),

  batchDelete: (names) => set((state) => ({
    items: state.items.filter((item) => !names.includes(item.name)),
  })),
}));

// Selector hooks for filtered data
export const useFilteredItems = () => {
  const items = useEconomyStore((state) => state.items);
  const searchQuery = useEconomyStore((state) => state.searchQuery);
  const categoryFilter = useEconomyStore((state) => state.categoryFilter);
  const tierFilter = useEconomyStore((state) => state.tierFilter);

  return items.filter((item) => {
    // Search filter
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Category filter
    if (categoryFilter && item.category !== categoryFilter) {
      return false;
    }

    // Tier filter
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (tierFilter && (!item.value || !item.value.includes(tierFilter as any))) {
      return false;
    }

    return true;
  });
};
