import '@nomiclabs/hardhat-waffle';
import '@typechain/hardhat';
import 'solidity-coverage';
import 'hardhat-contract-sizer';
import { task } from 'hardhat/config';
import { config } from './config';
import { Contract, Signer, utils } from 'ethers';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import fs from 'fs';
import { TokenReceivers } from './scripts/model';

async function deployContract(hre: HardhatRuntimeEnvironment, name: string, signer: Signer, ...args: any[]): Promise<Contract> {
    console.log(name, 'start deploy...');
    const factory = await hre.ethers.getContractFactory(name, signer);
    const contract = await factory.deploy(...args);
    await contract.deployed();

    // This solves the bug in Mumbai network where the contract address is not the real one
    const txHash = contract.deployTransaction.hash;
    console.log('Waiting for transaction to be mined. TxHash:', txHash);
    const tx = await hre.ethers.provider.waitForTransaction(txHash);
    console.log(name, 'deployed at', tx.contractAddress);
    return contract;
}

task('deploy', 'Deploy token to Ethereum network (root)')
    .addParam('receivers', 'Receivers json file (see receivers.example.json)')
    .setAction(async (taskArgs, hre) => {
        const receiversFilename = taskArgs.receivers;
        const receivers = JSON.parse(fs.readFileSync(receiversFilename).toString()) as TokenReceivers;

        const signers = await hre.ethers.getSigners();
        const feePayer = signers[0];
        const balance = await hre.ethers.provider.getBalance(feePayer.address);

        console.log('FEE PAYER:', feePayer.address, 'BALANCE', utils.formatEther(balance));
        console.log('');

        const token = await deployContract(hre, 'SuperproToken', feePayer, receivers);
        const supplied = utils.formatEther(await token.totalSupply());

        const showBalance = async (name: string, address: string) => {
            const balance = await token.balanceOf(address);
            const uiBalance = (balance / Math.pow(10, 18) / Math.pow(10, 6)).toString() + 'm';
            console.log(name.padStart(18, ' '), ':', address, '=', uiBalance.padStart(4, ' '));
        };

        console.log('');
        console.log('TOTAL SUPPLY:', supplied);

        console.log('');
        console.log('== CONTRACTS');
        await showBalance('PROMO STAKING:', receivers.contracts.promoStaking);
        await showBalance('LIQUIDITY REWARDS', receivers.contracts.liquidityRewards);
        await showBalance('INSIDERS VESTING', receivers.contracts.insidersVesting);
        await showBalance('DAO VESTING', receivers.contracts.daoVesting);
        await showBalance('STAKING REWARDS', receivers.contracts.stakingRewards);
        await showBalance('PROVIDERS REWARDS', receivers.contracts.providersRewards);
        await showBalance('DEMAND STIMULUS', receivers.contracts.demandStimulus);

        console.log('');
        console.log('== MULTISIG');
        await showBalance('LIQUIDITY REWARDS', receivers.multisigs.liquidityRewards);
        await showBalance('PUBLICSALE', receivers.multisigs.publicSale);
        await showBalance('DAO', receivers.multisigs.dao);

        console.log('');
    });

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
export default {
    solidity: {
        compilers: [
            {
                version: '0.8.9',
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 1000,
                    },
                },
            },
        ],
    },
    contractSizer: {
        alphaSort: false,
        disambiguatePaths: true,
        runOnCompile: true,
        strict: false,
    },
    mocha: {
        timeout: 0,
        bail: true,
    },
    networks: {
        hardhat: {
            chainId: 1337,
            mining: {
                auto: true,
            },
            gasPrice: 1,
            initialBaseFeePerGas: 1,
            accounts: {
                accountsBalance: utils.parseEther('100000000').toString(),
                count: 10,
            },
        },
        local: {
            url: 'http://localhost:8545',
            account: config.localhostDeployerPrivateKey,
        },
        ethereum: {
            url: 'https://main-light.eth.linkpool.io',
            accounts: [config.ethereumDeployerPrivateKey],
        },
    },
    etherscan: {
        apiKey: {
            polygon: config.polygonApiKey,
            mainnet: config.ethereumApiKey,
        },
    },
};
