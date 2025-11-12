'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Plus, Save, Download, Upload, Trash2, Copy, 
  FileText, Map, Gamepad2, Users, Check, AlertCircle, 
  GitCompare, Sparkles, Settings
} from 'lucide-react';
import { useEconomyStore } from '@/store/economyStore';
import { buildTypesXML, parseTypesXML } from '@/utils/xmlParser';
import type { EconomyTemplate, MapType, PlaystyleType, TemplateType } from '@/types/dayz';

export default function TemplatesPage() {
  const { items, templates, addTemplate, deleteTemplate, applyTemplate, originalFilePath } = useEconomyStore();
  const [selectedTemplate, setSelectedTemplate] = useState<EconomyTemplate | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [showImportTemplate, setShowImportTemplate] = useState(false);
  const [compareTemplate1, setCompareTemplate1] = useState<string | null>(null);
  const [compareTemplate2, setCompareTemplate2] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<TemplateType | 'all'>('all');

  const filteredTemplates = useMemo(() => {
    if (filterType === 'all') return templates;
    return templates.filter(t => t.type === filterType);
  }, [templates, filterType]);

  // Built-in map templates
  const builtInTemplates: EconomyTemplate[] = useMemo(() => {
    if (items.length === 0) return [];

    const baseTemplate = items.map(item => ({ ...item }));

    return [
      {
        id: 'chernarus-default',
        name: 'Chernarus - Balanced',
        description: 'Default balanced economy for Chernarus. Higher military spawns, standard civilian distribution.',
        type: 'map' as TemplateType,
        map: 'chernarus' as MapType,
        author: 'DayZ Economy Tool',
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ['official', 'balanced', 'pvp'],
        items: baseTemplate.map(item => ({
          ...item,
          nominal: item.category === 'weapons' ? Math.round(item.nominal * 1.2) : item.nominal,
        })),
        totalItems: baseTemplate.length,
        categoryMultipliers: {
          weapons: 1.2,
          clothes: 1.0,
          food: 1.0,
          tools: 1.0,
        },
      },
      {
        id: 'livonia-default',
        name: 'Livonia - Survival Focus',
        description: 'Optimized for Livonia (Enoch). More hunting gear, survival tools, and food. Lower military spawns due to smaller map size.',
        type: 'map' as TemplateType,
        map: 'livonia' as MapType,
        author: 'DayZ Economy Tool',
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ['official', 'survival', 'pve'],
        items: baseTemplate.map(item => ({
          ...item,
          nominal: 
            item.category === 'weapons' ? Math.round(item.nominal * 0.8) :
            item.category === 'food' ? Math.round(item.nominal * 1.3) :
            item.category === 'tools' ? Math.round(item.nominal * 1.2) :
            item.nominal,
        })),
        totalItems: baseTemplate.length,
        categoryMultipliers: {
          weapons: 0.8,
          food: 1.3,
          tools: 1.2,
        },
      },
      {
        id: 'sakhal-default',
        name: 'Sakhal - Arctic Survival',
        description: 'Configured for Sakhal arctic map. Emphasis on warm clothing, food, medical supplies. Harsh survival conditions.',
        type: 'map' as TemplateType,
        map: 'sakhal' as MapType,
        author: 'DayZ Economy Tool',
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ['official', 'hardcore', 'survival'],
        items: baseTemplate.map(item => ({
          ...item,
          nominal: 
            item.category === 'clothes' ? Math.round(item.nominal * 1.5) :
            item.category === 'food' ? Math.round(item.nominal * 1.4) :
            item.category === 'weapons' ? Math.round(item.nominal * 0.7) :
            item.nominal,
        })),
        totalItems: baseTemplate.length,
        categoryMultipliers: {
          clothes: 1.5,
          food: 1.4,
          weapons: 0.7,
        },
      },
    ];
  }, [items]);

  const allTemplates = [...builtInTemplates, ...templates];
  const displayTemplates = filterType === 'all' ? allTemplates : allTemplates.filter(t => t.type === filterType);

  const handleSaveAsTemplate = () => {
    setShowCreateModal(true);
  };

  const handleExportTemplate = (template: EconomyTemplate) => {
    // Export template as types.xml file
    const xmlContent = buildTypesXML(template.items);
    const blob = new Blob([xmlContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.name.toLowerCase().replace(/\s+/g, '-')}-types.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportTemplate = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xml';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const result = parseTypesXML(text);
        
        if (!result.success || !result.data || result.data.length === 0) {
          throw new Error(result.errors?.[0] || 'No items found in XML file');
        }

        // Create template from imported items
        const templateName = file.name.replace('.xml', '').replace(/-/g, ' ');
        const template: EconomyTemplate = {
          id: `imported-${Date.now()}`,
          name: templateName.charAt(0).toUpperCase() + templateName.slice(1),
          description: `Imported from ${file.name}`,
          type: 'community',
          author: 'Community',
          createdAt: new Date(),
          updatedAt: new Date(),
          tags: ['imported'],
          items: result.data as any,
          totalItems: result.data.length,
        };
        
        addTemplate(template);
        alert(`Template "${template.name}" imported successfully with ${result.data.length} items!`);
      } catch (error) {
        console.error('Failed to import template:', error);
        alert(`Failed to import template: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };
    input.click();
  };

  const getMapIcon = (map?: MapType) => {
    return <Map className="h-5 w-5" />;
  };

  const getTypeIcon = (type: TemplateType) => {
    switch (type) {
      case 'map': return <Map className="h-5 w-5" />;
      case 'playstyle': return <Gamepad2 className="h-5 w-5" />;
      case 'community': return <Users className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
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
                <h1 className="text-2xl font-bold text-white">Economy Templates</h1>
                <p className="text-sm text-gray-400">Pre-built and custom server configurations</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleImportTemplate}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Import Template
              </button>
              <button
                onClick={() => setShowCompareModal(true)}
                disabled={allTemplates.length < 2}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <GitCompare className="h-4 w-4" />
                Compare
              </button>
              <button
                onClick={handleSaveAsTemplate}
                disabled={items.length === 0}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save as Template
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-6">
        {items.length === 0 ? (
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-12 text-center">
              <FileText className="h-16 w-16 mx-auto mb-6 text-indigo-500 opacity-50" />
              <h2 className="text-2xl font-bold text-white mb-4">No Items Loaded</h2>
              <p className="text-gray-400 text-lg mb-6">
                Import a types.xml file to start using templates.
              </p>
              <Link
                href="/item-editor"
                className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
              >
                Go to Item Editor
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6">
              {(['all', 'map', 'playstyle', 'community', 'custom'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-4 py-2 rounded-lg transition-colors capitalize ${
                    filterType === type
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  isBuiltIn={builtInTemplates.some(t => t.id === template.id)}
                  onApply={() => setSelectedTemplate(template)}
                  onDelete={deleteTemplate}
                  onExport={handleExportTemplate}
                  getTypeIcon={getTypeIcon}
                />
              ))}

              {displayTemplates.length === 0 && (
                <div className="col-span-full bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-12 text-center">
                  <Sparkles className="h-12 w-12 mx-auto mb-4 text-gray-500" />
                  <p className="text-gray-400">No templates found in this category</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Create Template Modal */}
        {showCreateModal && (
          <CreateTemplateModal
            currentItems={items}
            onClose={() => setShowCreateModal(false)}
            onSave={(template) => {
              addTemplate(template);
              setShowCreateModal(false);
            }}
          />
        )}

        {/* Apply Template Modal */}
        {selectedTemplate && (
          <ApplyTemplateModal
            template={selectedTemplate}
            onClose={() => setSelectedTemplate(null)}
            onApply={async (adjustmentPercentage) => {
              applyTemplate(selectedTemplate.id, adjustmentPercentage);
              
              // Auto-save to file after applying template
              if (originalFilePath) {
                try {
                  const response = await fetch('/api/save', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      items: useEconomyStore.getState().items,
                      filePath: originalFilePath,
                    }),
                  });

                  if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || 'Failed to save');
                  }
                } catch (error) {
                  console.error('Failed to auto-save after template application:', error);
                  alert('Template applied but failed to save to file. Please save manually.');
                }
              }
              
              setSelectedTemplate(null);
            }}
          />
        )}

        {/* Compare Templates Modal */}
        {showCompareModal && (
          <CompareTemplatesModal
            templates={allTemplates}
            onClose={() => setShowCompareModal(false)}
          />
        )}
      </main>
    </div>
  );
}

// Template Card Component
function TemplateCard({
  template,
  isBuiltIn,
  onApply,
  onDelete,
  onExport,
  getTypeIcon,
}: {
  template: EconomyTemplate;
  isBuiltIn: boolean;
  onApply: () => void;
  onDelete: (id: string) => void;
  onExport: (template: EconomyTemplate) => void;
  getTypeIcon: (type: TemplateType) => JSX.Element;
}) {
  const getMapColor = (map?: MapType) => {
    switch (map) {
      case 'chernarus': return 'from-green-500 to-green-700';
      case 'livonia': return 'from-emerald-500 to-emerald-700';
      case 'sakhal': return 'from-cyan-500 to-cyan-700';
      default: return 'from-gray-500 to-gray-700';
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg overflow-hidden hover:border-indigo-500/50 transition-all">
      {/* Header with Map Color */}
      {template.map && (
        <div className={`h-2 bg-gradient-to-r ${getMapColor(template.map)}`} />
      )}

      <div className="p-6">
        {/* Title and Type */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 text-indigo-400">
            {getTypeIcon(template.type)}
            <span className="text-xs uppercase font-semibold">{template.type}</span>
          </div>
          {isBuiltIn && (
            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">
              Official
            </span>
          )}
        </div>

        <h3 className="text-xl font-bold text-white mb-2">{template.name}</h3>
        <p className="text-sm text-gray-400 mb-4 line-clamp-2">{template.description}</p>

        {/* Metadata */}
        <div className="flex flex-wrap gap-2 mb-4">
          {template.map && (
            <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded capitalize">
              {template.map}
            </span>
          )}
          {template.tags?.map((tag) => (
            <span key={tag} className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
              {tag}
            </span>
          ))}
        </div>

        <div className="text-sm text-gray-500 mb-4">
          {template.totalItems} items • {template.author}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onApply}
            className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Check className="h-4 w-4" />
            Apply
          </button>
          <button
            onClick={() => onExport(template)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            title="Export template"
          >
            <Download className="h-4 w-4" />
          </button>
          {!isBuiltIn && (
            <button
              onClick={() => onDelete(template.id)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Create Template Modal
function CreateTemplateModal({
  currentItems,
  onClose,
  onSave,
}: {
  currentItems: any[];
  onClose: () => void;
  onSave: (template: EconomyTemplate) => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<TemplateType>('custom');
  const [map, setMap] = useState<MapType>('custom');
  const [tags, setTags] = useState('');

  const handleSave = () => {
    const template: EconomyTemplate = {
      id: `template-${Date.now()}`,
      name,
      description,
      type,
      map: type === 'map' ? map : undefined,
      author: 'User',
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      items: currentItems,
      totalItems: currentItems.length,
    };
    onSave(template);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full p-6 border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">Save as Template</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Template Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Custom Economy"
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your template..."
              rows={3}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as TemplateType)}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="custom">Custom</option>
                <option value="map">Map Preset</option>
                <option value="playstyle">Playstyle</option>
                <option value="community">Community</option>
              </select>
            </div>

            {type === 'map' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Map
                </label>
                <select
                  value={map}
                  onChange={(e) => setMap(e.target.value as MapType)}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="custom">Custom</option>
                  <option value="chernarus">Chernarus</option>
                  <option value="livonia">Livonia</option>
                  <option value="sakhal">Sakhal</option>
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="pvp, hardcore, custom"
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="bg-indigo-500/10 border border-indigo-500/50 rounded-lg p-3">
            <p className="text-sm text-indigo-300">
              This will save your current economy configuration ({currentItems.length} items) as a reusable template.
            </p>
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
            onClick={handleSave}
            disabled={!name || !description}
            className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            Save Template
          </button>
        </div>
      </div>
    </div>
  );
}

// Apply Template Modal
function ApplyTemplateModal({
  template,
  onClose,
  onApply,
}: {
  template: EconomyTemplate;
  onClose: () => void;
  onApply: (adjustmentPercentage: number) => void;
}) {
  const [adjustment, setAdjustment] = useState(100);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg max-w-md w-full p-6 border border-gray-700">
        <div className="flex items-center gap-3 mb-6">
          <Check className="h-6 w-6 text-indigo-500" />
          <h3 className="text-xl font-bold text-white">Apply Template</h3>
        </div>

        <div className="mb-6">
          <h4 className="font-semibold text-white mb-2">{template.name}</h4>
          <p className="text-sm text-gray-400 mb-4">{template.description}</p>

          <div className="bg-gray-900/50 rounded-lg p-4 mb-4">
            <div className="text-sm text-gray-400 mb-2">Adjustment</div>
            <input
              type="range"
              min="50"
              max="200"
              value={adjustment}
              onChange={(e) => setAdjustment(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>50%</span>
              <span className="text-indigo-400 font-semibold">{adjustment}%</span>
              <span>200%</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Adjust all nominal values by {adjustment}% of template values
            </p>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-3">
            <p className="text-sm text-yellow-300">
              <AlertCircle className="h-4 w-4 inline mr-1" />
              This will replace your current economy settings with this template.
            </p>
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
            onClick={() => onApply(adjustment)}
            className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            Apply Now
          </button>
        </div>
      </div>
    </div>
  );
}

// Compare Templates Modal
function CompareTemplatesModal({
  templates,
  onClose,
}: {
  templates: EconomyTemplate[];
  onClose: () => void;
}) {
  const [template1, setTemplate1] = useState<string>('');
  const [template2, setTemplate2] = useState<string>('');

  const comparison = useMemo(() => {
    if (!template1 || !template2) return null;

    const t1 = templates.find(t => t.id === template1);
    const t2 = templates.find(t => t.id === template2);

    if (!t1 || !t2) return null;

    const differences = [];
    const t1Items = new globalThis.Map(t1.items.map(item => [item.name, item]));
    const t2Items = new globalThis.Map(t2.items.map(item => [item.name, item]));

    for (const [name, item1] of t1Items) {
      const item2 = t2Items.get(name);
      if (!item2) continue;

      if (item1.nominal !== item2.nominal) {
        differences.push({
          itemName: name,
          field: 'nominal' as keyof typeof item1,
          value1: item1.nominal,
          value2: item2.nominal,
        });
      }
    }

    return { template1: t1, template2: t2, differences: differences.slice(0, 50) };
  }, [template1, template2, templates]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg max-w-4xl w-full p-6 border border-gray-700 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <GitCompare className="h-6 w-6 text-indigo-500" />
            <h3 className="text-xl font-bold text-white">Compare Templates</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Template 1
            </label>
            <select
              value={template1}
              onChange={(e) => setTemplate1(e.target.value)}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">Select template...</option>
              {templates.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Template 2
            </label>
            <select
              value={template2}
              onChange={(e) => setTemplate2(e.target.value)}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">Select template...</option>
              {templates.filter(t => t.id !== template1).map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        </div>

        {comparison && (
          <div>
            <h4 className="font-semibold text-white mb-4">
              Differences ({comparison.differences.length})
            </h4>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {comparison.differences.map((diff, idx) => (
                <div key={idx} className="bg-gray-900/50 rounded-lg p-3">
                  <div className="font-medium text-white mb-1">{diff.itemName}</div>
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-400">{comparison.template1.name}: {diff.value1}</span>
                    <span className="text-purple-400">{comparison.template2.name}: {diff.value2}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!comparison && (
          <div className="text-center py-12 text-gray-500">
            Select two templates to compare
          </div>
        )}
      </div>
    </div>
  );
}
