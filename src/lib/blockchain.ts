import { ethers } from "ethers";
import AgentMandateArtifact from "../../artifacts/contracts/AgentMandate.sol/AgentMandate.json";
import PaymentEscrowArtifact from "../../artifacts/contracts/PaymentEscrow.sol/PaymentEscrow.json";
import OutcomeRegistryArtifact from "../../artifacts/contracts/OutcomeRegistry.sol/OutcomeRegistry.json";

// Fallbacks for localhost hardhat node
// Force recompile to pick up new env var
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || process.env.SEPOLIA_RPC_URL || "http://127.0.0.1:8545";
const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

// Ensure addresses match the hardhat deploy script if not passed in .env
export const AGENT_MANDATE_ADDRESS = process.env.NEXT_PUBLIC_AGENT_MANDATE_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";
export const PAYMENT_ESCROW_ADDRESS = process.env.NEXT_PUBLIC_PAYMENT_ESCROW_ADDRESS || "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
export const OUTCOME_REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_OUTCOME_REGISTRY_ADDRESS || "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

console.log("BLOCKCHAIN.TS INITIALIZED, RPC_URL is", RPC_URL);

export const getProvider = () => {
  const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 31337;
  // Pass chainId explicitly and staticNetwork: true to prevent ethers v6 from repeatedly 
  // probing eth_chainId which can fail or get cached aggressively by Next.js
  return new ethers.JsonRpcProvider(RPC_URL, chainId, { staticNetwork: true });
};

export const getWallet = () => {
  return new ethers.Wallet(PRIVATE_KEY, getProvider());
};

export const getAgentMandateContract = () => {
  return new ethers.Contract(AGENT_MANDATE_ADDRESS, AgentMandateArtifact.abi, getWallet());
};

export const getPaymentEscrowContract = () => {
  return new ethers.Contract(PAYMENT_ESCROW_ADDRESS, PaymentEscrowArtifact.abi, getWallet());
};

export const getOutcomeRegistryContract = () => {
  return new ethers.Contract(OUTCOME_REGISTRY_ADDRESS, OutcomeRegistryArtifact.abi, getWallet());
};
