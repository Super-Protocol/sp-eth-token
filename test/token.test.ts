import { expect } from 'chai';
import { ethers } from 'hardhat';
import crypto from 'crypto';
import { BigNumber } from '@ethersproject/bignumber';
import { SuperProtocol } from '../typechain';
import { TokenReceivers, Recepients } from '../scripts/model';
import { BaseContract } from 'ethers';

describe('SuperProtocol TEE token', function () {
    let recipientsTypes: Recepients;

    beforeEach(async function () {
        recipientsTypes = {
            promoStaking: await genRandomAddress(),
            liquidityRewards: await genRandomAddress(),
            insidersVesting: await genRandomAddress(),
            daoVesting: await genRandomAddress(),
            stakingRewards: await genRandomAddress(),
            providersRewards: await genRandomAddress(),
            demandStimulus: await genRandomAddress(),
            liquidityRewardsMultisig: await genRandomAddress(),
            publicSaleMultisig: await genRandomAddress(),
            daoMultisig: await genRandomAddress(),
        };
    });

    async function genRandomAddress(): Promise<string> {
        const id = crypto.randomBytes(32).toString('hex');
        const w = new ethers.Wallet('0x' + id);
        return w.getAddress();
    }

    async function generateReceivers(): Promise<TokenReceivers[]> {
        return [
            {
                receiver: recipientsTypes.promoStaking,
                amount: parseEther(10_000_000),
            },
            {
                receiver: recipientsTypes.liquidityRewards,
                amount: parseEther(90_000_000),
            },
            {
                receiver: recipientsTypes.insidersVesting,
                amount: parseEther(400_000_000),
            },
            {
                receiver: recipientsTypes.daoVesting,
                amount: parseEther(190_000_000),
            },
            {
                receiver: recipientsTypes.stakingRewards,
                amount: parseEther(65_000_000),
            },
            {
                receiver: recipientsTypes.providersRewards,
                amount: parseEther(100_000_000),
            },
            {
                receiver: recipientsTypes.demandStimulus,
                amount: parseEther(50_000_000),
            },
            {
                receiver: recipientsTypes.liquidityRewardsMultisig,
                amount: parseEther(10_000_000),
            },
            {
                receiver: recipientsTypes.publicSaleMultisig,
                amount: parseEther(75_000_000),
            },
            {
                receiver: recipientsTypes.daoMultisig,
                amount: parseEther(10_000_000),
            },
        ];
    }

    async function deployWithReceivers(receviers: TokenReceivers[]): Promise<SuperProtocol> {
        const factory = await ethers.getContractFactory('SuperProtocol');
        const token = (await factory.deploy(receviers)) as BaseContract as SuperProtocol;
        await token.waitForDeployment();
        return token;
    }

    function parseEther(amount: number) {
        return ethers.parseEther(amount.toString());
    }

    it('Should distribute all tokens', async function () {
        const receivers = await generateReceivers();
        const token = await deployWithReceivers(receivers);
        expect(await token.totalSupply()).eq(parseEther(1_000_000_000));

        expect(await token.balanceOf(recipientsTypes.promoStaking)).eq(parseEther(10_000_000));
        expect(await token.balanceOf(recipientsTypes.liquidityRewards)).eq(parseEther(90_000_000));
        expect(await token.balanceOf(recipientsTypes.insidersVesting)).eq(parseEther(400_000_000));
        expect(await token.balanceOf(recipientsTypes.daoVesting)).eq(parseEther(190_000_000));
        expect(await token.balanceOf(recipientsTypes.stakingRewards)).eq(parseEther(65_000_000));
        expect(await token.balanceOf(recipientsTypes.providersRewards)).eq(parseEther(100_000_000));
        expect(await token.balanceOf(recipientsTypes.demandStimulus)).eq(parseEther(50_000_000));

        expect(await token.balanceOf(recipientsTypes.liquidityRewardsMultisig)).eq(parseEther(10_000_000));
        expect(await token.balanceOf(recipientsTypes.publicSaleMultisig)).eq(parseEther(75_000_000));
        expect(await token.balanceOf(recipientsTypes.daoMultisig)).eq(parseEther(10_000_000));
    });

    it('Should airdrop tokens to array', async function () {
        const signers = await ethers.getSigners();
        const liquidityRewardsMultisig = signers[0];

        const receivers = await generateReceivers();
        receivers[7].receiver = liquidityRewardsMultisig.address;
        const token = await deployWithReceivers(receivers);

        const alice = await genRandomAddress();
        const laura = await genRandomAddress();
        const jamie = await genRandomAddress();

        const airdropInfos: TokenReceivers[] = [
            { receiver: alice, amount: 1111n },
            { receiver: laura, amount: 2222n },
            { receiver: jamie, amount: 3333n },
        ];
        await token.connect(liquidityRewardsMultisig).airdrop(airdropInfos);

        expect(await token.balanceOf(alice)).eq(1111);
        expect(await token.balanceOf(laura)).eq(2222);
        expect(await token.balanceOf(jamie)).eq(3333);
    });
});
