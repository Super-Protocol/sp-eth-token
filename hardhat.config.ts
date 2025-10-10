import '@typechain/hardhat';
import '@nomicfoundation/hardhat-chai-matchers';
import 'solidity-docgen';
import 'solidity-coverage';
import 'hardhat-contract-sizer';

import { task } from 'hardhat/config';
import { config } from './config';
import { BaseContract, formatEther, parseEther, Signer } from 'ethers';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import fs from 'fs';
import { TokenReceivers } from './scripts/model';
import { SuperProtocol } from './typechain';

async function deploy<T>(hre: HardhatRuntimeEnvironment, name: string, signer: Signer, ...args: any[]): Promise<T> {
    console.log(name, 'start deploy...');
    const factory = await hre.ethers.getContractFactory(name, signer);
    const contract = await factory.deploy(...args);
    const deployed = await contract.waitForDeployment();

    const tx = deployed.deploymentTransaction();
    console.log('Deployment transaction Hash:', tx?.hash);
    console.log(name, 'deployed at', await deployed.getAddress());
    return deployed as BaseContract as T;
}

task('deploy', 'Deploy token')
    .addParam('receivers', 'Receivers json file (see args.json)')
    .setAction(async (taskArgs, hre) => {
        const receiversFilename = taskArgs.receivers;
        const receivers = JSON.parse(fs.readFileSync(receiversFilename).toString()) as TokenReceivers[];

        const signers = await hre.ethers.getSigners();
        const feePayer = signers[0];
        const balance = await hre.ethers.provider.getBalance(feePayer.address);

        console.log('FEE PAYER:', feePayer.address, 'BALANCE', formatEther(balance));
        console.log('');

        const token = await deploy<SuperProtocol>(hre, 'SuperProtocol', feePayer, receivers);
        const supplied = formatEther(await token.totalSupply());
        const tokenAddress = await token.getAddress();

        const showBalance = async (address: string) => {
            const token = await hre.ethers.getContractAt('SuperProtocol', tokenAddress);
            const balance = await token.balanceOf(address);
            const uiBalance = (Number(balance) / Math.pow(10, 18) / Math.pow(10, 6)).toString() + 'm';
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
                version: '0.8.30',
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
    typechain: {
        outDir: 'typechain',
        target: 'ethers-v6',
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
                accountsBalance: parseEther('100000000').toString(),
                count: 10,
            },
        },
        local: {
            url: 'http://127.0.0.1:8545',
            accounts: ['0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'],
        },
        opbnbTestnet: {
            chainId: 5611,
            url: config.rpcUrl,
            accounts: [config.deployerPrivateKey],
        },
        opbnb: {
            chainId: 204,
            url: config.rpcUrl,
            accounts: [config.deployerPrivateKey],
        },
    },
};
