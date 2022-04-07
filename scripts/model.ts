export type Contracts = {
    promoStaking: string;
    liquidityRewards: string;
    insidersVesting: string;
    daoVesting: string;
    stakingRewards: string;
    providersRewards: string;
    demandStimulus: string;
};

export type Multisigs = {
    liquidityRewards: string;
    publicSale: string;
    dao: string;
};

export type TokenReceivers = {
    contracts: Contracts;
    multisigs: Multisigs;
};

export type AirdropInfo = {
    receiver: string;
    amount: number;
};
