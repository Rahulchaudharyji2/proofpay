// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

contract ProviderRegistry is Ownable {
    enum ProviderStatus { PENDING, ACTIVE, SUSPENDED }

    struct Provider {
        address providerAddress;
        string name;
        ProviderStatus status;
        uint256 registeredAt;
    }

    // provider address => Provider
    mapping(address => Provider) public providers;
    
    // provider address => service type => is supported
    mapping(address => mapping(string => bool)) public supportedServices;

    event ProviderRegistered(address indexed providerAddress, string name);
    event ProviderStatusUpdated(address indexed providerAddress, ProviderStatus status);
    event ServiceAdded(address indexed providerAddress, string serviceType);
    event ServiceRemoved(address indexed providerAddress, string serviceType);

    constructor() Ownable(msg.sender) {}

    function registerProvider(address _providerAddress, string calldata _name) external onlyOwner {
        require(providers[_providerAddress].providerAddress == address(0), "Provider already registered");

        providers[_providerAddress] = Provider({
            providerAddress: _providerAddress,
            name: _name,
            status: ProviderStatus.ACTIVE,
            registeredAt: block.timestamp
        });

        emit ProviderRegistered(_providerAddress, _name);
    }

    function updateProviderStatus(address _providerAddress, ProviderStatus _status) external onlyOwner {
        require(providers[_providerAddress].providerAddress != address(0), "Provider not registered");
        
        providers[_providerAddress].status = _status;
        emit ProviderStatusUpdated(_providerAddress, _status);
    }

    function addService(address _providerAddress, string calldata _serviceType) external onlyOwner {
        require(providers[_providerAddress].providerAddress != address(0), "Provider not registered");
        
        supportedServices[_providerAddress][_serviceType] = true;
        emit ServiceAdded(_providerAddress, _serviceType);
    }

    function removeService(address _providerAddress, string calldata _serviceType) external onlyOwner {
        require(providers[_providerAddress].providerAddress != address(0), "Provider not registered");
        
        supportedServices[_providerAddress][_serviceType] = false;
        emit ServiceRemoved(_providerAddress, _serviceType);
    }
}
