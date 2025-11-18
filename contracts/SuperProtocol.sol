// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

string constant DESCRIPTION = "Super Protocol";
string constant TICKER = "TEE";
uint256 constant TOTAL_SUPPLY = 1_000_000_000 ether;

struct TokenReceivers {
    address receiver;
    uint256 amount;
}

contract SuperProtocol is ERC20 {
    constructor(TokenReceivers[] memory receivers) ERC20(DESCRIPTION, TICKER) {
        for (uint receiverIndex = 0; receiverIndex < receivers.length; receiverIndex++) {
            _mint(receivers[receiverIndex].receiver, receivers[receiverIndex].amount);
        }
        require(totalSupply() == TOTAL_SUPPLY, "Something wrong in token distribution");
    }

    function airdrop(TokenReceivers[] memory airdropInfos) external {
        for (uint256 idx = 0; idx < airdropInfos.length; ++idx) {
            address receiver = airdropInfos[idx].receiver;
            uint256 amount = airdropInfos[idx].amount;
            transfer(receiver, amount);
        }
    }
}
