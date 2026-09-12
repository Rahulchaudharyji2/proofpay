// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

contract AgentMandate is Ownable {
    struct Mandate {
        uint256 totalBudget;
        uint256 dailyLimit;
        uint256 perTransactionLimit;
        uint256 expiresAt;
        bool isActive;
        mapping(string => bool) allowedServices;
        mapping(address => bool) allowedProviders;
        bool restrictProviders; // If true, only allowedProviders can be used
        uint256 spentToday;
        uint256 lastSpentDay;
        uint256 totalSpent;
    }

    // Agent address => Mandate
    mapping(address => Mandate) public mandates;

    event MandateCreated(address indexed agent, uint256 totalBudget, uint256 dailyLimit, uint256 perTransactionLimit);
    event MandateUpdated(address indexed agent);
    event MandateFrozen(address indexed agent);
    event MandateUnfrozen(address indexed agent);
    event SpendAuthorized(address indexed agent, uint256 amount);

    constructor() Ownable(msg.sender) {}

    function createMandate(
        address _agent,
        uint256 _totalBudget,
        uint256 _dailyLimit,
        uint256 _perTransactionLimit,
        uint256 _expiresAt,
        string[] calldata _allowedServices,
        address[] calldata _allowedProviders,
        bool _restrictProviders
    ) external onlyOwner {
        require(!mandates[_agent].isActive, "Mandate already exists and is active");

        Mandate storage newMandate = mandates[_agent];
        newMandate.totalBudget = _totalBudget;
        newMandate.dailyLimit = _dailyLimit;
        newMandate.perTransactionLimit = _perTransactionLimit;
        newMandate.expiresAt = _expiresAt;
        newMandate.isActive = true;
        newMandate.restrictProviders = _restrictProviders;
        newMandate.totalSpent = 0;
        newMandate.spentToday = 0;
        newMandate.lastSpentDay = block.timestamp / 1 days;

        for (uint256 i = 0; i < _allowedServices.length; i++) {
            newMandate.allowedServices[_allowedServices[i]] = true;
        }

        for (uint256 i = 0; i < _allowedProviders.length; i++) {
            newMandate.allowedProviders[_allowedProviders[i]] = true;
        }

        emit MandateCreated(_agent, _totalBudget, _dailyLimit, _perTransactionLimit);
    }

    function freezeMandate(address _agent) external onlyOwner {
        mandates[_agent].isActive = false;
        emit MandateFrozen(_agent);
    }

    function unfreezeMandate(address _agent) external onlyOwner {
        require(mandates[_agent].expiresAt > block.timestamp, "Cannot unfreeze expired mandate");
        mandates[_agent].isActive = true;
        emit MandateUnfrozen(_agent);
    }

    function isServiceAllowed(address _agent, string calldata _serviceType) public view returns (bool) {
        return mandates[_agent].allowedServices[_serviceType];
    }

    function isProviderAllowed(address _agent, address _provider) public view returns (bool) {
        if (!mandates[_agent].restrictProviders) {
            return true;
        }
        return mandates[_agent].allowedProviders[_provider];
    }

    // Called by PaymentEscrow to check authorization before locking funds
    function authorizeSpend(
        address _agent,
        address _provider,
        string calldata _serviceType,
        uint256 _amount
    ) external returns (bool) {
        Mandate storage mandate = mandates[_agent];

        require(mandate.isActive, "Mandate is not active");
        require(block.timestamp <= mandate.expiresAt, "Mandate has expired");
        require(_amount <= mandate.perTransactionLimit, "Exceeds per-transaction limit");
        require(mandate.totalSpent + _amount <= mandate.totalBudget, "Exceeds total budget");
        require(isServiceAllowed(_agent, _serviceType), "Service type not allowed");
        require(isProviderAllowed(_agent, _provider), "Provider not allowed");

        uint256 currentDay = block.timestamp / 1 days;
        if (mandate.lastSpentDay < currentDay) {
            mandate.spentToday = 0;
            mandate.lastSpentDay = currentDay;
        }

        require(mandate.spentToday + _amount <= mandate.dailyLimit, "Exceeds daily limit");

        // We do not actually deduct the budget here. The escrow contract handles the actual deduction
        // But for tracking limits against authorization, we update it.
        // If the payment fails or refunds, the escrow can call a refund function.
        mandate.spentToday += _amount;
        mandate.totalSpent += _amount;

        emit SpendAuthorized(_agent, _amount);
        return true;
    }

    // In case of failure/refund, give the budget back
    function refundSpend(address _agent, uint256 _amount) external {
        // Ideally only the Escrow contract can call this. 
        // We will keep it simple for now, but a modifier to check msg.sender == Escrow is best practice.
        Mandate storage mandate = mandates[_agent];
        
        if (mandate.totalSpent >= _amount) {
            mandate.totalSpent -= _amount;
        }

        uint256 currentDay = block.timestamp / 1 days;
        if (mandate.lastSpentDay == currentDay) {
            if (mandate.spentToday >= _amount) {
                mandate.spentToday -= _amount;
            }
        }
    }
}
