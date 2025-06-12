export interface McpTool {
    name: string;
    description: string;
    schema: Record<string, any>;
    handler: (agent: any, input: Record<string, any>) => Promise<any>;
}

export interface IPAssetData {
    id: string;
    name: string;
    description: string;
    tokenContract: string;
    tokenId: string;
    ipId: string;
    owner: string;
    createdAt?: string;
    metadata?: {
        image?: string;
        attributes?: Array<{
            trait_type: string;
            value: string;
        }>;
        [key: string]: any;
    };
}

export interface LicenseTerms {
    id: string;
    termsId: string;
    commercialUse: boolean;
    commercialAttribution: boolean;
    commercializerChecker: string;
    commercializerCheckerData: string;
    commercialRevShare: number;
    derivativesAllowed: boolean;
    derivativesAttribution: boolean;
    derivativesApproval: boolean;
    derivativesReciprocal: boolean;
    territories: string[];
    distributionChannels: string[];
    contentRestrictions: string[];
}

export interface LicenseToken {
    id: string;
    tokenId: string;
    licensorIpId: string;
    licenseTermsId: string;
    transferable: boolean;
    owner: string;
    amount: string;
}

export interface RevenueInfo {
    ipId: string;
    token: string;
    unclaimedRevenue: string;
    claimedRevenue: string;
    totalRevenue: string;
}

export interface RegisterIPInput {
    tokenContract: string;
    tokenId: string;
    metadata?: {
        metadataURI?: string;
        metadataHash?: string;
        nftMetadataHash?: string;
        name?: string;
        description?: string;
        image?: string;
        attributes?: Array<{
            trait_type: string;
            value: string;
        }>;
    };
}

export interface CreateLicenseInput {
    ipId: string;
    licenseTermsId?: string;
    commercialUse: boolean;
    commercialRevShare?: number;
    derivativesAllowed: boolean;
    territories?: string[];
    distributionChannels?: string[];
    contentRestrictions?: string[];
}

export interface MintLicenseInput {
    licensorIpId: string;
    licenseTermsId: string;
    amount: number;
    receiver: string;
}

export interface RegisterDerivativeInput {
    childIpId: string;
    parentIpIds: string[];
    licenseTermsIds: string[];
}

export interface PayRoyaltyInput {
    receiverIpId: string;
    payerIpId: string;
    token: string;
    amount: string;
}

export interface ClaimRevenueInput {
    ipId: string;
    token?: string;
}

export interface StoryResult {
    success: boolean;
    data?: any;
    error?: string;
    transactionHash?: string;
}

export interface WalletInfo {
    address: string;
    balance: string;
    network: string;
    chainId: number;
    blockExplorer: string;
    protocolExplorer: string;
}

export interface TokenInfo {
    symbol: string;
    name: string;
    address: string;
    balance: string;
    decimals: number;
}

export interface TransactionInfo {
    hash: string;
    from: string;
    to: string;
    value: string;
    blockNumber: string;
    timestamp: string;
    status: string;
    gasUsed: string;
}
