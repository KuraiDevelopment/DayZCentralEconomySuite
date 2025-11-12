'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Save, Download, Upload, Search, AlertCircle } from 'lucide-react';
import { useEconomyStore } from '@/store/economyStore';
import ItemTable from '@/components/ItemTable';
import ItemEditorForm from '@/components/ItemEditorForm';
import FileUpload from '@/components/FileUpload';
import type { DayZItem } from '@/types/dayz';

export default function ItemEditorPage() {
  const { items, selectedItem, originalFilePath, setItems, selectItem, updateItem, addItem, deleteItem } = useEconomyStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [showNewItemForm, setShowNewItemForm] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFileSelect = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/parse', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.data) {
        setItems(data.data);
        setShowUpload(false);
      } else {
        // Show detailed validation errors
        const errorMessage = data.details && data.details.length > 0
          ? `Failed to parse file:\n\n${data.details.join('\n\n')}`
          : `Failed to parse file: ${data.error || 'Unknown error'}`;
        
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleSave = async () => {
    if (!originalFilePath) {
      alert('No file path set. Please specify a save location in the settings.');
      return;
    }

    setShowSaveConfirm(false);

    try {
      console.log('Saving to:', originalFilePath);
      
      const response = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, filePath: originalFilePath }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Save successful:', data);
        alert(`File saved successfully!\n\nSaved to: ${data.filePath}\nBackup created: ${data.backupPath}`);
      } else {
        console.error('Save failed:', data);
        alert('Failed to save file: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Error saving file: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleExport = async () => {
    try {
      console.log('Starting export with', items.length, 'items');
      
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, format: 'xml' }),
      });

      console.log('Export response status:', response.status);

      if (response.ok) {
        const blob = await response.blob();
        console.log('Blob size:', blob.size, 'bytes');
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'types.xml';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('Export completed successfully');
      } else {
        const errorData = await response.json();
        console.error('Export failed:', errorData);
        alert('Failed to export file: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Error exporting file: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleNewItem = () => {
    const newItem: DayZItem = {
      name: 'NewItem_' + Date.now(),
      nominal: 10,
      lifetime: 3600,
      restock: 300,
      min: 5,
      quantmin: -1,
      quantmax: -1,
      cost: 100,
    };
    addItem(newItem);
    selectItem(newItem);
    setShowNewItemForm(false);
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
                <h1 className="text-2xl font-bold text-white">Item Editor</h1>
                <p className="text-sm text-gray-400">Edit and manage DayZ economy items</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowUpload(!showUpload)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Import
              </button>
              <button
                onClick={() => originalFilePath ? setShowSaveConfirm(true) : alert('Please set a file path first')}
                disabled={items.length === 0}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save
              </button>
              <button
                onClick={handleExport}
                disabled={items.length === 0}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
              <button
                onClick={handleNewItem}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                New Item
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg max-w-2xl w-full p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Import Configuration File</h3>
              <button
                onClick={() => setShowUpload(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <FileUpload onFileSelect={handleFileSelect} />
          </div>
        </div>
      )}

      {/* Save Confirmation Modal */}
      {showSaveConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg max-w-md w-full p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="h-6 w-6 text-yellow-500" />
              <h3 className="text-xl font-bold text-white">Confirm Save</h3>
            </div>
            <p className="text-gray-300 mb-2">
              This will overwrite the original file:
            </p>
            <p className="text-sm text-gray-400 font-mono bg-gray-900 p-2 rounded mb-4 break-all">
              {originalFilePath}
            </p>
            <p className="text-sm text-gray-400 mb-6">
              A backup will be created automatically before saving.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSaveConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-6 py-6">
        {/* File Path Settings */}
        <div className="mb-6 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-300 whitespace-nowrap">
              File Path:
            </label>
            <input
              type="text"
              placeholder="/path/to/your/types.xml (e.g., /Users/username/DayZ/types.xml)"
              value={originalFilePath || ''}
              onChange={(e) => useEconomyStore.getState().setOriginalFilePath(e.target.value)}
              className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 font-mono text-sm"
            />
            {originalFilePath && (
              <span className="text-xs text-green-500 whitespace-nowrap">✓ Path set</span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Enter the full path to your types.xml file to enable live saving. 
            Example: <span className="font-mono">/Users/kurai.dev/Downloads/DayZ-Central-Economy-master/dayzOffline.chernarusplus/db/types.xml</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items List */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Items ({filteredItems.length})</h2>
              </div>

              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Items List */}
              <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
                {filteredItems.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">No items found</p>
                    <button
                      onClick={() => setShowUpload(true)}
                      className="mt-4 text-blue-400 hover:text-blue-300 text-sm"
                    >
                      Import a file to get started
                    </button>
                  </div>
                ) : (
                  filteredItems.map((item) => (
                    <button
                      key={item.name}
                      onClick={() => selectItem(item)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedItem?.name === item.name
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-900/50 text-gray-300 hover:bg-gray-900'
                      }`}
                    >
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs opacity-75 mt-1">
                        Nominal: {item.nominal} | Min: {item.min}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Editor Form */}
          <div className="lg:col-span-2">
            {selectedItem ? (
              <ItemEditorForm
                item={selectedItem}
                onSave={async (updatedItem: Partial<DayZItem>) => {
                  updateItem(selectedItem.name, updatedItem);
                  
                  // Auto-save to file if path is set
                  if (originalFilePath) {
                    try {
                      const updatedItems = items.map(item =>
                        item.name === selectedItem.name ? { ...item, ...updatedItem } : item
                      );
                      
                      const response = await fetch('/api/save', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ items: updatedItems, filePath: originalFilePath }),
                      });

                      if (response.ok) {
                        console.log('Auto-saved to file');
                      }
                    } catch (error) {
                      console.error('Auto-save failed:', error);
                    }
                  }
                }}
                onDelete={() => {
                  if (confirm(`Delete ${selectedItem.name}?`)) {
                    deleteItem(selectedItem.name);
                    selectItem(null);
                  }
                }}
              />
            ) : (
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-12 text-center">
                <div className="text-gray-400">
                  <Save className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Select an item to edit</p>
                  <p className="text-sm mt-2 opacity-75">
                    Choose an item from the list or create a new one
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
