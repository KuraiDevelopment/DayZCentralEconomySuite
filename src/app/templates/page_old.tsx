'use client';

import Link from 'next/link';
import { ArrowLeft, Construction } from 'lucide-react';

export default function TemplatesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <header className="border-b border-gray-700 bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                <ArrowLeft className="h-5 w-5 text-gray-400" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white">Configuration Templates</h1>
                <p className="text-sm text-gray-400">Pre-built server configurations</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-12 text-center">
            <Construction className="h-16 w-16 mx-auto mb-6 text-indigo-500" />
            <h2 className="text-3xl font-bold text-white mb-4">Coming Soon</h2>
            <p className="text-gray-400 text-lg mb-6">
              The templates library is currently under development.
            </p>
            <p className="text-gray-500 mb-8">
              This feature will provide pre-built configuration templates for different
              server types: PvP, PvE, RP, Hardcore, and more.
            </p>
            <Link
              href="/xml-parser"
              className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
            >
              Try XML Parser Instead
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
