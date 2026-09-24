/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Shield,
  FileCode,
  Layers,
  GitCompare,
  Network,
  Share2,
  AlertTriangle,
  Flame,
  Database,
  Download,
  BookOpen,
  Sparkles,
} from 'lucide-react';

export type TabType =
  | 'home'
  | 'editor'
  | 'overview'
  | 'readwrite'
  | 'callgraph'
  | 'delegatecalls'
  | 'sensitive'
  | 'attackpaths'
  | 'storage'
  | 'export'
  | 'docs';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  candidateCount: number;
  hasAnalysis: boolean;
  compilerVersion: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  candidateCount,
  hasAnalysis,
  compilerVersion,
}) => {
  const navItems = [
    { id: 'home' as TabType, label: 'Home', icon: Shield },
    { id: 'editor' as TabType, label: 'Source Analyzer', icon: FileCode },
    { id: 'overview' as TabType, label: 'Overview', icon: Layers, requiresAnalysis: true },
    { id: 'readwrite' as TabType, label: 'Read/Write', icon: GitCompare, requiresAnalysis: true },
    { id: 'callgraph' as TabType, label: 'Call Graph', icon: Network, requiresAnalysis: true },
    { id: 'delegatecalls' as TabType, label: 'Delegatecalls', icon: Share2, requiresAnalysis: true },
    { id: 'sensitive' as TabType, label: 'Sensitive Ops', icon: AlertTriangle, requiresAnalysis: true },
    {
      id: 'attackpaths' as TabType,
      label: 'Attack Paths',
      icon: Flame,
      badge: candidateCount > 0 ? candidateCount : undefined,
      requiresAnalysis: true,
    },
    { id: 'storage' as TabType, label: 'Storage Layout', icon: Database, requiresAnalysis: true },
    { id: 'export' as TabType, label: 'Export', icon: Download, requiresAnalysis: true },
    { id: 'docs' as TabType, label: 'Methodology & API', icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <div
            className="flex items-center space-x-3 cursor-pointer select-none"
            onClick={() => setActiveTab('home')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 border border-blue-400/30">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold tracking-wider text-base bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  SMARTSHIELD
                </span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  GROUP 1
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Delegatecall Attack-Path Search & Static Analysis</p>
            </div>
          </div>

          {/* Right Status & Meta */}
          <div className="hidden md:flex items-center space-x-3 text-xs">
            <div className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-400">
              Compiler: <span className="font-mono text-cyan-400 font-medium">{compilerVersion}</span>
            </div>
            <div className="px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 font-medium flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>Static Candidates Only</span>
            </div>
          </div>
        </div>

        {/* Navigation Bar / Tabs */}
        <nav className="flex space-x-1 overflow-x-auto pb-2 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isDisabled = item.requiresAnalysis && !hasAnalysis;

            return (
              <button
                key={item.id}
                onClick={() => !isDisabled && setActiveTab(item.id)}
                disabled={isDisabled}
                className={`flex items-center space-x-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-sm'
                    : isDisabled
                    ? 'text-slate-600 cursor-not-allowed'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
