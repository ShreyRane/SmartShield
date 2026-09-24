/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  CandidateAttackPath,
  ContractInfo,
  DelegatecallInfo,
  FunctionInfo,
  SensitiveOperation,
  StorageSlotInfo,
} from '../models/types.ts';
import { VulnerabilityPatternEngine } from '../patterns/VulnerabilityPatternEngine.ts';

export class AttackPathGenerator {
  /**
   * Generates CandidateAttackPath objects following the DelegateTracker methodology:
   * 1. Detects externally reachable functions.
   * 2. Detects sensitive operations (selfdestruct, Ether transfer, condition disorder).
   * 3. Traces which state variables influence those sensitive operations.
   * 4. Searches for writer functions that modify those variables (including via delegatecall callee).
   * 5. Correlates EVM storage slots.
   * 6. Produces strict CandidateAttackPath representations for Group 2 symbolic validation.
   */
  public static generateAttackPaths(
    contracts: ContractInfo[],
    functions: FunctionInfo[],
    delegatecalls: DelegatecallInfo[],
    sensitiveOps: SensitiveOperation[],
    storageLayout: StorageSlotInfo[]
  ): CandidateAttackPath[] {
    const candidatePaths: CandidateAttackPath[] = [];
    let counter = 1;

    // Identify primary caller contract (the one containing delegatecall)
    // and callee contracts
    const primaryDelegatecall = delegatecalls.length > 0 ? delegatecalls[0] : null;
    const callerContractName = primaryDelegatecall ? primaryDelegatecall.contract : (contracts[0]?.name || null);

    // Identify potential callee contracts
    const calleeContractNames = contracts
      .filter((c) => c.name !== callerContractName)
      .map((c) => c.name);

    // Filter functions by reachability
    // An attacker can directly invoke public/external functions, or trigger fallback/receive
    const externallyCallable = functions.filter(
      (f) => f.externalReachability || f.isFallback || f.isReceive
    );

    // Match patterns
    const rawMatches = VulnerabilityPatternEngine.findPatternMatches(
      externallyCallable,
      functions,
      sensitiveOps,
      delegatecalls
    );

    // Deduplicate and enrich into CandidateAttackPath
    const seenSignatures = new Set<string>();

    for (const match of rawMatches) {
      const { writerFunction, readerFunction, vulnerabilityVariable, sensitiveOp, reason, confidence } = match;

      // Unique signature
      const sig = `${writerFunction.contract}.${writerFunction.name}->${vulnerabilityVariable}->${readerFunction.contract}.${readerFunction.name}->${sensitiveOp.type}`;
      if (seenSignatures.has(sig)) continue;
      seenSignatures.add(sig);

      // Find storage slot info for vulnerabilityVariable
      const slotInfo = storageLayout.find(
        (s) =>
          s.name === vulnerabilityVariable &&
          (s.contract === readerFunction.contract || s.contract === writerFunction.contract || s.contract === callerContractName)
      );

      // Delegatecall context
      let relevantDelegatecall = delegatecalls.find(
        (d) => d.contract === writerFunction.contract || d.contract === readerFunction.contract
      );

      if (!relevantDelegatecall && delegatecalls.length > 0) {
        relevantDelegatecall = delegatecalls[0];
      }

      const id = `AP-${String(counter++).padStart(3, '0')}`;

      const candidatePath: CandidateAttackPath = {
        id,
        callerContract: relevantDelegatecall ? relevantDelegatecall.contract : (readerFunction.contract || null),
        calleeContract:
          relevantDelegatecall && relevantDelegatecall.targetContractName
            ? relevantDelegatecall.targetContractName
            : calleeContractNames.length > 0
            ? calleeContractNames[0]
            : null,
        delegatecallLocation: {
          function: relevantDelegatecall ? relevantDelegatecall.function : 'N/A',
          line: relevantDelegatecall ? relevantDelegatecall.sourceLocation.line : null,
          column: relevantDelegatecall ? relevantDelegatecall.sourceLocation.column : null,
        },
        vulnerabilityType: match.vulnerabilityType,
        path: [writerFunction.name, readerFunction.name],
        vulnerabilityVariable,
        writerFunction: writerFunction.name,
        readerFunction: readerFunction.name,
        sensitiveOperation: {
          type: sensitiveOp.type,
          function: sensitiveOp.function,
        },
        storage: {
          slot: slotInfo ? slotInfo.slot : '0',
          offset: slotInfo ? slotInfo.offset : 0,
          confidence: slotInfo && !slotInfo.isComplex ? confidence : 'LOW',
        },
        reason,
        status: 'CANDIDATE',
        validationRequired: true,
      };

      candidatePaths.push(candidatePath);
    }

    return candidatePaths;
  }
}
