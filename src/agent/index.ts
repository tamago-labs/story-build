import { client, publicClient, walletClient, account, network, networkInfo } from '../config';
// import { Address } from 'viem';
// import { IpMetadata, WIP_TOKEN_ADDRESS } from '@story-protocol/core-sdk'; 
// import { 
//     IPAssetData, 
//     LicenseTerms, 
//     LicenseToken, 
//     RevenueInfo,
//     RegisterIPInput,
//     CreateLicenseInput,
//     MintLicenseInput,
//     RegisterDerivativeInput,
//     PayRoyaltyInput,
//     ClaimRevenueInput,
//     StoryResult 
// } from '../types'; 

export class StoryAgent {
    public client: typeof client;
    public account: typeof account;
    public walletClient: typeof walletClient;
    public publicClient: typeof publicClient;
    public network: typeof network;
    public networkInfo: typeof networkInfo;

    constructor() {
        // Use the configured clients from config
        this.client = client;
        this.account = account;
        this.walletClient = walletClient;
        this.publicClient = publicClient;
        this.network = network;
        this.networkInfo = networkInfo;

        console.error(`🎨 Story Agent initialized on ${this.network}`);
        console.error(`📍 Wallet address: ${this.account.address}`);
    }

    async connect(): Promise<void> {
        try {
            // Test connection by getting chain ID
            const chainId = await this.publicClient.getChainId();
            console.error(`✅ Connected to Story Protocol (Chain ID: ${chainId})`);
            console.error(`🌐 Network: ${this.network}`);
            console.error(`🔗 Explorer: ${this.networkInfo.protocolExplorer}`);
        } catch (error) {
            console.error('❌ Failed to connect to Story Protocol:', error);
            throw error;
        }
    }

    async disconnect(): Promise<void> {
        console.error('🔌 Disconnected from Story Protocol');
    }

    async getWalletInfo(): Promise<any> {
        try {
            const balance = await this.publicClient.getBalance({
                address: this.account.address
            });

            return {
                address: this.account.address,
                balance: balance.toString(),
                network: this.network,
                chainId: await this.publicClient.getChainId(),
                blockExplorer: this.networkInfo.blockExplorer,
                protocolExplorer: this.networkInfo.protocolExplorer
            };
        } catch (error) {
            console.error('Failed to get wallet info:', error);
            throw error;
        }
    }
 
}
