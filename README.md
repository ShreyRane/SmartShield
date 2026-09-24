# SmartShield – Group 1: Delegatecall Attack-Path Search & Static Analysis Module

> **Mandatory Scope Notice**: This module implements the static attack-path search portion of a DelegateTracker-inspired SmartShield architecture. Candidate paths are not confirmed vulnerabilities until validated dynamically/symbolically by Group 2.

---

## 1. Project Purpose & Context

SmartShield is a comprehensive smart-contract vulnerability analysis framework designed for advanced EVM execution patterns, especially `delegatecall` interactions. The overall SmartShield project is architected across sequential stages:

1. **Stage 1 (Group 1 - This Project):** Static analysis, read-write data flow analysis, and candidate attack-path search.
2. **Stage 2 (Group 2):** Symbolic attack-path validation using constraint solvers (e.g. Z3) and reachability checks.
3. **Stage 3:** Controlled dynamic attack simulation in sandbox environments.
4. **Stage 4:** AI explanation and multi-tier auditing reports.

**You are using Group 1.** This module does **not** make authoritative exploit claims, run symbolic execution, or execute live blockchain transactions. It deterministically analyzes Solidity ASTs to produce **Candidate Attack Paths** formatted specifically for Group 2 ingestion.

---

## 2. Research Paper Alignment

This module is directly modeled on the methodologies outlined in the academic research paper:
> *"DelegateTracker: Delegatecall vulnerability detection tool based on read-write data flow capture algorithm"*

The DelegateTracker architecture divides vulnerability detection into:
1. **Attack Path Search (Static):** Parsing AST, modeling storage layout, tracking persistent state-variable READ/WRITE operations, identifying sensitive operations (selfdestruct, Ether transfer, judgment conditions), and identifying candidate attack paths.
2. **Attack Path Validation (Symbolic):** Validating whether candidate paths are satisfiable and reachable under actual EVM execution constraints.

Group 1 accomplishes **Stage 1 (Attack Path Search)** with mathematical rigor and zero fake keyword matching.

---

## 3. Analysis Methodology & The Three Patterns

The static analysis pipeline follows these formal phases:

```
Solidity Source Code
        ↓
AST & Inheritance Extraction (via @solidity-parser/parser)
        ↓
EVM 32-Byte Storage Layout Modeling (Slot & Offset packing)
        ↓
Read/Write Data Flow Extraction (Distinguishing local vars, params, constants & state)
        ↓
Function Call Graph & Lightweight CFG Generation
        ↓
Delegatecall Target Classification & Resolvability Analysis
        ↓
Sensitive Operation Identification (Cat A: Selfdestruct, Cat B: Transfer, Cat C: Conditions)
        ↓
DelegateTracker Vulnerability Pattern Matching
        ↓
CandidateAttackPath[] Standardized JSON Generation (Handoff to Group 2)
```

### The Three Anomaly Archetypes:
* **Pattern 1: Self-Destruction Anomaly (`SELF_DESTRUCT`)**
  - Function $A$ modifies state variable $X$.
  - Function $B$ reads state variable $X$ and can reach `selfdestruct(...)` or `suicide(...)`.
  - Candidate Path: $A \xrightarrow{X} B \xrightarrow{} \text{selfdestruct}$

* **Pattern 2: Ether-Sending Anomaly (`ETHER_TRANSFER`)**
  - Function $A$ modifies state variable $X$.
  - Function $B$ reads state variable $X$ and can reach `transfer(...)`, `send(...)`, or `.call{value: ...}`.
  - Candidate Path: $A \xrightarrow{X} B \xrightarrow{} \text{transfer}$

* **Pattern 3: Judgment-Condition Disorder (`JUDGMENT_CONDITION`)**
  - Function $A$ modifies state variable $X$.
  - Function $B$ reads state variable $X$ inside a conditional branch, `require(...)`, `assert(...)`, or loop condition.
  - Candidate Path: $A \xrightarrow{X} B \xrightarrow{} \text{condition/branch}$

---

## 4. Standard CandidateAttackPath JSON Schema (Group 2 Interface)

This interface is stable and contractually guaranteed for Group 2:

