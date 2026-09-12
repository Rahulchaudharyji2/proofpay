const hre = require("hardhat");

async function main() {
  console.log("Deploying ProofPay contracts...");

  // 1. Deploy AgentMandate
  const AgentMandate = await hre.ethers.getContractFactory("AgentMandate");
  const agentMandate = await AgentMandate.deploy();
  await agentMandate.waitForDeployment();
  const mandateAddress = await agentMandate.getAddress();
  console.log("AgentMandate deployed to:", mandateAddress);

  // 2. Deploy PaymentEscrow
  const PaymentEscrow = await hre.ethers.getContractFactory("PaymentEscrow");
  const paymentEscrow = await PaymentEscrow.deploy(mandateAddress);
  await paymentEscrow.waitForDeployment();
  console.log("PaymentEscrow deployed to:", await paymentEscrow.getAddress());

  // 3. Deploy OutcomeRegistry
  const OutcomeRegistry = await hre.ethers.getContractFactory("OutcomeRegistry");
  const outcomeRegistry = await OutcomeRegistry.deploy();
  await outcomeRegistry.waitForDeployment();
  console.log("OutcomeRegistry deployed to:", await outcomeRegistry.getAddress());

  // 4. Deploy ProviderRegistry
  const ProviderRegistry = await hre.ethers.getContractFactory("ProviderRegistry");
  const providerRegistry = await ProviderRegistry.deploy();
  await providerRegistry.waitForDeployment();
  console.log("ProviderRegistry deployed to:", await providerRegistry.getAddress());

  console.log("\nDone! Please update your .env file with these addresses.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
