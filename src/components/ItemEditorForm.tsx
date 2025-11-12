'use client';

import { useState, useEffect } from 'react';
import { Save, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import type { DayZItem, ItemCategory } from '@/types/dayz';
import { ITEM_CATEGORIES, TIER_LEVELS, USAGE_LOCATIONS, ITEM_FLAGS } from '@/constants';
import { validateItem } from '@/utils/validation';

interface ItemEditorFormProps {
  item: DayZItem;
  onSave: (item: Partial<DayZItem>) => void;
  onDelete: () => void;
}

export default function ItemEditorForm({ item, onSave, onDelete }: ItemEditorFormProps) {
  const [formData, setFormData] = useState<DayZItem>(item);
  const [hasChanges, setHasChanges] = useState(false);
  const [validationResult, setValidationResult] = useState<ReturnType<typeof validateItem> | null>(null);

  useEffect(() => {
    setFormData(item);
    setHasChanges(false);
  }, [item]);

  useEffect(() => {
    const result = validateItem(formData);
    setValidationResult(result);
  }, [formData]);

  const handleChange = (field: keyof DayZItem, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleNumberChange = (field: keyof DayZItem, value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue)) {
      setFormData((prev) => ({ ...prev, [field]: numValue }));
      setHasChanges(true);
    }
  };

  const handleSave = () => {
    if (validationResult?.valid) {
      onSave(formData);
      setHasChanges(false);
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">{formData.name}</h2>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={!hasChanges || !validationResult?.valid}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save
          </button>
          <button
            onClick={onDelete}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>

      {/* Validation Messages */}
      {validationResult && (
        <div className="mb-6 space-y-2">
          {validationResult.errors.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-red-400 font-medium mb-1">Errors</p>
                  {validationResult.errors.map((error, idx) => (
                    <p key={idx} className="text-red-300 text-sm">
                      • {error.field}: {error.message}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}
          {validationResult.warnings.length > 0 && (
            <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-yellow-400 font-medium mb-1">Warnings</p>
                  {validationResult.warnings.map((warning, idx) => (
                    <p key={idx} className="text-yellow-300 text-sm">
                      • {warning.field}: {warning.message}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}
          {validationResult.valid && hasChanges && (
            <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <p className="text-green-400 font-medium">All validations passed</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Form Fields */}
      <div className="space-y-6">
        {/* Basic Properties */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Basic Properties</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Item Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nominal (Total spawned)
              </label>
              <input
                type="number"
                value={formData.nominal}
                onChange={(e) => handleNumberChange('nominal', e.target.value)}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Min (Minimum to maintain)
              </label>
              <input
                type="number"
                value={formData.min}
                onChange={(e) => handleNumberChange('min', e.target.value)}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Cost (Economy value)
              </label>
              <input
                type="number"
                value={formData.cost}
                onChange={(e) => handleNumberChange('cost', e.target.value)}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Lifetime (seconds)
              </label>
              <input
                type="number"
                value={formData.lifetime}
                onChange={(e) => handleNumberChange('lifetime', e.target.value)}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                {Math.floor(formData.lifetime / 3600)}h {Math.floor((formData.lifetime % 3600) / 60)}m
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Restock (seconds)
              </label>
              <input
                type="number"
                value={formData.restock}
                onChange={(e) => handleNumberChange('restock', e.target.value)}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                {Math.floor(formData.restock / 60)}m {formData.restock % 60}s
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Quantity Min
              </label>
              <input
                type="number"
                value={formData.quantmin}
                onChange={(e) => handleNumberChange('quantmin', e.target.value)}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Quantity Max
              </label>
              <input
                type="number"
                value={formData.quantmax}
                onChange={(e) => handleNumberChange('quantmax', e.target.value)}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Category */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Classification</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category
              </label>
              <select
                value={formData.category || ''}
                onChange={(e) => handleChange('category', e.target.value || null)}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">None</option>
                {Object.entries(ITEM_CATEGORIES).map(([key, cat]) => (
                  <option key={key} value={key}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tier/Value
              </label>
              <select
                multiple
                value={formData.value || []}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, option => option.value);
                  handleChange('value', selected.length > 0 ? selected : undefined);
                }}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 min-h-[100px]"
              >
                {TIER_LEVELS.map((tier) => (
                  <option key={tier} value={tier}>
                    {tier}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
            </div>
          </div>
        </div>

        {/* Usage Locations */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Usage Locations</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {USAGE_LOCATIONS.map((location) => (
              <label key={location} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.usage?.includes(location) || false}
                  onChange={(e) => {
                    const currentUsage = formData.usage || [];
                    const newUsage = e.target.checked
                      ? [...currentUsage, location]
                      : currentUsage.filter((u) => u !== location);
                    handleChange('usage', newUsage.length > 0 ? newUsage : undefined);
                  }}
                  className="w-4 h-4 bg-gray-900 border border-gray-700 rounded"
                />
                <span className="text-sm text-gray-300">{location}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Flags */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Flags</h3>
          <div className="space-y-3">
            {Object.entries(ITEM_FLAGS).map(([key, flag]) => (
              <label key={key} className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.flags?.[key as keyof typeof formData.flags] === '1'}
                  onChange={(e) => {
                    const newFlags = {
                      ...formData.flags,
                      [key]: e.target.checked ? '1' : '0',
                    };
                    handleChange('flags', newFlags);
                  }}
                  className="w-4 h-4 bg-gray-900 border border-gray-700 rounded mt-1"
                />
                <div>
                  <span className="text-sm text-gray-300 font-medium">{flag.label}</span>
                  <p className="text-xs text-gray-500">{flag.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
