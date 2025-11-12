import Link from 'next/link';
import { FileText, Upload, Database, BarChart3, Settings, FileCode } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-700 bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Database className="h-8 w-8 text-green-500" />
              <h1 className="text-2xl font-bold text-white">DayZ Economy Manager</h1>
            </div>
            <div className="text-sm text-gray-400">Professional Business Suite v1.3.0</div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              All-in-One Economy Management Tool
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Professional suite for managing DayZ Standalone server configurations
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* XML Parser */}
            <Link href="/xml-parser" className="group">
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6 hover:border-green-500 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20">
                <FileCode className="h-12 w-12 text-green-500 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">XML Parser</h3>
                <p className="text-gray-400">
                  Parse and validate 37 DayZ configuration files including types.xml, map groups, limits, and more
                </p>
              </div>
            </Link>

            {/* Item Editor */}
            <Link href="/item-editor" className="group">
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6 hover:border-blue-500 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20">
                <FileText className="h-12 w-12 text-blue-500 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Item Editor</h3>
                <p className="text-gray-400">
                  Visual editor for item configurations: nominal, min, max, lifetime, restock, and more
                </p>
              </div>
            </Link>

            {/* Category Manager */}
            <Link href="/categories" className="group">
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6 hover:border-purple-500 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20">
                <Settings className="h-12 w-12 text-purple-500 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Category Manager</h3>
                <p className="text-gray-400">
                  Organize and manage items by category with advanced filtering and search
                </p>
              </div>
            </Link>

            {/* Import/Export */}
            <Link href="/import-export" className="group">
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6 hover:border-yellow-500 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/20">
                <Upload className="h-12 w-12 text-yellow-500 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Import/Export</h3>
                <p className="text-gray-400">
                  Import existing configurations and export modified files with validation
                </p>
              </div>
            </Link>

            {/* Analytics Dashboard */}
            <Link href="/analytics" className="group">
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6 hover:border-red-500 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20">
                <BarChart3 className="h-12 w-12 text-red-500 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Analytics</h3>
                <p className="text-gray-400">
                  View statistics and insights about your economy balance and item distribution
                </p>
              </div>
            </Link>

            {/* Configuration Templates */}
            <Link href="/templates" className="group">
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6 hover:border-indigo-500 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/20">
                <Database className="h-12 w-12 text-indigo-500 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Templates</h3>
                <p className="text-gray-400">
                  Pre-built configuration templates for different server types and playstyles
                </p>
              </div>
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-lg p-8">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">Key Features</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-500 mb-2">37</div>
                <div className="text-gray-400">Config Files</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-500 mb-2">115K+</div>
                <div className="text-gray-400">Lines Parsed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-500 mb-2">Real-time</div>
                <div className="text-gray-400">Validation</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-500 mb-2">93%</div>
                <div className="text-gray-400">Server Coverage</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-700 bg-gray-900/50 backdrop-blur-sm mt-12">
        <div className="container mx-auto px-6 py-6">
          <div className="text-center text-gray-400 text-sm">
            <p>DayZ Economy Manager - Professional Business Suite for Server Configuration</p>
            <p className="mt-2">Built with Next.js, TypeScript, and Tailwind CSS</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
