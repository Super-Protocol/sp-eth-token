import '@nomiclabs/hardhat-waffle';
import '@typechain/hardhat';
import 'solidity-coverage';
import 'hardhat-contract-sizer';
import { task } from 'hardhat/config';
import { config } from './config';
import { Contract, Signer, utils } from 'ethers';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

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
