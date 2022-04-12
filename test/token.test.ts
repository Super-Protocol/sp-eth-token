import { expect } from 'chai';
import { ethers } from 'hardhat';
import crypto from 'crypto';
import { SuperProtocol } from '../typechain';
import { AirdropInfo, TokenReceivers } from '../scripts/model';

describe('SuperProtocol TEE token', function () {
    async function genRandomAddress(): Promise<string> {
        const id = crypto.randomBytes(32).toString('hex');
        const w = new ethers.Wallet('0x' + id);
        return w.getAddress();
    }

    async function generateReceivers(): Promise<TokenReceivers> {
        return {
            contracts: {
                promoStaking: await genRandomAddress(),
                liquidityRewards: await genRandomAddress(),
                insidersVesting: await genRandomAddress(),
                daoVesting: await genRandomAddress(),
                stakingRewards: await genRandomAddress(),
                providersRewards: await genRandomAddress(),
                demandStimulus: await genRandomAddress(),
            },
            multisigs: {
                liquidityRewards: await genRandomAddress(),
                publicSale: await genRandomAddress(),
                dao: await genRandomAddress(),
            },
        };
    }

    async function deployWithReceivers(receviers: TokenReceivers): Promise<SuperProtocol> {
        const factory = await ethers.getContractFactory('SuperProtocol');
        const token = (await factory.deploy(receviers)) as SuperProtocol;
        await token.deployed();
        return token;
    }

    function parseEther(amount: number) {
        return ethers.utils.parseEther(amount.toString());
    }

    it('Should distribute all tokens', async function () {
        const receivers = await generateReceivers();
        const token = await deployWithReceivers(receivers);
        expect(await token.totalSupply()).eq(parseEther(1_000_000_000));

        expect(await token.balanceOf(receivers.contracts.promoStaking)).eq(parseEther(10_000_000));
        expect(await token.balanceOf(receivers.contracts.liquidityRewards)).eq(parseEther(90_000_000));
        expect(await token.balanceOf(receivers.contracts.insidersVesting)).eq(parseEther(400_000_000));
        expect(await token.balanceOf(receivers.contracts.daoVesting)).eq(parseEther(190_000_000));
        expect(await token.balanceOf(receivers.contracts.stakingRewards)).eq(parseEther(65_000_000));
        expect(await token.balanceOf(receivers.contracts.providersRewards)).eq(parseEther(100_000_000));
        expect(await token.balanceOf(receivers.contracts.demandStimulus)).eq(parseEther(50_000_000));

        expect(await token.balanceOf(receivers.multisigs.liquidityRewards)).eq(parseEther(10_000_000));
        expect(await token.balanceOf(receivers.multisigs.publicSale)).eq(parseEther(75_000_000));
        expect(await token.balanceOf(receivers.multisigs.dao)).eq(parseEther(10_000_000));
    });

    it('Should airdrop tokens to array', async function () {
        const signers = await ethers.getSigners();
        const liquidityRewardsMultisig = signers[0];

        const receivers = await generateReceivers();
        receivers.multisigs.liquidityRewards = liquidityRewardsMultisig.address;
        const token = await deployWithReceivers(receivers);

        const alice = await genRandomAddress();
        const laura = await genRandomAddress();
        const jamie = await genRandomAddress();

        const airdropInfos: AirdropInfo[] = [
            { receiver: alice, amount: 1111 },
            { receiver: laura, amount: 2222 },
            { receiver: jamie, amount: 3333 },
        ];
        await token.connect(liquidityRewardsMultisig).airdrop(airdropInfos);

        expect(await token.balanceOf(alice)).eq(1111);
        expect(await token.balanceOf(laura)).eq(2222);
        expect(await token.balanceOf(jamie)).eq(3333);
    });
});
