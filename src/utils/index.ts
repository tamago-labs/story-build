/**
 * Story Protocol MCP Utilities
 * 
 * Comprehensive utilities for IP registration and IPFS operations
 */

// IPFS and Pinata utilities
export {
    pinata,
    uploadImageToPinata,
    uploadJsonToPinata,
    uploadIPMetadata,
    uploadNFTMetadata,
    uploadFileToPinata,
    uploadFromUrl,
    getIPFSUrl,
    getPinataUrl,
    verifyIPFSContent,
    generateMetadataHash,
    testPinataConnection
} from './pinata';

// URL parsing and content extraction
export {
    parseInstagramUrl,
    parseTwitterUrl,
    parseArtStationUrl,
    parseBehanceUrl,
    parseYouTubeUrl,
    parseImageUrl,
    parseContentUrl,
    generateIPMetadataFromContent,
    validateUrl,
    getSupportedPlatforms
} from './url-parser';

// Type definitions for utilities
export interface ParsedContent {
    title: string;
    description: string;
    imageUrl?: string;
    mediaUrl?: string;
    mediaType?: string;
    creator?: string;
    platform: string;
    originalUrl: string;
    attributes?: Array<{
        trait_type: string;
        value: string;
    }>;
}

export interface IPFSMetadata {
    ipfsHash: string;
    contentHash: string;
}

export interface GeneratedMetadata {
    ipMetadata: any;
    nftMetadata: any;
    ipfsHashes: {
        imageHash?: string;
        mediaHash?: string;
        ipMetadataHash: string;
        nftMetadataHash: string;
    };
}