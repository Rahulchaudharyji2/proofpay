// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

contract OutcomeRegistry is Ownable {
    enum VerificationState { PENDING, VERIFIED, FAILED, DISPUTED }

    struct Outcome {
        string taskId;
        string requestHash;
        string resultHash;
        string deliveryHash;
        VerificationState state;
        uint256 timestamp;
    }

    // taskId => Outcome
    mapping(string => Outcome) public outcomes;

    event OutcomeRecorded(string indexed taskId, string resultHash, string deliveryHash, VerificationState state);
    event OutcomeStateChanged(string indexed taskId, VerificationState newState);

    constructor() Ownable(msg.sender) {}

    function recordOutcome(
        string calldata _taskId,
        string calldata _requestHash,
        string calldata _resultHash,
        string calldata _deliveryHash,
        VerificationState _initialState
    ) external onlyOwner {
        require(bytes(outcomes[_taskId].taskId).length == 0, "Outcome already recorded");

        Outcome memory newOutcome = Outcome({
            taskId: _taskId,
            requestHash: _requestHash,
            resultHash: _resultHash,
            deliveryHash: _deliveryHash,
            state: _initialState,
            timestamp: block.timestamp
        });

        outcomes[_taskId] = newOutcome;

        emit OutcomeRecorded(_taskId, _resultHash, _deliveryHash, _initialState);
    }

    function updateOutcomeState(string calldata _taskId, VerificationState _newState) external onlyOwner {
        require(bytes(outcomes[_taskId].taskId).length != 0, "Outcome not found");
        
        outcomes[_taskId].state = _newState;
        outcomes[_taskId].timestamp = block.timestamp;
        
        emit OutcomeStateChanged(_taskId, _newState);
    }
}
