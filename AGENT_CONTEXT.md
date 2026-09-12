# ProofPay - AI Agent Context & History

*This file is maintained by the AI agent to preserve context across sessions. It contains the history of what was built, bugs that were fixed, and the current state of the architecture.*

## 🏗 Core Architecture
- **Framework:** Next.js (App Router), React, Tailwind CSS.
- **Database:** PostgreSQL (via Prisma ORM).
- **Blockchain:** Hardhat, Ethers.js v6, Solidity (Sepolia Testnet).
- **AI Integration:** Google Gemini (`gemini-3.6-flash`) for parsing natural language intents into executable tasks.
- **Storage:** Pinata (IPFS) for storing execution evidence.

## 🔗 Smart Contracts (Sepolia)
- **AgentMandate.sol**: Manages agent spending limits, allowed services, and daily budgets.
- **PaymentEscrow.sol**: Handles the HTTP 402 flow by escrowing funds until evidence of delivery is provided.
- **OutcomeRegistry.sol**: Registers the task request hash and the result IPFS CID to ensure undeniable proof of work.

## 🛠 Bugs Fixed & Challenges Solved
1. **Prisma Vercel Deployment Fix**: Vercel cached `node_modules` and failed to generate Prisma types during build. Fixed by adding `"postinstall": "prisma generate"` to `package.json`.
2. **Dynamic Next.js 15 Routing**: Fixed `useSearchParams` build errors by wrapping components in `<Suspense>` boundaries. Fixed async cookie access by using `await cookies()`.
3. **Hardcoded Chain ID**: The backend originally hardcoded the RPC connection to `31337` (Local Hardhat). Fixed to dynamically accept `NEXT_PUBLIC_CHAIN_ID` from Vercel `.env`.
4. **Vercel `.env` Formatting Issues**: Resolved issues where Vercel injected literal quotes (`"https..."`) into environment variables, breaking the Ethers.js provider connection.
5. **Testnet Insufficient Funds Prevention**: The escrow originally charged 0.30 native Sepolia ETH per task (which is too expensive for testnet faucets). Scaled the backend logic to parse amounts in `mwei` (micro-ETH) so that tasks only consume fractions of a cent, preventing "Insufficient Funds" reverts.
6. **Database vs Blockchain State Mismatch**: Learned that creating agents on the local node and then pointing to Sepolia causes `CONTRACT_REVERT` because the Sepolia smart contract has no mandate record for the local agent. Solution: Always create a fresh agent when switching networks.

## 🚀 Current Status
- The app is fully deployed on Vercel.
- The smart contracts are live on Sepolia.
- The AI decision engine (Gemini) successfully parses user input.
- The Escrow and Settlement flow is 100% operational on-chain.
- The UI includes a custom modern SVG shield favicon.
- The `README.md` has been rewritten to professional standards.

## 📝 Next Steps for Future Sessions
If work resumes, you can continue extending the UI, adding more complex provider mock responses, or building out the "Security Center" anomaly detection features. Always remember to check `mwei` conversions if dealing with new financial limits!
