'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Upload, Download, FileText, CheckCircle, 
  AlertCircle, FileJson, FileCode, Copy, Package, Zap,
  MapPin, Shield, Code
} from 'lucide-react';
import { useEconomyStore } from '@/store/economyStore';
import { buildTypesXML, parseConfigFile } from '@/utils/xmlParser';
import type { DayZItem } from '@/types/dayz';

export default function ImportExportPage() {
  const { items, setItems, originalFilePath, setOriginalFilePath } = useEconomyStore();
  const [selectedFormat, setSelectedFormat] = useState<'xml' | 'json'>('xml');
  const [exportOptions, setExportOptions] = useState({
    includeComments: true,
    prettyPrint: true,
    validateBeforeExport: true,
    createBackup: true,
  });
  const [filterOptions, setFilterOptions] = useState({
    categories: [] as string[],
    minNominal: '',
    maxNominal: '',
    tiers: [] as string[],
  });
  const [importStatus, setImportStatus] = useState<{
    success: boolean;
    message: string;
    itemCount?: number;
    fileType?: string;
  } | null>(null);
  const [exportStatus, setExportStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [importedConfigData, setImportedConfigData] = useState<any>(null);
  const [importedConfigType, setImportedConfigType] = useState<string>('');
  const [importedFileContent, setImportedFileContent] = useState<string>('');
  const [importedFileName, setImportedFileName] = useState<string>('');

  // Import file handler
  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportStatus(null);
    setImportedConfigData(null);
    setImportedConfigType('');
    setImportedFileContent('');
    setImportedFileName('');
    
    try {
      const text = await file.text();
      
      // Store file content and name for preview
      setImportedFileContent(text);
      setImportedFileName(file.name);
      
      if (file.name.endsWith('.json')) {
        // Try to parse as JSON first
        const jsonData = JSON.parse(text);
        
        // Check if it's a standard items array or a config file
        if (Array.isArray(jsonData)) {
          setItems(jsonData as DayZItem[]);
          setOriginalFilePath(file.name);
          setImportStatus({
            success: true,
            message: 'JSON file imported successfully',
            itemCount: jsonData.length,
            fileType: 'JSON',
          });
        } else {
          // Use universal parser for JSON config files
          const result = parseConfigFile(file.name, text);
          
          if (!result.success) {
            throw new Error(result.errors?.[0] || 'Failed to parse JSON config');
          }

          setImportedConfigData(result.data);
          setImportedConfigType(result.fileType);
          
          const fileTypeNames: Record<string, string> = {
            'effectarea': 'cfgEffectArea.json (Contaminated Zones)',
            'gameplay': 'cfggameplay.json (Gameplay Settings)',
            'undergroundtriggers': 'cfgundergroundtriggers.json (Underground Triggers)',
          };
          
          setImportStatus({
            success: true,
            message: `Successfully imported ${fileTypeNames[result.fileType] || result.fileType.toUpperCase()}`,
            fileType: result.fileType.toUpperCase(),
          });
        }
      } else if (file.name.endsWith('.xml')) {
        // Use universal parser for XML files
        const result = parseConfigFile(file.name, text);
        
        if (!result.success) {
          throw new Error(result.errors?.[0] || 'Failed to parse XML');
        }

        // Map file type to user-friendly names
        const fileTypeNames: Record<string, string> = {
          'types': 'types.xml (Item Spawns)',
          'events': 'events.xml (Event Spawns)',
          'spawnable': 'cfgspawnabletypes.xml (Container Loot)',
          'economy': 'cfgeconomycore.xml (Core Settings)',
          'environment': 'cfgenvironment.xml (Animal Territories)',
          'eventgroups': 'cfgeventgroups.xml (Event Groups)',
          'eventspawns': 'cfgeventspawns.xml (Event Spawn Positions)',
          'ignorelist': 'cfgIgnoreList.xml (Cleanup Ignore List)',
          'spawnpoints': 'cfgplayerspawnpoints.xml (Player Spawn Points)',
          'randompresets': 'cfgrandompresets.xml (Loot Presets)',
          'weather': 'cfgweather.xml (Weather Configuration)',
          'territory': 'Territory File (Animal Spawn Zones)',
          'globals': 'globals.xml (Server Variables)',
          'messages': 'messages.xml (Server Messages)',
          'mapgroupproto': 'mapgroupproto.xml (Loot Spawn Points)',
          'mapgrouppos': 'mapgrouppos.xml (World Positions)',
          'mapgroupcluster': 'mapgroupcluster.xml (Regional Clustering)',
          'mapgroupdirt': 'mapgroupdirt.xml (Ground Loot)',
          'limitsdefinition': 'cfglimitsdefinition.xml (Item Limits)',
          'limitsdefinitionuser': 'cfglimitsdefinitionuser.xml (Custom Limits)',
          'dbeconomy': 'economy.xml (Economy Controller)',
          'initc': 'init.c (Server Init Script)',
        };

        // For types.xml, update the main items store
        if (result.fileType === 'types' && Array.isArray(result.data)) {
          setItems(result.data as DayZItem[]);
          setOriginalFilePath(file.name);
          setImportStatus({
            success: true,
            message: `Successfully imported ${fileTypeNames[result.fileType]}`,
            itemCount: result.data.length,
            fileType: result.fileType.toUpperCase(),
          });
        } else {
          // For other config files, store in separate state
          setImportedConfigData(result.data);
          setImportedConfigType(result.fileType);
          
          // Special handling for files with counts
          let statusMessage = `Successfully imported ${fileTypeNames[result.fileType] || result.fileType.toUpperCase()}`;
          let count: number | undefined;
          
          if (result.fileType === 'territory' && result.zoneCount) {
            statusMessage += ` (${result.zoneCount} zones)`;
            count = result.zoneCount;
          } else if (result.fileType === 'globals' && (result as any).varCount) {
            statusMessage += ` (${(result as any).varCount} variables)`;
            count = (result as any).varCount;
          } else if (result.fileType === 'messages' && (result as any).messageCount) {
            statusMessage += ` (${(result as any).messageCount} messages)`;
            count = (result as any).messageCount;
          } else if (result.fileType === 'mapgroupproto' && (result as any).groupCount) {
            statusMessage += ` (${(result as any).groupCount} groups)`;
            count = (result as any).groupCount;
          } else if (result.fileType === 'mapgrouppos' && (result as any).positionCount) {
            statusMessage += ` (${(result as any).positionCount} positions)`;
            count = (result as any).positionCount;
          } else if (result.fileType === 'mapgroupcluster' && (result as any).clusterCount) {
            statusMessage += ` (${(result as any).clusterCount} clusters)`;
            count = (result as any).clusterCount;
          } else if (result.fileType === 'mapgroupdirt' && (result as any).clusterCount) {
            statusMessage += ` (${(result as any).clusterCount} dirt spots)`;
            count = (result as any).clusterCount;
          } else if (result.fileType === 'limitsdefinition' && (result as any).categoryCount) {
            statusMessage += ` (${(result as any).categoryCount} categories)`;
            count = (result as any).categoryCount;
          } else if (result.fileType === 'limitsdefinitionuser' && (result as any).categoryCount) {
            statusMessage += ` (${(result as any).categoryCount} custom categories)`;
            count = (result as any).categoryCount;
          } else if (result.fileType === 'dbeconomy' && (result as any).systemCount) {
            statusMessage += ` (${(result as any).systemCount} systems)`;
            count = (result as any).systemCount;
          } else if (result.fileType === 'initc' && (result as any).configCount) {
            statusMessage += ` (${(result as any).configCount} configs found)`;
            count = (result as any).configCount;
          }
          
          setImportStatus({
            success: true,
            message: statusMessage,
            fileType: result.fileType.toUpperCase(),
            itemCount: count,
          });
        }
      } else {
        throw new Error('Unsupported file format. Please use .xml or .json files.');
      }
    } catch (error) {
      setImportStatus({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to import file',
      });
    }
    
    // Reset input
    e.target.value = '';
  };

  // Export handler
  const handleExport = () => {
    if (items.length === 0) {
      setExportStatus({
        success: false,
        message: 'No items to export',
      });
      return;
    }

    try {
      // Apply filters if any
      let exportItems = [...items];
      
      if (filterOptions.categories.length > 0) {
        exportItems = exportItems.filter(item => 
          filterOptions.categories.includes(item.category || 'uncategorized')
        );
      }

      if (filterOptions.minNominal) {
        const min = parseInt(filterOptions.minNominal);
        exportItems = exportItems.filter(item => item.nominal >= min);
      }

      if (filterOptions.maxNominal) {
        const max = parseInt(filterOptions.maxNominal);
        exportItems = exportItems.filter(item => item.nominal <= max);
      }

      if (filterOptions.tiers.length > 0) {
        exportItems = exportItems.filter(item => {
          if (!item.value) return false;
          const tiers = Array.isArray(item.value) ? item.value : [item.value];
          return tiers.some(tier => filterOptions.tiers.includes(tier));
        });
      }

      if (exportItems.length === 0) {
        setExportStatus({
          success: false,
          message: 'No items match the filter criteria',
        });
        return;
      }

      let content: string;
      let filename: string;
      let mimeType: string;

      if (selectedFormat === 'json') {
        content = exportOptions.prettyPrint 
          ? JSON.stringify(exportItems, null, 2)
          : JSON.stringify(exportItems);
        filename = 'types-export.json';
        mimeType = 'application/json';
      } else {
        content = buildTypesXML(exportItems);
        filename = 'types-export.xml';
        mimeType = 'application/xml';
      }

      // Create and download file
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setExportStatus({
        success: true,
        message: `Exported ${exportItems.length} items as ${selectedFormat.toUpperCase()}`,
      });
    } catch (error) {
      setExportStatus({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to export',
      });
    }
  };

  // Quick export handlers
  const handleQuickExport = (format: 'xml' | 'json') => {
    setSelectedFormat(format);
    setTimeout(() => handleExport(), 100);
  };

  // Copy to clipboard
  const handleCopyToClipboard = () => {
    if (items.length === 0) return;

    try {
      const content = selectedFormat === 'json'
        ? JSON.stringify(items, null, 2)
        : buildTypesXML(items);
      
      navigator.clipboard.writeText(content);
      setExportStatus({
        success: true,
        message: 'Copied to clipboard',
      });
    } catch (error) {
      setExportStatus({
        success: false,
        message: 'Failed to copy to clipboard',
      });
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
                <h1 className="text-2xl font-bold text-white">Import/Export Manager</h1>
                <p className="text-sm text-gray-400">Advanced file operations and format conversion</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm text-gray-400">
                {items.length} items loaded
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Import Section */}
          <div className="space-y-6">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Upload className="h-6 w-6 text-blue-500" />
                <h2 className="text-2xl font-bold text-white">Import Files</h2>
              </div>
              <p className="text-gray-400 mb-6">
                Import DayZ configuration files or JSON exports
              </p>

              {/* Import Button */}
              <label className="block">
                <input
                  type="file"
                  accept=".xml,.json"
                  onChange={handleImportFile}
                  className="hidden"
                />
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-white font-medium mb-2">Click to upload or drag and drop</p>
                  <p className="text-sm text-gray-400">XML or JSON files</p>
                </div>
              </label>

              {/* Import Status */}
              {importStatus && (
                <div className={`mt-4 p-4 rounded-lg flex items-start gap-3 ${
                  importStatus.success 
                    ? 'bg-green-600/20 border border-green-600/50' 
                    : 'bg-red-600/20 border border-red-600/50'
                }`}>
                  {importStatus.success ? (
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className={`font-medium ${
                        importStatus.success ? 'text-green-200' : 'text-red-200'
                      }`}>
                        {importStatus.message}
                      </p>
                      {importStatus.success && importStatus.fileType && (
                        <span className="px-2 py-0.5 bg-blue-600/30 text-blue-300 text-xs rounded font-medium">
                          {importStatus.fileType}
                        </span>
                      )}
                    </div>
                    {importStatus.itemCount && (
                      <p className="text-sm text-gray-400">
                        {importStatus.itemCount} items loaded and validated
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Supported Formats */}
              <div className="mt-6 space-y-4">
                <h3 className="text-sm font-medium text-gray-300">Supported File Types</h3>
                <div className="grid grid-cols-1 gap-3">
                  <div className="bg-gray-700/30 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <FileCode className="h-6 w-6 text-blue-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-white mb-1">Core Economy Files</h4>
                        <ul className="text-sm text-gray-400 space-y-1">
                          <li>• <span className="text-blue-300">types.xml</span> - Item spawn configuration</li>
                          <li>• <span className="text-blue-300">events.xml</span> - Event spawns</li>
                          <li>• <span className="text-blue-300">cfgspawnabletypes.xml</span> - Container loot</li>
                          <li>• <span className="text-blue-300">cfgeconomycore.xml</span> - Core settings</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-700/30 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Package className="h-6 w-6 text-purple-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-white mb-1">Server Configuration Files</h4>
                        <ul className="text-sm text-gray-400 space-y-1">
                          <li>• <span className="text-purple-300">cfgenvironment.xml</span> - Animal territories</li>
                          <li>• <span className="text-purple-300">cfgeventgroups.xml</span> - Event groups</li>
                          <li>• <span className="text-purple-300">cfgeventspawns.xml</span> - Event positions</li>
                          <li>• <span className="text-purple-300">cfgIgnoreList.xml</span> - Cleanup exclusions</li>
                          <li>• <span className="text-purple-300">cfgplayerspawnpoints.xml</span> - Spawn points</li>
                          <li>• <span className="text-purple-300">cfgrandompresets.xml</span> - Loot presets</li>
                          <li>• <span className="text-purple-300">cfgweather.xml</span> - Weather system</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-700/30 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Zap className="h-6 w-6 text-orange-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-white mb-1">Territory Files (env/ folder)</h4>
                        <ul className="text-sm text-gray-400 space-y-1">
                          <li>• <span className="text-orange-300">wolf_territories.xml</span> - Wolf spawn zones</li>
                          <li>• <span className="text-orange-300">bear_territories.xml</span> - Bear spawn zones</li>
                          <li>• <span className="text-orange-300">deer_territories.xml</span> - Deer spawn zones</li>
                          <li>• <span className="text-orange-300">cattle_territories.xml</span> - Livestock zones</li>
                          <li>• <span className="text-orange-300">...and 9 more territory types</span></li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-700/30 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <FileJson className="h-6 w-6 text-green-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-white mb-1">JSON Configuration Files</h4>
                        <ul className="text-sm text-gray-400 space-y-1">
                          <li>• <span className="text-green-300">cfgEffectArea.json</span> - Contaminated zones</li>
                          <li>• <span className="text-green-300">cfggameplay.json</span> - Gameplay mechanics</li>
                          <li>• <span className="text-green-300">cfgundergroundtriggers.json</span> - Underground areas</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-700/30 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Package className="h-6 w-6 text-cyan-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-white mb-1">Database Files (db/ folder)</h4>
                        <ul className="text-sm text-gray-400 space-y-1">
                          <li>• <span className="text-cyan-300">globals.xml</span> - Server variables & cleanup settings</li>
                          <li>• <span className="text-cyan-300">messages.xml</span> - Server messages & announcements</li>
                          <li>• <span className="text-cyan-300">economy.xml</span> - Central economy controller</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-700/30 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-6 w-6 text-yellow-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-white mb-1">Map Group System (Dynamic Events)</h4>
                        <ul className="text-sm text-gray-400 space-y-1">
                          <li>• <span className="text-yellow-300">mapgroupproto.xml</span> - Loot spawn point definitions</li>
                          <li>• <span className="text-yellow-300">mapgrouppos.xml</span> - World position mapping</li>
                          <li>• <span className="text-yellow-300">mapgroupcluster.xml</span> - Regional clustering</li>
                          <li>• <span className="text-yellow-300">mapgroupdirt.xml</span> - Ground loot spawns</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-700/30 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Shield className="h-6 w-6 text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-white mb-1">Item Limits System (Anti-Hoarding)</h4>
                        <ul className="text-sm text-gray-400 space-y-1">
                          <li>• <span className="text-red-300">cfglimitsdefinition.xml</span> - Global item limits</li>
                          <li>• <span className="text-red-300">cfglimitsdefinitionuser.xml</span> - Custom limits</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-700/30 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Code className="h-6 w-6 text-purple-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-white mb-1">Server Scripts</h4>
                        <ul className="text-sm text-gray-400 space-y-1">
                          <li>• <span className="text-purple-300">init.c</span> - Server initialization script</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-3">
                  <p className="text-sm text-blue-200">
                    <strong>Auto-Detection:</strong> The tool automatically detects and validates file types based on structure
                  </p>
                </div>
              </div>
            </div>

            {/* Current File Info */}
            {originalFilePath && (
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-3">
                  <FileText className="h-5 w-5 text-gray-400" />
                  <h3 className="text-lg font-bold text-white">Current File</h3>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <p className="text-white font-mono text-sm break-all">{originalFilePath}</p>
                  <p className="text-gray-400 text-sm mt-2">{items.length} items</p>
                </div>
              </div>
            )}

            {/* Imported Config Data Preview */}
            {importedConfigData && importedConfigType && (
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-3">
                  <FileCode className="h-5 w-5 text-purple-400" />
                  <h3 className="text-lg font-bold text-white">Configuration Data</h3>
                  <span className="px-2 py-1 bg-purple-600/30 text-purple-300 text-xs rounded font-medium uppercase">
                    {importedConfigType}
                  </span>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-3">
                    Configuration file imported successfully. Data structure validated.
                  </p>
                  <details className="text-sm">
                    <summary className="text-blue-400 cursor-pointer hover:text-blue-300 mb-2">
                      View Data Structure
                    </summary>
                    <pre className="bg-gray-900 rounded p-3 overflow-auto max-h-64 text-xs text-gray-300">
                      {JSON.stringify(importedConfigData, null, 2)}
                    </pre>
                  </details>
                </div>
                <div className="mt-4 bg-blue-600/10 border border-blue-600/30 rounded-lg p-3">
                  <p className="text-sm text-blue-200">
                    <strong>Parsed Data:</strong> View the structured data extracted from your configuration file. See the File Preview below for the complete raw content.
                  </p>
                </div>
              </div>
            )}

            {/* File Content Preview */}
            {importedFileContent && importedFileName && (
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-green-400" />
                    <h3 className="text-lg font-bold text-white">File Preview</h3>
                  </div>
                  <span className="px-3 py-1 bg-gray-700 text-gray-300 text-xs rounded font-mono">
                    {importedFileName}
                  </span>
                </div>
                <div className="bg-gray-900 rounded-lg p-4 overflow-auto">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500">
                      {importedFileContent.split('\n').length} lines • {(importedFileContent.length / 1024).toFixed(1)} KB
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(importedFileContent);
                        alert('Content copied to clipboard!');
                      }}
                      className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Copy to Clipboard
                    </button>
                  </div>
                  <pre className="text-xs text-gray-300 overflow-auto max-h-96 font-mono leading-relaxed">
                    {importedFileContent}
                  </pre>
                </div>
                <div className="mt-4 bg-green-600/10 border border-green-600/30 rounded-lg p-3">
                  <p className="text-sm text-green-200">
                    <strong>Preview:</strong> Showing full file content. Scroll to view all {importedFileContent.split('\n').length} lines.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Export Section */}
          <div className="space-y-6">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Download className="h-6 w-6 text-green-500" />
                <h2 className="text-2xl font-bold text-white">Export Files</h2>
              </div>
              <p className="text-gray-400 mb-6">
                Export items with advanced options and filtering
              </p>

              {/* Format Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Export Format
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSelectedFormat('xml')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedFormat === 'xml'
                        ? 'border-blue-500 bg-blue-600/20'
                        : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
                    }`}
                  >
                    <FileCode className={`h-6 w-6 mx-auto mb-2 ${
                      selectedFormat === 'xml' ? 'text-blue-400' : 'text-gray-400'
                    }`} />
                    <p className={`font-medium ${
                      selectedFormat === 'xml' ? 'text-white' : 'text-gray-400'
                    }`}>XML</p>
                  </button>
                  <button
                    onClick={() => setSelectedFormat('json')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedFormat === 'json'
                        ? 'border-green-500 bg-green-600/20'
                        : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
                    }`}
                  >
                    <FileJson className={`h-6 w-6 mx-auto mb-2 ${
                      selectedFormat === 'json' ? 'text-green-400' : 'text-gray-400'
                    }`} />
                    <p className={`font-medium ${
                      selectedFormat === 'json' ? 'text-white' : 'text-gray-400'
                    }`}>JSON</p>
                  </button>
                </div>
              </div>

              {/* Export Options */}
              <div className="mb-6 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={exportOptions.prettyPrint}
                    onChange={(e) => setExportOptions({ ...exportOptions, prettyPrint: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-300 group-hover:text-white transition-colors">
                    Pretty print (formatted output)
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={exportOptions.validateBeforeExport}
                    onChange={(e) => setExportOptions({ ...exportOptions, validateBeforeExport: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-300 group-hover:text-white transition-colors">
                    Validate before export
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={exportOptions.createBackup}
                    onChange={(e) => setExportOptions({ ...exportOptions, createBackup: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-300 group-hover:text-white transition-colors">
                    Create backup before overwrite
                  </span>
                </label>
              </div>

              {/* Export Actions */}
              <div className="space-y-3">
                <button
                  onClick={handleExport}
                  disabled={items.length === 0}
                  className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <Download className="h-5 w-5" />
                  Export as {selectedFormat.toUpperCase()}
                </button>
                <button
                  onClick={handleCopyToClipboard}
                  disabled={items.length === 0}
                  className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copy to Clipboard
                </button>
              </div>

              {/* Export Status */}
              {exportStatus && (
                <div className={`mt-4 p-4 rounded-lg flex items-start gap-3 ${
                  exportStatus.success 
                    ? 'bg-green-600/20 border border-green-600/50' 
                    : 'bg-red-600/20 border border-red-600/50'
                }`}>
                  {exportStatus.success ? (
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                  )}
                  <p className={`font-medium ${
                    exportStatus.success ? 'text-green-200' : 'text-red-200'
                  }`}>
                    {exportStatus.message}
                  </p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="h-5 w-5 text-yellow-500" />
                <h3 className="text-lg font-bold text-white">Quick Export</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleQuickExport('xml')}
                  disabled={items.length === 0}
                  className="px-4 py-3 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm"
                >
                  Quick XML
                </button>
                <button
                  onClick={() => handleQuickExport('json')}
                  disabled={items.length === 0}
                  className="px-4 py-3 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm"
                >
                  Quick JSON
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        {items.length > 0 && (
          <div className="mt-6 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Package className="h-5 w-5 text-purple-500" />
              <h3 className="text-lg font-bold text-white">Export Statistics</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-700/30 rounded-lg p-4">
                <div className="text-2xl font-bold text-white">{items.length}</div>
                <div className="text-sm text-gray-400">Total Items</div>
              </div>
              <div className="bg-gray-700/30 rounded-lg p-4">
                <div className="text-2xl font-bold text-white">
                  {new Set(items.map(i => i.category)).size}
                </div>
                <div className="text-sm text-gray-400">Categories</div>
              </div>
              <div className="bg-gray-700/30 rounded-lg p-4">
                <div className="text-2xl font-bold text-white">
                  {items.reduce((sum, i) => sum + i.nominal, 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-400">Total Nominal</div>
              </div>
              <div className="bg-gray-700/30 rounded-lg p-4">
                <div className="text-2xl font-bold text-white">
                  {(() => {
                    const tiers = new Set<string>();
                    items.forEach(i => {
                      if (i.value) {
                        const itemTiers = Array.isArray(i.value) ? i.value : [i.value];
                        itemTiers.forEach(t => tiers.add(t));
                      }
                    });
                    return tiers.size;
                  })()}
                </div>
                <div className="text-sm text-gray-400">Tiers Used</div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
