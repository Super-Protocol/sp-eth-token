// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./openzeppelin/contracts/token/ERC20/ERC20.sol";

string constant DESCRIPTION = "Super Protocol";
string constant TICKER = "TEE";

struct Contracts {
    address promoStaking;
    address liquidityRewards;
    address insidersVesting;
    address daoVesting;
    address stakingRewards;
    address providersRewards;
    address demandStimulus;
}

struct Multisigs {
    address liquidityRewards;
    address publicSale;
    address dao;
}

struct TokenReceivers {
    Contracts contracts;
    Multisigs multisigs;
}

struct AirdropInfo {
    address receiver;
    uint256 amount;
}

contract SuperProtocol is ERC20 {
    constructor(TokenReceivers memory receivers) ERC20(DESCRIPTION, TICKER) {
        _mint(receivers.contracts.promoStaking, 10_000_000 ether);
        _mint(receivers.contracts.liquidityRewards, 90_000_000 ether);
        _mint(receivers.contracts.insidersVesting, 400_000_000 ether);
        _mint(receivers.contracts.daoVesting, 190_000_000 ether);
        _mint(receivers.contracts.stakingRewards, 65_000_000 ether);
        _mint(receivers.contracts.providersRewards, 100_000_000 ether);
        _mint(receivers.contracts.demandStimulus, 50_000_000 ether);

        _mint(receivers.multisigs.liquidityRewards, 10_000_000 ether);
        _mint(receivers.multisigs.publicSale, 75_000_000 ether);
        _mint(receivers.multisigs.dao, 10_000_000 ether);

        require(totalSupply() == 1_000_000_000 ether, "Something wrong in token distribution");
    }

    function airdrop(AirdropInfo[] memory airdropInfos) public {
        for (uint256 idx = 0; idx < airdropInfos.length; ++idx) {
            address receiver = airdropInfos[idx].receiver;
            uint256 amount = airdropInfos[idx].amount;
            transfer(receiver, amount);
        }
    }
}
