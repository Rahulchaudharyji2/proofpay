const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ProofPay Core Contracts", function () {
  let owner: any, agent: any, provider: any, maliciousProvider: any;
  let agentMandate: any, paymentEscrow: any, outcomeRegistry: any, providerRegistry: any;

  beforeEach(async function () {
    [owner, agent, provider, maliciousProvider] = await ethers.getSigners();

    // Deploy AgentMandate
    const AgentMandate = await ethers.getContractFactory("AgentMandate");
    agentMandate = await AgentMandate.deploy();

    // Deploy PaymentEscrow
    const PaymentEscrow = await ethers.getContractFactory("PaymentEscrow");
    paymentEscrow = await PaymentEscrow.deploy(await agentMandate.getAddress());

    // Deploy OutcomeRegistry
    const OutcomeRegistry = await ethers.getContractFactory("OutcomeRegistry");
    outcomeRegistry = await OutcomeRegistry.deploy();

    // Deploy ProviderRegistry
    const ProviderRegistry = await ethers.getContractFactory("ProviderRegistry");
    providerRegistry = await ProviderRegistry.deploy();
  });

  describe("AgentMandate and PaymentEscrow Security Rules", function () {
    it("should allow a valid payment within limits", async function () {
      const budget = ethers.parseEther("10");
      const daily = ethers.parseEther("2");
      const perTx = ethers.parseEther("1");
      const expiry = Math.floor(Date.now() / 1000) + 86400; // 1 day

      await agentMandate.createMandate(
        agent.address,
        budget,
        daily,
        perTx,
        expiry,
        ["translation"],
        [provider.address],
        true
      );

      const amount = ethers.parseEther("0.5");
      await expect(
        paymentEscrow.connect(agent).escrowPayment(
          "PAY-123",
          agent.address,
          provider.address,
          "translation",
          amount,
          { value: amount }
        )
      ).to.emit(paymentEscrow, "PaymentEscrowed")
       .withArgs("PAY-123", agent.address, provider.address, amount);
    });

    it("should block overspend (exceeds per-transaction limit)", async function () {
      const budget = ethers.parseEther("10");
      const daily = ethers.parseEther("2");
      const perTx = ethers.parseEther("1");
      const expiry = Math.floor(Date.now() / 1000) + 86400;

      await agentMandate.createMandate(
        agent.address,
        budget,
        daily,
        perTx,
        expiry,
        ["translation"],
        [provider.address],
        true
      );

      const amount = ethers.parseEther("1.5"); // Exceeds perTx
      await expect(
        paymentEscrow.connect(agent).escrowPayment(
          "PAY-124",
          agent.address,
          provider.address,
          "translation",
          amount,
          { value: amount }
        )
      ).to.be.revertedWith("Exceeds per-transaction limit");
    });

    it("should block payment to unauthorized provider", async function () {
      const budget = ethers.parseEther("10");
      const daily = ethers.parseEther("2");
      const perTx = ethers.parseEther("1");
      const expiry = Math.floor(Date.now() / 1000) + 86400;

      await agentMandate.createMandate(
        agent.address,
        budget,
        daily,
        perTx,
        expiry,
        ["translation"],
        [provider.address],
        true
      );

      const amount = ethers.parseEther("0.5"); 
      await expect(
        paymentEscrow.connect(agent).escrowPayment(
          "PAY-125",
          agent.address,
          maliciousProvider.address, // Unauthorized
          "translation",
          amount,
          { value: amount }
        )
      ).to.be.revertedWith("Provider not allowed");
    });

    it("should prevent duplicate settlement for the same task", async function () {
      const budget = ethers.parseEther("10");
      const daily = ethers.parseEther("2");
      const perTx = ethers.parseEther("1");
      const expiry = Math.floor(Date.now() / 1000) + 86400;

      await agentMandate.createMandate(
        agent.address,
        budget,
        daily,
        perTx,
        expiry,
        ["translation"],
        [provider.address],
        true
      );

      const amount = ethers.parseEther("0.5");
      await paymentEscrow.connect(agent).escrowPayment(
        "PAY-126",
        agent.address,
        provider.address,
        "translation",
        amount,
        { value: amount }
      );

      await expect(paymentEscrow.connect(owner).settlePayment("PAY-126", "TASK-126"))
        .to.emit(paymentEscrow, "PaymentSettled");

      // Attempting to settle again should fail
      await expect(paymentEscrow.connect(owner).settlePayment("PAY-126", "TASK-126"))
        .to.be.revertedWith("Payment already settled");
    });
  });
});
