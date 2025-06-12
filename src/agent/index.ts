import { client, publicClient, walletClient, account, network, networkInfo } from '../config';
import { Address } from 'viem';
import { IpMetadata, WIP_TOKEN_ADDRESS } from '@story-protocol/core-sdk';
import { 
    IPAssetData, 
    LicenseTerms, 
    LicenseToken, 
    RevenueInfo,
    RegisterIPInput,
    CreateLicenseInput,
    MintLicenseInput,
    RegisterDerivativeInput,
    PayRoyaltyInput,
    ClaimRevenueInput,
    StoryResult 
} from '../types';

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

    // async registerIPAsset(input: RegisterIPInput): Promise<StoryResult> {
    //     try {
    //         console.error(`🎨 Registering IP Asset for token ${input.tokenId}...`);

    //         const response = await client.ipAsset.register({
    //             nftContract: input.tokenContract as Address,
    //             tokenId: input.tokenId,
    //             metadata: {
    //                 metadataURI: input.metadata?.metadataURI || '',
    //                 metadataHash: input.metadata?.metadataHash || '0x',
    //                 nftMetadataHash: input.metadata?.nftMetadataHash || '0x'
    //             },
    //             txOptions: {
    //                 waitForTransaction: true
    //             }
    //         });

    //         console.error(`✅ IP Asset registered: ${response.ipId}`);

    //         return {
    //             success: true,
    //             data: {
    //                 ipId: response.ipId,
    //                 tokenContract: input.tokenContract,
    //                 tokenId: input.tokenId
    //             },
    //             transactionHash: response.txHash
    //         };

    //     } catch (error: any) {
    //         console.error('Failed to register IP asset:', error);
    //         return {
    //             success: false,
    //             error: error.message
    //         };
    //     }
    // }

    // async getIPAsset(ipId: string): Promise<IPAssetData | null> {
    //     try {
    //         // Note: The actual SDK method might be different
    //         // This is a placeholder implementation
    //         console.error(`🔍 Getting IP Asset info for ${ipId}...`);
            
    //         // For now, return basic structure - update when SDK method is available
    //         return {
    //             id: ipId,
    //             name: 'IP Asset',
    //             description: 'Story Protocol IP Asset',
    //             tokenContract: '0x0000000000000000000000000000000000000000',
    //             tokenId: '1',
    //             ipId: ipId,
    //             owner: account.address,
    //             metadata: {}
    //         };

    //     } catch (error: any) {
    //         console.error('Failed to get IP asset:', error);
    //         return null;
    //     }
    // }

    // async attachLicenseTerms(input: CreateLicenseInput): Promise<StoryResult> {
    //     try {
    //         console.error(`📜 Attaching license terms to IP ${input.ipId}...`);

    //         const response = await client.license.attachLicenseTerms({
    //             ipId: input.ipId as Address,
    //             licenseTermsId: input.licenseTermsId || '1', // Use provided or default
    //             txOptions: {
    //                 waitForTransaction: true
    //             }
    //         });

    //         console.error(`✅ License terms attached successfully`);

    //         return {
    //             success: true,
    //             data: response,
    //             transactionHash: response.txHash
    //         };

    //     } catch (error: any) {
    //         console.error('Failed to attach license terms:', error);
    //         return {
    //             success: false,
    //             error: error.message
    //         };
    //     }
    // }

    // async mintLicense(input: MintLicenseInput): Promise<StoryResult> {
    //     try {
    //         console.error(`🎫 Minting license for IP ${input.licensorIpId}...`);

    //         const response = await client.license.mintLicenseTokens({
    //             licenseTermsId: input.licenseTermsId,
    //             licensorIpId: input.licensorIpId as Address,
    //             amount: input.amount,
    //             receiver: input.receiver as Address,
    //             txOptions: {
    //                 waitForTransaction: true
    //             }
    //         });

    //         console.error(`✅ License minted: ${response.licenseTokenIds}`);

    //         return {
    //             success: true,
    //             data: {
    //                 licenseTokenIds: response.licenseTokenIds,
    //                 amount: input.amount,
    //                 receiver: input.receiver
    //             },
    //             transactionHash: response.txHash
    //         };

    //     } catch (error: any) {
    //         console.error('Failed to mint license:', error);
    //         return {
    //             success: false,
    //             error: error.message
    //         };
    //     }
    // }

    // async registerDerivative(input: RegisterDerivativeInput): Promise<StoryResult> {
    //     try {
    //         console.error(`🔗 Registering derivative IP ${input.childIpId}...`);

    //         const response = await client.ipAsset.registerDerivative({
    //             childIpId: input.childIpId as Address,
    //             parentIpIds: input.parentIpIds as Address[],
    //             licenseTermsIds: input.licenseTermsIds,
    //             txOptions: {
    //                 waitForTransaction: true
    //             }
    //         });

    //         console.error(`✅ Derivative registered successfully`);

    //         return {
    //             success: true,
    //             data: response,
    //             transactionHash: response.txHash
    //         };

    //     } catch (error: any) {
    //         console.error('Failed to register derivative:', error);
    //         return {
    //             success: false,
    //             error: error.message
    //         };
    //     }
    // }

    // async payRoyalty(input: PayRoyaltyInput): Promise<StoryResult> {
    //     try {
    //         console.error(`💰 Paying royalty from ${input.payerIpId} to ${input.receiverIpId}...`);

    //         const response = await client.royalty.payRoyaltyOnBehalf({
    //             receiverIpId: input.receiverIpId as Address,
    //             payerIpId: input.payerIpId as Address,
    //             token: input.token as Address,
    //             amount: BigInt(input.amount),
    //             txOptions: {
    //                 waitForTransaction: true
    //             }
    //         });

    //         console.error(`✅ Royalty paid successfully`);

    //         return {
    //             success: true,
    //             data: response,
    //             transactionHash: response.txHash
    //         };

    //     } catch (error: any) {
    //         console.error('Failed to pay royalty:', error);
    //         return {
    //             success: false,
    //             error: error.message
    //         };
    //     }
    // }

    // async claimRevenue(input: ClaimRevenueInput): Promise<StoryResult> {
    //     try {
    //         console.error(`💎 Claiming revenue for IP ${input.ipId}...`);

    //         const response = await client.royalty.claimAllRevenue({
    //             ancestorIpId: input.ipId as Address,
    //             claimer: input.ipId as Address,
    //             childIpIds: [],
    //             royaltyPolicies: [],
    //             currencyTokens: [input.token as Address || WIP_TOKEN_ADDRESS],
    //             txOptions: {
    //                 waitForTransaction: true
    //             }
    //         });

    //         console.error(`✅ Revenue claimed successfully`);

    //         return {
    //             success: true,
    //             data: response,
    //             transactionHash: response.txHash
    //         };

    //     } catch (error: any) {
    //         console.error('Failed to claim revenue:', error);
    //         return {
    //             success: false,
    //             error: error.message
    //         };
    //     }
    // }

    // async getRevenueInfo(ipId: string, token: string): Promise<RevenueInfo | null> {
    //     try {
    //         // Get revenue information for an IP asset
    //         // Note: Implementation depends on available SDK methods
    //         const revenue = await this.client.royalty.getRoyaltyData({
    //             ipId: ipId as Address,
    //             token: token as Address
    //         });

    //         return {
    //             ipId,
    //             token,
    //             unclaimedRevenue: revenue.unclaimedRevenue?.toString() || '0',
    //             claimedRevenue: revenue.claimedRevenue?.toString() || '0',
    //             totalRevenue: revenue.totalRevenue?.toString() || '0'
    //         };

    //     } catch (error: any) {
    //         console.error('Failed to get revenue info:', error);
    //         return null;
    //     }
    // }

    // async getLicenseTokens(owner: string): Promise<LicenseToken[]> {
    //     try {
    //         // Get license tokens owned by an address
    //         // Note: Implementation depends on available SDK methods
    //         const tokens = await this.client.license.getLicenseTokens({
    //             owner: owner as Address
    //         });

    //         return tokens.map((token: any) => ({
    //             id: token.id,
    //             tokenId: token.tokenId,
    //             licensorIpId: token.licensorIpId,
    //             licenseTermsId: token.licenseTermsId,
    //             transferable: token.transferable,
    //             owner: token.owner,
    //             amount: token.amount?.toString() || '1'
    //         }));

    //     } catch (error: any) {
    //         console.error('Failed to get license tokens:', error);
    //         return [];
    //     }
    // }
}
