import '@nomiclabs/hardhat-waffle';
import '@nomiclabs/hardhat-etherscan';
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

task('deploy', 'Deploy token')
    .addParam('receivers', 'Receivers json file (see constructor-args.json)')
    .setAction(async (taskArgs, hre) => {
        const receiversFilename = taskArgs.receivers;
        const receivers = JSON.parse(fs.readFileSync(receiversFilename).toString()) as TokenReceivers[];

        const signers = await hre.ethers.getSigners();
        const feePayer = signers[0];
        const balance = await hre.ethers.provider.getBalance(feePayer.address);

        console.log('FEE PAYER:', feePayer.address, 'BALANCE', utils.formatEther(balance));
        console.log('');

        const token = await deployContract(hre, 'SuperProtocol', feePayer, receivers);
        const supplied = utils.formatEther(await token.totalSupply());
        const tokenAddress = token.address;

        const showBalance = async (address: string) => {
            const token = await hre.ethers.getContractAt('SuperProtocol', tokenAddress);
            const balance = await token.balanceOf(address);
            const uiBalance = (balance / Math.pow(10, 18) / Math.pow(10, 6)).toString() + 'm';
            console.log(address, '=', uiBalance.padStart(4, ' '));
        };

        console.log('');
        console.log('TOTAL SUPPLY:', supplied);

        console.log('');
        console.log('== CONTRACTS && MULTISIG');
        for (let receiversIndex = 0; receiversIndex < receivers.length; receiversIndex++) {
            await showBalance(receivers[receiversIndex].receiver);
        }
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
        mumbai: {
            chainId: 80001,
            url: config.mumbaiUrl,
            accounts: [config.mumbaiDeployerPrivateKey],
        },
        polygon: {
            url: 'https://polygon-rpc.com',
            accounts: [config.polygonDeployerPrivateKey],
        },
    },
    etherscan: {
        apiKey: {
            polygon: config.polygonApiKey,
            mainnet: config.ethereumApiKey,
        },
    },
};
