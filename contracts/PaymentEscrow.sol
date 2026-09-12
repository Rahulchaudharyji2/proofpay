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

    event PaymentEscrowed(string indexed paymentId, address indexed agent, address indexed provider, uint256 amount);
    event PaymentSettled(string indexed paymentId, string indexed taskId, address provider, uint256 amount);
    event PaymentRefunded(string indexed paymentId, address agent, uint256 amount);

    constructor(address _mandateContractAddress) Ownable(msg.sender) {
        mandateContract = IAgentMandate(_mandateContractAddress);
    }

    function escrowPayment(
        string calldata _paymentId,
        address _agent,
        address _provider,
        string calldata _serviceType,
        uint256 _amount
    ) external payable {
        // In a real app we might use ERC20, but for simplicity we can just track balances or use native ETH
        // Here we assume native ETH/SepoliaETH is used.
        require(msg.value == _amount, "Incorrect payment amount");
        require(intents[_paymentId].agent == address(0), "Payment intent already exists");

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

        // Refund the mandate budget
        mandateContract.refundSpend(intent.agent, intent.amount);

        // Return funds to the agent
        (bool success, ) = payable(intent.agent).call{value: intent.amount}("");
        require(success, "Refund to agent failed");

        emit PaymentRefunded(_paymentId, intent.agent, intent.amount);
    }
}
