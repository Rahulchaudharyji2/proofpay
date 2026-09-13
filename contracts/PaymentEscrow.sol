// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

interface IAgentMandate {
    function authorizeSpend(address agent, address provider, string calldata serviceType, uint256 amount) external returns (bool);
    function refundSpend(address agent, uint256 amount) external;
}

contract PaymentEscrow is Ownable {
    IAgentMandate public mandateContract;

    struct PaymentIntent {
        address agent;
        address provider;
        uint256 amount;
        string serviceType;
        bool isEscrowed;
        bool isSettled;
        bool isRefunded;
    }

    // paymentId => PaymentIntent
    mapping(string => PaymentIntent) public intents;
    
    // mapping to prevent duplicate settlements per taskId
    mapping(string => bool) public settledTasks;

    // Agent address => Available Escrow Balance
    mapping(address => uint256) public agentVaults;

    event PaymentEscrowed(string indexed paymentId, address indexed agent, address indexed provider, uint256 amount);
    event PaymentSettled(string indexed paymentId, string indexed taskId, address provider, uint256 amount);
    event PaymentRefunded(string indexed paymentId, address agent, uint256 amount);
    event AgentFunded(address indexed agent, address indexed funder, uint256 amount);
    event AgentWithdrawn(address indexed agent, address indexed receiver, uint256 amount);

    constructor(address _mandateContractAddress) Ownable(msg.sender) {
        mandateContract = IAgentMandate(_mandateContractAddress);
    }

    function fundAgent(address _agent) external payable {
        agentVaults[_agent] += msg.value;
        emit AgentFunded(_agent, msg.sender, msg.value);
    }

    function withdrawFromAgentVault(address _agent, uint256 _amount) external {
        // Ideally only agent owner can withdraw. For simplicity, we assume msg.sender is owner or authorized.
        require(agentVaults[_agent] >= _amount, "Insufficient vault balance");
        agentVaults[_agent] -= _amount;
        
        (bool success, ) = payable(msg.sender).call{value: _amount}("");
        require(success, "Withdrawal failed");
        emit AgentWithdrawn(_agent, msg.sender, _amount);
    }

    function escrowPayment(
        string calldata _paymentId,
        address _agent,
        address _provider,
        string calldata _serviceType,
        uint256 _amount
    ) external {
        require(agentVaults[_agent] >= _amount, "Insufficient agent vault balance");
        require(intents[_paymentId].agent == address(0), "Payment intent already exists");

        // Deduct from agent's pre-funded vault
        agentVaults[_agent] -= _amount;

        // Request authorization from the Mandate contract (reverts if not allowed)
        require(mandateContract.authorizeSpend(_agent, _provider, _serviceType, _amount), "Spend not authorized");

        PaymentIntent memory newIntent = PaymentIntent({
            agent: _agent,
            provider: _provider,
            amount: _amount,
            serviceType: _serviceType,
            isEscrowed: true,
            isSettled: false,
            isRefunded: false
        });

        intents[_paymentId] = newIntent;

        emit PaymentEscrowed(_paymentId, _agent, _provider, _amount);
    }

    function settlePayment(string calldata _paymentId, string calldata _taskId) external onlyOwner {
        PaymentIntent storage intent = intents[_paymentId];
        
        require(intent.isEscrowed, "Payment not escrowed");
        require(!intent.isSettled, "Payment already settled");
        require(!intent.isRefunded, "Payment was refunded");
        require(!settledTasks[_taskId], "Task already settled");

        intent.isSettled = true;
        settledTasks[_taskId] = true;

        // Transfer funds to the provider
        (bool success, ) = payable(intent.provider).call{value: intent.amount}("");
        require(success, "Transfer to provider failed");

        emit PaymentSettled(_paymentId, _taskId, intent.provider, intent.amount);
    }

    function refundPayment(string calldata _paymentId) external onlyOwner {
        PaymentIntent storage intent = intents[_paymentId];
        
        require(intent.isEscrowed, "Payment not escrowed");
        require(!intent.isSettled, "Payment already settled");
        require(!intent.isRefunded, "Payment already refunded");

        intent.isRefunded = true;

        // Refund the mandate budget limits
        mandateContract.refundSpend(intent.agent, intent.amount);

        // Return funds to the agent's vault
        agentVaults[intent.agent] += intent.amount;

        emit PaymentRefunded(_paymentId, intent.agent, intent.amount);
    }
}
