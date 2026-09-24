/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Flame,
  ArrowRight,
  ShieldAlert,
  Database,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader2,
  Code,
  Layers,
} from 'lucide-react';
import { AnalysisResult, CandidateAttackPath } from '../../analyzer/models/types.ts';

interface AttackPathsTabProps {
  result: AnalysisResult;
  sourceCode: string;
}

export const AttackPathsTab: React.FC<AttackPathsTabProps> = ({ result, sourceCode }) => {
  const [selectedPath, setSelectedPath] = useState<CandidateAttackPath | null>(null);
  const [aiReport, setAiReport] = useState<{ [pathId: string]: string }>({});
  const [loadingAi, setLoadingAi] = useState<{ [pathId: string]: boolean }>({});

  const paths = result.candidateAttackPaths;

  const handleRequestAiReasoning = async (path: CandidateAttackPath) => {
    setLoadingAi((prev) => ({ ...prev, [path.id]: true }));
    try {
      const res = await fetch('/api/ai-explain-path', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path, sourceCode }),
      });
      const data = await res.json();
      setAiReport((prev) => ({ ...prev, [path.id]: data.explanation || 'No explanation received.' }));
    } catch (err: any) {
      setAiReport((prev) => ({
        ...prev,
        [path.id]: 'Failed to connect to reasoning service. Group 2 symbolic validation recommended.',
      }));
    } finally {
      setLoadingAi((prev) => ({ ...prev, [path.id]: false }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Disclaimer Banner */}
      <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs flex items-start space-x-3">
        <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-rose-300">
            RESEARCH ALIGNMENT NOTICE: CANDIDATE ATTACK PATHS ONLY (GROUP 1 SCOPE)
          </p>
          <p className="text-slate-300 leading-relaxed">
            Candidate paths are generated strictly via static read-write data flow capture. They are{' '}
            <span className="font-bold text-white uppercase">not confirmed vulnerabilities</span> until formally validated
            by Group 2 using symbolic execution constraint solvers (e.g., Z3) and dynamic test vectors.
          </p>
        </div>
      </div>

      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Flame className="w-5 h-5 text-rose-400" />
            <span>Candidate Attack Paths for Group 2 Validation</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Data-flow sequences connecting externally reachable state mutation functions to sensitive sinks.
          </p>
        </div>

        <div className="text-xs font-mono px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
          Total Candidates: <span className="text-rose-400 font-bold">{paths.length}</span>
        </div>
      </div>

      {paths.length === 0 ? (
        <div className="p-12 text-center bg-slate-950 border border-slate-800 rounded-xl space-y-3">
          <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
          <h3 className="text-sm font-bold text-white">No Candidate Attack Paths Detected</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Static data flow analysis did not detect any externally accessible writer functions influencing state variables
            read by sensitive sinks or judgment conditions.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {paths.map((path) => {
            const isSelected = selectedPath?.id === path.id;
            const explanation = aiReport[path.id];
            const isLoadingThis = loadingAi[path.id];

            return (
              <div
                key={path.id}
                className={`bg-slate-900/90 border rounded-2xl p-6 shadow-xl space-y-5 transition-all ${
                  isSelected ? 'border-rose-500/50 shadow-rose-500/5' : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Card Top Row: ID, Badges, Status */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-4">
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-base font-extrabold text-white bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
                      {path.id}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                        path.vulnerabilityType === 'SELF_DESTRUCT'
                          ? 'bg-rose-950/50 text-rose-400 border border-rose-500/30'
                          : path.vulnerabilityType === 'ETHER_TRANSFER'
                          ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-500/30'
                          : 'bg-purple-950/50 text-purple-400 border border-purple-500/30'
                      }`}
                    >
                      {path.vulnerabilityType.replace('_', ' ')}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                      {path.status}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
                    <span>Validation:</span>
                    <span className="text-amber-400 font-bold">REQUIRED (Stage 2)</span>
                  </div>
                </div>

                {/* Visual Attack Path Chain */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80">
                  <div className="text-[11px] font-mono text-slate-500 uppercase mb-3">
                    Candidate Data Flow Sequence:
                  </div>
                  <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                    {/* Writer Node */}
                    <div className="px-3 py-2 rounded-lg bg-slate-900 border border-blue-500/30 text-blue-300">
                      <div className="text-[9px] uppercase text-slate-500">1. Externally Callable Writer</div>
                      <span className="font-bold">{path.writerFunction}()</span>
                    </div>

                    <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />

                    {/* State Variable Node */}
                    <div className="px-3 py-2 rounded-lg bg-slate-900 border border-rose-500/30 text-rose-300">
                      <div className="text-[9px] uppercase text-slate-500">2. Vulnerability Variable</div>
                      <span className="font-bold font-mono">
                        {path.vulnerabilityVariable}{' '}
                        <span className="text-slate-500 text-[10px]">(slot {path.storage.slot})</span>
                      </span>
                    </div>

                    <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />

                    {/* Reader Node */}
                    <div className="px-3 py-2 rounded-lg bg-slate-900 border border-indigo-500/30 text-indigo-300">
                      <div className="text-[9px] uppercase text-slate-500">3. Reader Function</div>
                      <span className="font-bold">{path.readerFunction}()</span>
                    </div>

                    <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />

                    {/* Sensitive Sink */}
                    <div className="px-3 py-2 rounded-lg bg-slate-900 border border-purple-500/30 text-purple-300">
                      <div className="text-[9px] uppercase text-slate-500">4. Sensitive Execution Sink</div>
                      <span className="font-bold">{path.sensitiveOperation.type}</span>
                    </div>
                  </div>
                </div>

                {/* Storage & Delegatecall Context Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">Target Storage Slot</span>
                    <span className="font-mono text-cyan-400 font-semibold mt-0.5 block">
                      Slot {path.storage.slot} (Offset {path.storage.offset}B)
                    </span>
                    <span className="text-[10px] text-slate-500">Confidence: {path.storage.confidence}</span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">Caller / Callee Context</span>
                    <span className="font-mono text-slate-200 mt-0.5 block truncate">
                      {path.callerContract || 'Self'} → {path.calleeContract || 'Internal'}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Delegatecall: {path.delegatecallLocation.function}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 sm:col-span-2">
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">Static Reason</span>
                    <p className="text-slate-300 mt-0.5 text-xs leading-relaxed">{path.reason}</p>
                  </div>
                </div>

                {/* Group 2 Validation Instructions & AI Deep Reasoning */}
                <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-[11px] text-slate-400 flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Group 2 Action: Verify if constraints allow attacker to invoke {path.writerFunction}() before {path.readerFunction}().</span>
                  </div>

                  <button
                    onClick={() => handleRequestAiReasoning(path)}
                    disabled={isLoadingThis}
                    className="px-3.5 py-1.5 rounded-lg bg-blue-950/40 hover:bg-blue-900/50 text-blue-300 border border-blue-500/30 text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
                  >
                    {isLoadingThis ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Thinking (Gemini 3.1 Pro)...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Deep Reasoning Report (Gemini 3.1 Pro High Thinking)</span>
                      </>
                    )}
                  </button>
                </div>

                {/* AI Explanation Accordion / Panel */}
                {explanation && (
                  <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-blue-500/30 text-xs space-y-2 text-slate-300 font-sans">
                    <div className="flex items-center space-x-2 text-blue-400 font-bold border-b border-slate-800 pb-2">
                      <Sparkles className="w-4 h-4" />
                      <span>Formal Symbolic Validation Objective & Explanation</span>
                    </div>
                    <div className="prose prose-invert max-w-none text-xs leading-relaxed whitespace-pre-wrap">
                      {explanation}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
