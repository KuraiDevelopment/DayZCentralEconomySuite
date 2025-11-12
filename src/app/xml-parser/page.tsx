'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import FileUpload from '@/components/FileUpload';
import ItemTable from '@/components/ItemTable';
import type { DayZItem } from '@/types/dayz';

export default function XMLParserPage() {
  const [items, setItems] = useState<DayZItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [fileType, setFileType] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);

  const handleFileSelect = async (file: File) => {
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/parse', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to parse file');
      }

      setItems(data.data || []);
      setFileType(data.fileType);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-700 bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-400" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white">XML Parser</h1>
                <p className="text-sm text-gray-400">
                  Parse and validate DayZ configuration files
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Upload Section */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Upload Configuration File
            </h2>
            <FileUpload onFileSelect={handleFileSelect} />

            {loading && (
              <div className="mt-4 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                <p className="text-gray-400 mt-2">Parsing file...</p>
              </div>
            )}

            {error && (
              <div className="mt-4 bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-start space-x-3">
                <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-400 font-medium">Error</p>
                  <p className="text-red-300 text-sm mt-1">{error}</p>
                </div>
              </div>
            )}

            {success && !error && (
              <div className="mt-4 bg-green-500/10 border border-green-500/50 rounded-lg p-4 flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-green-400 font-medium">Success!</p>
                  <p className="text-green-300 text-sm mt-1">
                    Parsed {items.length} items from {fileType}.xml
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Results Section */}
          {items.length > 0 && (
            <>
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-white">
                    Parsed Items ({items.length})
                  </h2>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                      Export XML
                    </button>
                    <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                      Validate All
                    </button>
                  </div>
                </div>

                <div className="bg-gray-900/50 rounded-lg border border-gray-700 overflow-hidden">
                  <ItemTable items={items} />
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4">
                  <div className="text-gray-400 text-sm mb-1">Total Items</div>
                  <div className="text-2xl font-bold text-white">{items.length}</div>
                </div>
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4">
                  <div className="text-gray-400 text-sm mb-1">Total Nominal</div>
                  <div className="text-2xl font-bold text-green-500">
                    {items.reduce((sum, item) => sum + item.nominal, 0)}
                  </div>
                </div>
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4">
                  <div className="text-gray-400 text-sm mb-1">Avg Lifetime</div>
                  <div className="text-2xl font-bold text-blue-500">
                    {Math.round(items.reduce((sum, item) => sum + item.lifetime, 0) / items.length)}s
                  </div>
                </div>
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4">
                  <div className="text-gray-400 text-sm mb-1">File Type</div>
                  <div className="text-2xl font-bold text-purple-500 capitalize">{fileType}</div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
