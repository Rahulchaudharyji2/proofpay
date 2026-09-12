# ProofPay - Let AI Agents Buy Services Safely

## Problem
AI agents can autonomously purchase digital services, but agent reasoning alone cannot safely enforce financial limits or prove that purchased services were actually delivered.

## Solution
ProofPay separates:
```text
AI Decision
      ↓
Policy / Security Firewall
      ↓
Smart Contract Enforcement
      ↓
Payment / Escrow
      ↓
Provider Service
      ↓
Evidence
      ↓
Outcome Verification
      ↓
Settlement
```

## What the Agent Buys
For the primary demo:
> A translation service from an independent provider.

*(Note: The provider API and translation outcome are simulated for this prototype to demonstrate the workflow.)*

## W3A-1 Core Requirements
* **Hard spending cap**: Financial limits are enforced at the smart contract level, making it impossible for rogue agents to bypass the rules.
* **HTTP 402 / x402-style payment flow**: The agent receives a payment required signal before the actual on-chain transaction.
* **Delivery proof**: The provider must return cryptographic evidence (Hash + IPFS CID) of the delivered result.
* **Retry/double-charge protection**: Idempotent task IDs and contract logic prevent duplicate charges for the same task.
* **Live overspend attempt blocked**: Demonstrated at the enforcement layer (Smart Contract).

## W3A-1 Bonus
* **Multiple independent providers**: Seeded with varied prices, qualities, and reliabilities.
* **Provider selection**: The AI uses price/quality signals to select eligible providers rather than just picking the cheapest.
* **Human-owner dashboard**: A comprehensive UI for task lifecycle, decisions, and audit trails.
* **Real-time spend and audit trail**: View complete purchase, delivery, and security event histories.

## ProofPay Extensions
* **Economic Security Firewall**: An application-layer guardrail that evaluates risk before interacting with the chain.
* **Risk-adjusted expected cost**: A proprietary decision engine to rank providers based on price and historical reliability.
* **Provider risk scoring**: Aggregation of past jobs, disputes, and latencies.
* **Financial prompt-injection boundary**: Demonstrating that malicious instructions from the provider cannot override the financial mandate.
* **Price anomaly detection**: Blocking providers who suddenly spike their rates.
* **Outcome-based escrow/settlement**: Providers are only settled *after* the service outcome is verified against the agent's criteria.
* **IPFS evidence pipeline**: Storing results on Pinata for permanent auditable delivery proof.
* **Provider trust/reputation signals**: Continuous scoring based on success rates.

## Simulation Disclosure
This project demonstrates a full end-to-end autonomous payment architecture. To make the demo self-contained without requiring third-party real-world API credentials (like OpenAI or real translation APIs), the following are simulated:
- The **HTTP 402 / x402-style simulation** response from the provider is mocked in the API flow.
- The **Simulated translation provider** service execution and the returned "translated text" are mocked.
- Outcome Verification assumes success based on the mock data to allow the escrow settlement to complete in the "Happy Path" demo.

The **Smart Contract Enforcement**, **Database State**, and **On-Chain Escrow flows** are completely functional and enforce the actual rules.

---

## Getting Started

First, install dependencies:
```bash
npm install
```

Start your local Hardhat node (in a new terminal):
```bash
npx hardhat node
```

Run smart contract tests:
```bash
npm run contracts:test
```

Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
