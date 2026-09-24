/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar, TabType } from './frontend/components/Navbar.tsx';
import { HomeTab } from './frontend/components/HomeTab.tsx';
import { SourceEditorTab } from './frontend/components/SourceEditorTab.tsx';
import { ContractOverviewTab } from './frontend/components/ContractOverviewTab.tsx';
import { ReadWriteTab } from './frontend/components/ReadWriteTab.tsx';
import { CallGraphTab } from './frontend/components/CallGraphTab.tsx';
import { DelegatecallTab } from './frontend/components/DelegatecallTab.tsx';
import { SensitiveOpsTab } from './frontend/components/SensitiveOpsTab.tsx';
import { AttackPathsTab } from './frontend/components/AttackPathsTab.tsx';
import { StorageLayoutTab } from './frontend/components/StorageLayoutTab.tsx';
import { ExportTab } from './frontend/components/ExportTab.tsx';
import { DocsTab } from './frontend/components/DocsTab.tsx';
import { DEMO_CONTRACTS, DemoContract } from './analyzer/examples/demoContracts.ts';
import { AnalysisResult } from './analyzer/models/types.ts';
import { AlertCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [files, setFiles] = useState<{ filename: string; content: string }[]>(
    DEMO_CONTRACTS[3].sources
  );
  const [activeFileIndex, setActiveFileIndex] = useState<number>(0);
  const [compilerVersion, setCompilerVersion] = useState<string>('0.8.20');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [progressStep, setProgressStep] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const PROGRESS_STEPS = [
    'Parsing source',
    'Building AST',
    'Extracting contracts',
    'Extracting functions',
    'Extracting state variables',
    'Building function graph',
    'Extracting reads/writes',
    'Detecting delegatecall',
    'Detecting sensitive operations',
    'Searching attack paths',
    'Calculating storage layout',
    'Generating candidate paths',
  ];

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setError(null);

    // Step progress simulation
    for (let i = 0; i < PROGRESS_STEPS.length; i++) {
      setProgressStep(PROGRESS_STEPS[i]);
      await new Promise((r) => setTimeout(r, 60));
    }

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sources: files,
          compilerVersion,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.details || errData.error || 'Failed to complete static analysis');
      }

      const data: AnalysisResult = await response.json();
      setResult(data);
      setActiveTab('overview');
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err?.message || 'Error occurred during contract static analysis');
    } finally {
      setIsAnalyzing(false);
      setProgressStep(null);
    }
  };

  const handleSelectDemo = (demo: DemoContract) => {
    setFiles(demo.sources);
    setActiveFileIndex(0);
    setCompilerVersion(demo.compilerVersion);
    setActiveTab('editor');
  };

  // Perform initial analysis on load
  useEffect(() => {
    handleAnalyze();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600/30">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        candidateCount={result?.candidateAttackPaths.length || 0}
        hasAnalysis={!!result}
        compilerVersion={compilerVersion}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Static Analysis Error:</span>
              <p className="mt-0.5 text-slate-300">{error}</p>
            </div>
          </div>
        )}

        {/* Tab Switcher */}
        {activeTab === 'home' && (
          <HomeTab
            onSelectDemo={(demo) => {
              handleSelectDemo(demo);
            }}
            onGoToEditor={() => setActiveTab('editor')}
          />
        )}

        {activeTab === 'editor' && (
          <SourceEditorTab
            files={files}
            setFiles={setFiles}
            activeFileIndex={activeFileIndex}
            setActiveFileIndex={setActiveFileIndex}
            compilerVersion={compilerVersion}
            setCompilerVersion={setCompilerVersion}
            onAnalyze={handleAnalyze}
            isAnalyzing={isAnalyzing}
            progressStep={progressStep}
            onSelectDemo={handleSelectDemo}
          />
        )}

        {result && (
          <>
            {activeTab === 'overview' && <ContractOverviewTab result={result} />}
            {activeTab === 'readwrite' && <ReadWriteTab result={result} />}
            {activeTab === 'callgraph' && <CallGraphTab result={result} />}
            {activeTab === 'delegatecalls' && <DelegatecallTab result={result} />}
            {activeTab === 'sensitive' && <SensitiveOpsTab result={result} />}
            {activeTab === 'attackpaths' && (
              <AttackPathsTab
                result={result}
                sourceCode={files[activeFileIndex]?.content || ''}
              />
            )}
            {activeTab === 'storage' && <StorageLayoutTab result={result} />}
            {activeTab === 'export' && <ExportTab result={result} />}
          </>
        )}

        {activeTab === 'docs' && <DocsTab />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-slate-500 text-xs text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span className="font-semibold text-slate-400">SmartShield Group 1</span> — Delegatecall
            Attack-Path Search & Static Analysis Module
          </div>
          <div className="text-[11px] text-slate-600">
            Inspired by DelegateTracker • Candidate paths require Group 2 symbolic validation
          </div>
        </div>
      </footer>
    </div>
  );
}
