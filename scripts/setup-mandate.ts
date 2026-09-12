import { ethers } from "ethers";
import AgentMandateArtifact from "../artifacts/contracts/AgentMandate.sol/AgentMandate.json";
import "dotenv/config";

async function main() {
  console.log("Setting up on-chain mandate...");
  
  const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "http://127.0.0.1:8545";
  const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
  const AGENT_MANDATE_ADDRESS = process.env.NEXT_PUBLIC_AGENT_MANDATE_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  
  const provider = new ethers.JsonRpcProvider(RPC_URL, 31337, { staticNetwork: true });
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  
  const mandateContract = new ethers.Contract(AGENT_MANDATE_ADDRESS, AgentMandateArtifact.abi, wallet);
  
  const agent = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
  
  const mandate = await mandateContract.mandates(agent);
  
  const totalBudget = ethers.parseEther("100.0");
  const dailyLimit = ethers.parseEther("20.0");
  const perTransactionLimit = ethers.parseEther("5.0");
  const expiresAt = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60; // 1 year from now
  
  const allowedServices = ["translation", "compute", "storage", "ai-inference"];
  const allowedProviders = [
    "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", // Provider A
    "0x90F79bf6EB2c4f870365E785982E1f101E93b906", // Provider B
    "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65"  // Provider C
  ];
  const restrictProviders = true;
  
  console.log("Calling createMandate on-chain...");
  const tx = await mandateContract.createMandate(
    agent,
    totalBudget,
    dailyLimit,
    perTransactionLimit,
    expiresAt,
    allowedServices,
    allowedProviders,
    restrictProviders
  );
  
  await tx.wait();
  console.log(`Mandate successfully created on-chain: ${tx.hash}`);
}

main().catch(console.error);
