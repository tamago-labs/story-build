import { aeneid, mainnet, StoryClient, StoryConfig } from '@story-protocol/core-sdk';
import { Chain, createPublicClient, createWalletClient, http, WalletClient } from 'viem';
import { privateKeyToAccount, Address, Account } from 'viem/accounts';
import dotenv from 'dotenv';

dotenv.config();

// Network configuration types
type NetworkType = 'aeneid' | 'mainnet';

interface NetworkConfig {
    rpcProviderUrl: string;
    blockExplorer: string;
    protocolExplorer: string;
    defaultNFTContractAddress: Address | null;
    defaultSPGNFTContractAddress: Address | null;
    chain: Chain;
}

const getArgs = () =>
    process.argv.reduce((args: any, arg: any) => {
        // long arg
        if (arg.slice(0, 2) === "--") {
            const longArg = arg.split("=");
            const longArgFlag = longArg[0].slice(2);
            const longArgValue = longArg.length > 1 ? longArg[1] : true;
            args[longArgFlag] = longArgValue;
        }
        // flags
        else if (arg[0] === "-") {
            const flags = arg.slice(1).split("");
            flags.forEach((flag: any) => {
                args[flag] = true;
            });
        }
        return args;
    }, {});

// Network configurations
const networkConfigs: Record<NetworkType, NetworkConfig> = {
    aeneid: {
        rpcProviderUrl: 'https://aeneid.storyrpc.io',
        blockExplorer: 'https://aeneid.storyscan.io',
        protocolExplorer: 'https://aeneid.explorer.story.foundation',
        defaultNFTContractAddress: '0x937bef10ba6fb941ed84b8d249abc76031429a9a' as Address,
        defaultSPGNFTContractAddress: '0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc' as Address,
        chain: aeneid,
    },
    mainnet: {
        rpcProviderUrl: 'https://mainnet.storyrpc.io',
        blockExplorer: 'https://storyscan.io',
        protocolExplorer: 'https://explorer.story.foundation',
        defaultNFTContractAddress: null,
        defaultSPGNFTContractAddress: '0x98971c660ac20880b60F86Cc3113eBd979eb3aAE' as Address,
        chain: mainnet,
    },
} as const;

const getNetwork = (): NetworkType => {

    const args = getArgs();
    const network = ((args?.story_network || process.env.STORY_NETWORK) || 'aeneid') as NetworkType;

    if (network && !(network in networkConfigs)) {
        throw new Error(`Invalid network: ${network}. Must be one of: ${Object.keys(networkConfigs).join(', ')}`);
    }
    return network || 'aeneid';
};

const getAccount = (): Account => {

    const args = getArgs();
    const hasPrivateKey = !!(args?.wallet_private_key || process.env.WALLET_PRIVATE_KEY);

    if (!hasPrivateKey) {
        throw new Error('WALLET_PRIVATE_KEY environment variable is required');
    }

    return privateKeyToAccount(`0x${(args?.wallet_private_key || process.env.WALLET_PRIVATE_KEY)}` as Address);
}

// Initialize client configuration
export const network = getNetwork();

export const networkInfo = {
    ...networkConfigs[network],
    rpcProviderUrl: networkConfigs[network].rpcProviderUrl,
};

export const account: Account = getAccount()

const config: StoryConfig = {
    account,
    transport: http(networkInfo.rpcProviderUrl),
    chainId: network,
};

export const client = StoryClient.newClient(config);

const baseConfig = {
    chain: networkInfo.chain,
    transport: http(networkInfo.rpcProviderUrl),
} as const;

export const publicClient = createPublicClient(baseConfig);

export const walletClient = createWalletClient({
    ...baseConfig,
    account,
}) as WalletClient;

export function validateEnvironment(): void {
    try {
        getAccount()
        getNetwork()
        console.error(`✅ Story Protocol environment configuration valid (${network})`);
        console.error(`📍 RPC URL: ${networkInfo.rpcProviderUrl}`);
        console.error(`📍 Account: ${account.address}`);
    } catch (error) {
        console.error('❌ Invalid environment configuration:', error);
        throw error;
    }
}
