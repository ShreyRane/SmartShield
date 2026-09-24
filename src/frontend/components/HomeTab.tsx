/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Shield,
  FileCode,
  Share2,
  AlertTriangle,
  ArrowRight,
  GitCompare,
  Database,
  Terminal,
  ExternalLink,
  Cpu,
  Layers,
} from 'lucide-react';
import { DEMO_CONTRACTS, DemoContract } from '../../analyzer/examples/demoContracts.ts';

interface HomeTabProps {
  onSelectDemo: (demo: DemoContract) => void;
  onGoToEditor: () => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({ onSelectDemo, onGoToEditor }) => {
  return (
    <div className="space-y-10 pb-12">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 p-8 sm:p-12 shadow-2xl">
        <div className="absolute -right-16 -top-16 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-6">
            <span>Research Paper Implementation</span>
            <span className="text-slate-500">•</span>
            <span>DelegateTracker Methodology</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            SmartShield <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">Group 1</span>
          </h1>
          <p className="mt-2 text-xl font-medium text-slate-300">
            Delegatecall Attack-Path Search & Static Analysis Module
          </p>

          <p className="mt-4 text-slate-400 text-base leading-relaxed">
            Constructed according to the static analysis pipeline described in{' '}
            <span className="text-slate-200 italic">
              "DelegateTracker: Delegatecall vulnerability detection tool based on read-write data flow capture algorithm"
            </span>
            . SmartShield Group 1 extracts AST data, models storage layout, maps state-variable READ/WRITE operations,
            and detects candidate attack paths for future symbolic validation by Group 2.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-wrap gap-4 items-center">
            <button
              onClick={onGoToEditor}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center space-x-2 cursor-pointer"
            >
              <FileCode className="w-4 h-4" />
              <span>Analyze Custom Solidity Source</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onSelectDemo(DEMO_CONTRACTS[3])}
              className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-medium text-sm transition-all flex items-center space-x-2 cursor-pointer"
            >
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>Load Parity-Style Benchmark</span>
            </button>
          </div>
        </div>

        {/* Important Disclaimer Notice */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-400">
          <div className="flex items-start space-x-2 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-amber-300">Candidate Only Notice:</span> Static attack paths
              are unvalidated candidate chains. They do NOT represent confirmed exploits until formally proven by
              Group 2 symbolic execution.
            </div>
          </div>
          <div className="flex items-start space-x-2 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
            <Cpu className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-blue-300">Deterministic Engine:</span> Core detection runs
              purely via Solidity AST traversal and EVM storage modeling without requiring external node keys or LLMs.
            </div>
          </div>
        </div>
      </div>

      {/* 4-Step Analysis Pipeline Diagram */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
          <Layers className="w-5 h-5 text-blue-400" />
          <span>Stage 1 Static Analysis Pipeline</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-sm mb-3">
              1
            </div>
            <h3 className="text-sm font-semibold text-white">AST & Storage Layout</h3>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Extracts contract hierarchies, functions, signatures, visibility, modifiers, and EVM 32-byte storage slot offsets.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-sm mb-3">
              2
            </div>
            <h3 className="text-sm font-semibold text-white">Read/Write Data Flow</h3>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Scans function bodies to isolate persistent state-variable READs and WRITEs, handling compound increments/deletes.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-sm mb-3">
              3
            </div>
            <h3 className="text-sm font-semibold text-white">Sensitive Operations</h3>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Identifies Category A (selfdestruct), Category B (Ether transfer), and Category C (judgment condition disorder).
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold text-sm mb-3">
              4
            </div>
            <h3 className="text-sm font-semibold text-white">Candidate Attack Paths</h3>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Synthesizes writer-reader-sink chains correlating delegatecalls and storage slots into standardized Group 2 JSON.
            </p>
          </div>
        </div>
      </div>

      {/* Built-in Demo Presets */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Terminal className="w-5 h-5 text-cyan-400" />
              <span>Built-in Educational Examples</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Select one of the 4 reference contracts to test static detection immediately.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DEMO_CONTRACTS.map((demo) => (
            <div
              key={demo.id}
              onClick={() => onSelectDemo(demo)}
              className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-blue-500/40 hover:bg-slate-850 cursor-pointer transition group relative"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-slate-800 text-cyan-400 border border-slate-700 uppercase">
                    {demo.category}
                  </span>
                  <h3 className="text-base font-semibold text-white mt-2 group-hover:text-blue-400 transition">
                    {demo.name}
                  </h3>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition mt-1" />
              </div>

              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                {demo.description}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                <span>File: {demo.sources[0]?.filename}</span>
                <span className="text-blue-400 font-medium">Click to Load & Analyze →</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
