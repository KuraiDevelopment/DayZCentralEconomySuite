'use client';

import type { DayZItem } from '@/types/dayz';
import { Pencil, Trash2 } from 'lucide-react';

interface ItemTableProps {
  items: DayZItem[];
  onEdit?: (item: DayZItem) => void;
  onDelete?: (itemName: string) => void;
  onSelect?: (item: DayZItem) => void;
}

export default function ItemTable({ items, onEdit, onDelete, onSelect }: ItemTableProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>No items to display. Import a configuration file to get started.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-800 border-b border-gray-700">
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Name</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Nominal</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Min</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Lifetime</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Restock</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Category</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Tier</th>
            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-300">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr
              key={`${item.name}-${index}`}
              onClick={() => onSelect?.(item)}
              className="border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer transition-colors"
            >
              <td className="px-4 py-3 text-sm text-white font-medium">{item.name}</td>
              <td className="px-4 py-3 text-sm text-gray-300">{item.nominal}</td>
              <td className="px-4 py-3 text-sm text-gray-300">{item.min}</td>
              <td className="px-4 py-3 text-sm text-gray-300">{item.lifetime}s</td>
              <td className="px-4 py-3 text-sm text-gray-300">{item.restock}s</td>
              <td className="px-4 py-3 text-sm text-gray-300">
                <span className="px-2 py-1 bg-gray-700 rounded text-xs">
                  {typeof item.category === 'object' && item.category !== null && 'name' in item.category
                    ? (item.category as any).name
                    : item.category || 'none'}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-300">
                {item.value && Array.isArray(item.value) 
                  ? item.value.map((v: any) => typeof v === 'object' && v !== null && 'name' in v ? v.name : v).join(', ')
                  : typeof item.value === 'object' && item.value !== null && 'name' in item.value
                  ? (item.value as any).name
                  : item.value || 'none'}
              </td>
              <td className="px-4 py-3 text-sm text-right">
                <div className="flex justify-end gap-2">
                  {onEdit && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(item);
                      }}
                      className="p-2 hover:bg-blue-500/20 rounded text-blue-400 hover:text-blue-300 transition-colors"
                      title="Edit item"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete ${item.name}?`)) {
                          onDelete(item.name);
                        }
                      }}
                      className="p-2 hover:bg-red-500/20 rounded text-red-400 hover:text-red-300 transition-colors"
                      title="Delete item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