```typescript
export interface CandidateAttackPath {
  id: string; // e.g. "AP-001"
  callerContract: string | null;
  calleeContract: string | null;
  delegatecallLocation: {
    function: string;
    line: number | null;
    column: number | null;
  };
  vulnerabilityType: "SELF_DESTRUCT" | "ETHER_TRANSFER" | "JUDGMENT_CONDITION";
  path: string[]; // e.g. ["initialize", "execute"]
  vulnerabilityVariable: string; // e.g. "owner"
  writerFunction: string;
  readerFunction: string;
  sensitiveOperation: {
    type: string;
    function: string;
  };
  storage: {
    slot: string | null; // e.g. "0"
    offset: number | null; // e.g. 0
    confidence: "HIGH" | "MEDIUM" | "LOW";
  };
  reason: string;
  status: "CANDIDATE";
  validationRequired: true;
}
```

---

## 5. REST API Reference for Group 2 Integration

The Express backend serves the following programmatic endpoints:

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/analyze` | Submit Solidity sources `{ sources: [{ filename, content }], compilerVersion }`; returns full `ContractIR` and `CandidateAttackPath[]`. |
| `GET` | `/api/attack-paths` | Returns an array of `CandidateAttackPath` objects. |
| `POST` | `/api/attack-paths/export` | Download candidate paths as JSON or CSV (`{ format: "csv" \| "json" }`). |
| `GET` | `/api/contracts/:id` | Returns `ContractInfo` for a specific contract. |
| `GET` | `/api/contracts/:id/functions` | Returns all extracted functions with signatures, selectors, visibility, and modifiers. |
| `GET` | `/api/contracts/:id/read-write` | Returns state variable READ and WRITE operations per function. |
| `GET` | `/api/contracts/:id/delegatecalls` | Returns delegatecall locations, target expressions, and target types. |
| `GET` | `/api/contracts/:id/storage` | Returns computed 32-byte storage slot assignments and byte offsets. |
| `GET` | `/api/contracts/:id/attack-paths` | Returns candidate attack paths filtered by contract. |
| `POST` | `/api/ai-explain-path` | Optional reasoning assistant using Gemini 3.1 Pro preview with high thinking mode. |

---

## 6. Supported Solidity Compiler Versions

* `0.8.20` (Default modern EVM)
* `0.8.19`
* `0.8.0`
* `0.7.6`
* `0.6.12`

*Note: Storage layout and packing rules are compiler-version dependent. The analyzer explicitly outputs the version used for layout calculations.*

---

## 7. Known Limitations & Static Analysis Boundaries

1. **Static False Positives:** Because Group 1 operates statically without an SMT/Z3 solver, a path where Function A writes variable $X$ and Function B reads $X$ is flagged as a candidate even if modifier guards (`onlyOwner`, complex cryptographic hashes) might prevent an attacker from executing both in reality. Group 2 exists specifically to resolve this.
2. **Complex Storage Structures:** Simple types (`uintN`, `intN`, `address`, `bool`, `bytesN`, `enums`) are fully modeled with packing. Mappings and dynamic arrays calculate slot base locations but display: `"Complex storage layout – requires extended analysis."` due to keccak256 hash index hashing.
3. **Unresolved Delegatecall Targets:** If the target of a `delegatecall` is computed dynamically through arbitrary bytecode, static analysis flags it as `computed_expression` with `targetResolved: false`.
4. **No Proof of Exploitability:** This module does not generate exploit payloads or prove live blockchain exploitability.

---

## 8. Running Automated Tests

Run the test suite executing all 14 AST and pattern verification tests:

```bash
npm test
```

Test coverage includes:
- AST extraction and parsing
- Function signature and selector extraction
- State variable extraction
- READ and WRITE detection
- Compound updates (`+=`, `-=`, `++`, `--`, `delete`)
- Function call graph generation
- Delegatecall target classification
- Sensitive operation detection (selfdestruct, transfer, condition disorder)
- Candidate attack path derivation
- False-positive candidate handling (safe delegatecalls without state dependencies produce zero attack paths)

---

## 9. Development & Production Run

```bash
# Install dependencies
npm install

# Run full-stack dev server (Express + Vite) on port 3000
npm run dev

# Build frontend and production assets
npm run build

# Start production server
npm start
```
