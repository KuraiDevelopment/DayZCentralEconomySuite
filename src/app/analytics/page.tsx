'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, TrendingUp, TrendingDown, AlertTriangle, 
  CheckCircle, BarChart3, PieChart, Activity, Zap,
  Package, Clock, Target, Award, FileText, Download
} from 'lucide-react';
import { useEconomyStore } from '@/store/economyStore';
import { ITEM_CATEGORIES } from '@/constants';
import type { ItemCategory, DayZItem } from '@/types/dayz';
import {
  PieChart as RechartsPie,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from 'recharts';

export default function AnalyticsPage() {
  const { items } = useEconomyStore();
  const [selectedView, setSelectedView] = useState<'overview' | 'categories' | 'tiers' | 'performance'>('overview');

  // Calculate comprehensive statistics
  const analytics = useMemo(() => {
    if (items.length === 0) return null;

    const stats = {
      totalItems: items.length,
      totalNominal: 0,
      avgNominal: 0,
      avgLifetime: 0,
      avgRestock: 0,
      categoryDistribution: {} as Record<string, { count: number; nominal: number; items: DayZItem[] }>,
      tierDistribution: {} as Record<string, number>,
      usageDistribution: {} as Record<string, number>,
      lifetimeRanges: {
        'Under 1h': 0,
        '1-2h': 0,
        '2-4h': 0,
        '4-8h': 0,
        'Over 8h': 0,
      },
      flagStats: {
        count_in_cargo: 0,
        count_in_hoarder: 0,
        count_in_map: 0,
        count_in_player: 0,
        crafted: 0,
        deloot: 0,
      },
      topSpawners: [] as DayZItem[],
      balanceScore: 0,
      warnings: [] as string[],
    };

    let totalLifetime = 0;
    let totalRestock = 0;

    // Initialize categories
    Object.keys(ITEM_CATEGORIES).forEach(cat => {
      stats.categoryDistribution[cat] = { count: 0, nominal: 0, items: [] };
    });
    stats.categoryDistribution['uncategorized'] = { count: 0, nominal: 0, items: [] };

    items.forEach(item => {
      // Nominal stats
      stats.totalNominal += item.nominal;
      totalLifetime += item.lifetime;
      totalRestock += item.restock;

      // Category distribution
      const category = item.category || 'uncategorized';
      if (!stats.categoryDistribution[category]) {
        stats.categoryDistribution[category] = { count: 0, nominal: 0, items: [] };
      }
      stats.categoryDistribution[category].count++;
      stats.categoryDistribution[category].nominal += item.nominal;
      stats.categoryDistribution[category].items.push(item);

      // Tier distribution
      if (item.value) {
        const tiers = Array.isArray(item.value) ? item.value : [item.value];
        tiers.forEach(tier => {
          stats.tierDistribution[tier] = (stats.tierDistribution[tier] || 0) + 1;
        });
      }

      // Usage distribution
      if (item.usage) {
        const usages = Array.isArray(item.usage) ? item.usage : [item.usage];
        usages.forEach(usage => {
          stats.usageDistribution[usage] = (stats.usageDistribution[usage] || 0) + 1;
        });
      }

      // Lifetime ranges
      const hours = item.lifetime / 3600;
      if (hours < 1) stats.lifetimeRanges['Under 1h']++;
      else if (hours < 2) stats.lifetimeRanges['1-2h']++;
      else if (hours < 4) stats.lifetimeRanges['2-4h']++;
      else if (hours < 8) stats.lifetimeRanges['4-8h']++;
      else stats.lifetimeRanges['Over 8h']++;

      // Flag stats - count items where flag is set to "1" (enabled)
      // Handle both string '1' and potential number 1 or boolean true
      if (item.flags) {
        if (String(item.flags.count_in_cargo) === '1') {
          stats.flagStats.count_in_cargo++;
        }
        if (String(item.flags.count_in_hoarder) === '1') {
          stats.flagStats.count_in_hoarder++;
        }
        if (String(item.flags.count_in_map) === '1') {
          stats.flagStats.count_in_map++;
        }
        if (String(item.flags.count_in_player) === '1') {
          stats.flagStats.count_in_player++;
        }
        if (String(item.flags.crafted) === '1') {
          stats.flagStats.crafted++;
        }
        if (String(item.flags.deloot) === '1') {
          stats.flagStats.deloot++;
        }
      }
    });

    // Calculate averages
    stats.avgNominal = Math.round(stats.totalNominal / items.length);
    stats.avgLifetime = Math.round(totalLifetime / items.length);
    stats.avgRestock = Math.round(totalRestock / items.length);

    // Top spawners (highest nominal)
    stats.topSpawners = [...items]
      .sort((a, b) => b.nominal - a.nominal)
      .slice(0, 10);

    // Balance score calculation (0-100)
    let score = 100;
    
    // Check category diversity
    const categoriesUsed = Object.values(stats.categoryDistribution).filter(c => c.count > 0).length;
    if (categoriesUsed < 5) score -= 20;

    // Check tier distribution
    const tiersUsed = Object.keys(stats.tierDistribution).length;
    if (tiersUsed < 3) score -= 15;

    // Check for extreme nominals
    const extremeNominals = items.filter(i => i.nominal > 200 || i.nominal < 1).length;
    if (extremeNominals > items.length * 0.1) score -= 15;

    // Check for very short/long lifetimes
    const extremeLifetimes = items.filter(i => i.lifetime < 1800 || i.lifetime > 28800).length;
    if (extremeLifetimes > items.length * 0.2) score -= 10;

    stats.balanceScore = Math.max(0, score);

    // Generate warnings
    if (stats.totalNominal > 50000) {
      stats.warnings.push('High server load: Total nominal spawns exceed 50,000');
    }
    if (categoriesUsed < 5) {
      stats.warnings.push('Low category diversity: Consider adding more item categories');
    }
    if (stats.categoryDistribution.weapons?.nominal > stats.totalNominal * 0.4) {
      stats.warnings.push('Weapon-heavy economy: Weapons make up >40% of spawns');
    }
    if (tiersUsed < 3) {
      stats.warnings.push('Limited tier progression: Only using ' + tiersUsed + ' tiers');
    }

    return stats;
  }, [items]);

  if (items.length === 0) {
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
                  <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
                  <p className="text-sm text-gray-400">Economy statistics and insights</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-6 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-12 text-center">
              <BarChart3 className="h-16 w-16 mx-auto mb-6 text-red-500 opacity-50" />
              <h2 className="text-2xl font-bold text-white mb-4">No Data Available</h2>
              <p className="text-gray-400 text-lg mb-6">
                Import a types.xml file to view analytics and insights.
              </p>
              <Link
                href="/item-editor"
                className="inline-block px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Import Data
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!analytics) return null;

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

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
                <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
                <p className="text-sm text-gray-400">Economy statistics and insights</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Report
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-6">
        {/* View Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'categories', label: 'Categories', icon: Package },
            { id: 'tiers', label: 'Tiers & Balance', icon: Target },
            { id: 'performance', label: 'Performance', icon: Zap },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSelectedView(id as typeof selectedView)}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                selectedView === id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {selectedView === 'overview' && (
          <div className="space-y-6">
            {/* Balance Score Card */}
            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/50 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Award className="h-8 w-8 text-blue-400" />
                    <h2 className="text-2xl font-bold text-white">Economy Health Score</h2>
                  </div>
                  <p className="text-gray-300">Overall balance and configuration quality</p>
                </div>
                <div className="text-right">
                  <div className={`text-6xl font-bold ${
                    analytics.balanceScore >= 80 ? 'text-green-400' :
                    analytics.balanceScore >= 60 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {analytics.balanceScore}
                  </div>
                  <div className="text-gray-400">/ 100</div>
                </div>
              </div>
            </div>

            {/* Warnings */}
            {analytics.warnings.length > 0 && (
              <div className="bg-yellow-600/10 border border-yellow-600/50 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  <h3 className="text-lg font-bold text-white">Recommendations</h3>
                </div>
                <ul className="space-y-2">
                  {analytics.warnings.map((warning, idx) => (
                    <li key={idx} className="text-yellow-200 flex items-start gap-2">
                      <span className="text-yellow-500 mt-1">•</span>
                      {warning}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={<FileText className="h-6 w-6 text-blue-500" />}
                label="Total Items"
                value={analytics.totalItems.toLocaleString()}
                color="blue"
              />
              <StatCard
                icon={<Package className="h-6 w-6 text-green-500" />}
                label="Total Nominal Spawns"
                value={analytics.totalNominal.toLocaleString()}
                color="green"
                subtitle={`${analytics.avgNominal} avg per item`}
              />
              <StatCard
                icon={<Clock className="h-6 w-6 text-purple-500" />}
                label="Avg Lifetime"
                value={`${Math.floor(analytics.avgLifetime / 60)}m`}
                color="purple"
                subtitle={`${Math.floor(analytics.avgLifetime / 3600)}h ${Math.floor((analytics.avgLifetime % 3600) / 60)}m`}
              />
              <StatCard
                icon={<Activity className="h-6 w-6 text-orange-500" />}
                label="Avg Restock"
                value={`${Math.floor(analytics.avgRestock / 60)}m`}
                color="orange"
                subtitle={`${analytics.avgRestock}s`}
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category Distribution */}
              <ChartCard title="Category Distribution" subtitle="Items per category">
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPie>
                    <Pie
                      data={Object.entries(analytics.categoryDistribution)
                        .filter(([_, data]) => data.count > 0)
                        .map(([name, data]) => ({ name, value: data.count }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {Object.entries(analytics.categoryDistribution)
                        .filter(([_, data]) => data.count > 0)
                        .map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPie>
                </ResponsiveContainer>
              </ChartCard>

              {/* Tier Distribution */}
              <ChartCard title="Tier Distribution" subtitle="Loot tier progression">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={Object.entries(analytics.tierDistribution).map(([name, value]) => ({ name, value }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {selectedView === 'categories' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category Spawn Distribution */}
              <ChartCard title="Nominal by Category" subtitle="Spawn distribution across categories">
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart 
                    data={Object.entries(analytics.categoryDistribution)
                      .filter(([_, data]) => data.count > 0)
                      .map(([name, data]) => ({ name, nominal: data.nominal, count: data.count }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9ca3af" angle={-45} textAnchor="end" height={100} />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                    <Legend />
                    <Bar dataKey="nominal" fill="#10b981" name="Total Nominal" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Usage Distribution */}
              <ChartCard title="Usage Flags" subtitle="Item usage categories">
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={Object.entries(analytics.usageDistribution).map(([name, value]) => ({ name, value }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9ca3af" angle={-45} textAnchor="end" height={100} />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                    <Bar dataKey="value" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            {/* Category Details Table */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-4">Category Details</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left text-gray-400 font-medium py-3 px-4">Category</th>
                        <th className="text-right text-gray-400 font-medium py-3 px-4">Items</th>
                        <th className="text-right text-gray-400 font-medium py-3 px-4">Total Nominal</th>
                        <th className="text-right text-gray-400 font-medium py-3 px-4">Avg Nominal</th>
                        <th className="text-right text-gray-400 font-medium py-3 px-4">% of Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(analytics.categoryDistribution)
                        .filter(([_, data]) => data.count > 0)
                        .sort(([, a], [, b]) => b.nominal - a.nominal)
                        .map(([category, data]) => (
                          <tr key={category} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                            <td className="py-3 px-4 text-white font-medium capitalize">{category}</td>
                            <td className="py-3 px-4 text-right text-gray-300">{data.count}</td>
                            <td className="py-3 px-4 text-right text-gray-300">{data.nominal.toLocaleString()}</td>
                            <td className="py-3 px-4 text-right text-gray-300">
                              {Math.round(data.nominal / data.count)}
                            </td>
                            <td className="py-3 px-4 text-right text-gray-300">
                              {((data.nominal / analytics.totalNominal) * 100).toFixed(1)}%
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tiers & Balance Tab */}
        {selectedView === 'tiers' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Lifetime Distribution */}
              <ChartCard title="Lifetime Distribution" subtitle="Item persistence ranges">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={Object.entries(analytics.lifetimeRanges).map(([name, value]) => ({ name, value }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                    <Bar dataKey="value" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Top Spawners */}
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">Top 10 Spawners</h3>
                <p className="text-sm text-gray-400 mb-4">Items with highest nominal values</p>
                <div className="space-y-2">
                  {analytics.topSpawners.map((item, idx) => (
                    <div key={item.name} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="text-gray-500 font-bold text-sm">#{idx + 1}</div>
                        <div>
                          <div className="text-white font-medium">{item.name}</div>
                          <div className="text-xs text-gray-400 capitalize">{item.category || 'uncategorized'}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-green-400 font-bold">{item.nominal}</div>
                        <div className="text-xs text-gray-500">nominal</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Performance Tab */}
        {selectedView === 'performance' && (
          <div className="space-y-6">
            {/* Server Load Card */}
            <div className={`border rounded-lg p-6 ${
              analytics.totalNominal > 50000 
                ? 'bg-red-600/10 border-red-600/50' 
                : analytics.totalNominal > 30000
                ? 'bg-yellow-600/10 border-yellow-600/50'
                : 'bg-green-600/10 border-green-600/50'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Zap className={`h-6 w-6 ${
                      analytics.totalNominal > 50000 ? 'text-red-400' :
                      analytics.totalNominal > 30000 ? 'text-yellow-400' : 'text-green-400'
                    }`} />
                    <h3 className="text-xl font-bold text-white">Server Load Analysis</h3>
                  </div>
                  <p className="text-gray-300">
                    {analytics.totalNominal > 50000 
                      ? 'High load - Consider reducing nominal values'
                      : analytics.totalNominal > 30000
                      ? 'Moderate load - Server should handle well'
                      : 'Low load - Server will run smoothly'
                    }
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-white">{analytics.totalNominal.toLocaleString()}</div>
                  <div className="text-gray-400">Total Spawns</div>
                </div>
              </div>
            </div>

            {/* Flag Statistics */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-2">Configuration Flags</h3>
              <p className="text-sm text-gray-400 mb-4">Items with specific flags enabled (set to 1)</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(analytics.flagStats).map(([flag, count]) => {
                  const percentage = analytics.totalItems > 0 
                    ? ((count / analytics.totalItems) * 100).toFixed(1)
                    : '0.0';
                  const isHigh = parseFloat(percentage) > 50;
                  const isLow = parseFloat(percentage) < 10;
                  
                  return (
                    <div key={flag} className="bg-gray-700/30 rounded-lg p-4">
                      <div className="flex items-baseline gap-2 mb-1">
                        <div className="text-2xl font-bold text-white">{count}</div>
                        <div className={`text-sm font-medium ${
                          isHigh ? 'text-green-400' : isLow ? 'text-red-400' : 'text-blue-400'
                        }`}>
                          ({percentage}%)
                        </div>
                      </div>
                      <div className="text-sm text-gray-400 capitalize">
                        {flag.replace(/_/g, ' ')}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 p-4 bg-gray-700/20 rounded-lg">
                <div className="text-sm text-gray-400">
                  <strong className="text-white">Flag Guide:</strong>
                  <ul className="mt-2 space-y-1 ml-4">
                    <li><span className="text-blue-400">count_in_map:</span> Counts toward server spawn limit</li>
                    <li><span className="text-blue-400">count_in_cargo:</span> Counts when in vehicles/containers</li>
                    <li><span className="text-blue-400">count_in_hoarder:</span> Counts in player stashes</li>
                    <li><span className="text-blue-400">count_in_player:</span> Counts in player inventory</li>
                    <li><span className="text-blue-400">crafted:</span> Can be crafted by players</li>
                    <li><span className="text-blue-400">deloot:</span> Can spawn as loot</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <h3 className="text-xl font-bold text-white">Performance Recommendations</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="text-green-500 mt-1">✓</div>
                  <div>
                    <div className="text-white font-medium">Optimal Lifetime Range</div>
                    <div className="text-sm text-gray-400">Keep most items between 2-4 hours for best balance</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="text-green-500 mt-1">✓</div>
                  <div>
                    <div className="text-white font-medium">Restock Timing</div>
                    <div className="text-sm text-gray-400">5-10 minute restock intervals recommended for smooth gameplay</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="text-green-500 mt-1">✓</div>
                  <div>
                    <div className="text-white font-medium">Total Spawn Target</div>
                    <div className="text-sm text-gray-400">Aim for 20,000-35,000 total nominal for 60-player servers</div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Stat Card Component
function StatCard({ 
  icon, 
  label, 
  value, 
  color, 
  subtitle 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  color: string;
  subtitle?: string;
}) {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-3">
        {icon}
        <div className="text-sm text-gray-400">{label}</div>
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      {subtitle && <div className="text-sm text-gray-500">{subtitle}</div>}
    </div>
  );
}

// Chart Card Component
function ChartCard({ 
  title, 
  subtitle, 
  children 
}: { 
  title: string; 
  subtitle: string; 
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-white">{title}</h3>
        <p className="text-sm text-gray-400">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}
