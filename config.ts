import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '/.env') });

export const config = {
    rpcUrl: process.env.RPC_URL,
    deployerPrivateKey: process.env.DEPLOYER_PRIVATE_KEY,
    mochaBail: process.argv.filter(arg => arg == '--bail').length > 0 || process.env.MOCHA_BAIL === 'true',
};
