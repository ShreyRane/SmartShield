/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AnalysisResult, CandidateAttackPath, ContractInfo, ContractIR } from '../analyzer/models/types.ts';

// In-memory store for REST endpoints
class AnalysisStore {
  private currentResult: AnalysisResult | null = null;
  private history: Map<string, AnalysisResult> = new Map();

  public setResult(id: string, result: AnalysisResult) {
    this.currentResult = result;
    this.history.set(id, result);
  }

  public getResult(id?: string): AnalysisResult | null {
    if (id && this.history.has(id)) {
      return this.history.get(id)!;
    }
    return this.currentResult;
  }

  public getAllAttackPaths(): CandidateAttackPath[] {
    return this.currentResult ? this.currentResult.candidateAttackPaths : [];
  }

  public getContract(contractName: string): ContractInfo | undefined {
    return this.currentResult?.ir.contracts.find(
      (c) => c.name.toLowerCase() === contractName.toLowerCase()
    );
  }
}

export const analysisStore = new AnalysisStore();
