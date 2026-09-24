/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface DemoContract {
  id: string;
  name: string;
  category: string;
  description: string;
  compilerVersion: string;
  sources: { filename: string; content: string }[];
  expectedFinding: string;
}

export const DEMO_CONTRACTS: DemoContract[] = [
  {
    id: 'demo-1',
    name: 'Vulnerable Delegatecall Proxy',
    category: 'Delegatecall Overwrite',
    description:
      'A classic unvalidated delegatecall proxy. The implementation contract can overwrite the owner storage slot of the proxy, and execute() reads owner to allow draining Ether.',
    compilerVersion: '0.8.20',
    expectedFinding:
      'Candidate attack path: setOwner() or initialize() writes owner, execute() reads owner and triggers transfer()',
    sources: [
      {
        filename: 'VulnerableProxy.sol',
        content: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract VulnerableProxy {
    address public owner;
    address public implementation;
    uint256 public balance;

    constructor(address _implementation) {
        owner = msg.sender;
        implementation = _implementation;
    }

    fallback() external payable {
        (bool success, ) = implementation.delegatecall(msg.data);
        require(success, "Delegatecall failed");
    }

    function execute(address payable recipient, uint256 amount) public {
        require(msg.sender == owner, "Caller is not owner");
        recipient.transfer(amount);
    }
}

contract Implementation {
    address public owner;
    address public implementation;

    function setOwner(address newOwner) public {
        owner = newOwner;
    }
}
`,
      },
    ],
  },
  {
    id: 'demo-2',
    name: 'Safe Delegatecall with Access Control',
    category: 'Protected Delegatecall',
    description:
      'A safe delegatecall pattern where delegatecall can only be invoked by authorized owner, and the implementation logic does not overwrite critical state.',
    compilerVersion: '0.8.20',
    expectedFinding:
      'Delegatecall is detected, but no dangerous unvalidated state-variable attack path is produced.',
    sources: [
      {
        filename: 'SafeProxy.sol',
        content: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SafeProxy {
    address public immutable owner;
    address public implementation;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner permitted");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function setImplementation(address _impl) external onlyOwner {
        implementation = _impl;
    }

    function forward(bytes calldata data) external onlyOwner returns (bytes memory) {
        (bool success, bytes memory result) = implementation.delegatecall(data);
        require(success, "Forwarding failed");
        return result;
    }
}
`,
      },
    ],
  },
  {
    id: 'demo-3',
    name: 'Storage Collision & Judgment Condition Disorder',
    category: 'Condition Disorder',
    description:
      'Demonstrates storage variable manipulation causing judgment-condition disorder. A caller function writes a state variable which is then read in a gatekeeping require condition.',
    compilerVersion: '0.8.20',
    expectedFinding:
      'Candidate attack path: setAllowance writes isUnlocked, unlockVault reads isUnlocked in require condition.',
    sources: [
      {
        filename: 'ConditionDisorder.sol',
        content: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ConditionVault {
    address public admin;
    bool public isUnlocked;
    uint256 public vaultValue;

    constructor() {
        admin = msg.sender;
        isUnlocked = false;
    }

    function toggleStatus(bool state) public {
        isUnlocked = state;
    }

    function unlockVault(address payable recipient) public {
        require(isUnlocked, "Vault is locked");
        recipient.transfer(vaultValue);
    }
}
`,
      },
    ],
  },
  {
    id: 'demo-4',
    name: 'Parity-Style Simplified Wallet & Library',
    category: 'Research Benchmark',
    description:
      'Simplified educational example inspired by the DelegateTracker research paper discussing the Parity Wallet incident. Wallet delegates calls to WalletLibrary. WalletLibrary has initialize() writing owner, while Wallet execute() reads owner and sends Ether.',
    compilerVersion: '0.8.20',
    expectedFinding:
      'Candidate attack path: initialize writes owner, execute reads owner and reaches transfer. Requires symbolic validation.',
    sources: [
      {
        filename: 'Wallet.sol',
        content: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Simplified educational example inspired by the DelegateTracker paper
contract Wallet {
    address public owner;
    address public walletLibrary;

    constructor(address _library) {
        walletLibrary = _library;
    }

    fallback() external payable {
        (bool success, ) = walletLibrary.delegatecall(msg.data);
        require(success, "Delegatecall failed");
    }

    function execute(address to, uint256 value) external {
        require(msg.sender == owner, "Only owner");
        payable(to).transfer(value);
    }
}

contract WalletLibrary {
    address public owner;

    function initialize(address _owner) external {
        owner = _owner;
    }

    function kill(address payable recipient) external {
        require(msg.sender == owner, "Only owner");
        selfdestruct(recipient);
    }
}
`,
      },
    ],
  },
];
