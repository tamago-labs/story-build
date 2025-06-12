import { PinataSDK } from "pinata";
import { createHash } from 'crypto';

/**
 * Pinata IPFS utilities for Story Protocol
 * Handles metadata and media uploads for IP registration
 */

// Hardcoded Pinata configuration for development
const PINATA_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJjM2VhZmFkMy01M2YzLTRkZGMtYTE2Yi1jY2JlY2E4ZWViZDIiLCJlbWFpbCI6InBpc3V0aC5kYWVAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjczMzkyMWZlZDY3NGUzNGU2NDkyIiwic2NvcGVkS2V5U2VjcmV0IjoiNTViNWFjMDNiZGY2MThhNzZkNTFjNWU0ZGNmM2IxOTUwYmIyYWRhY2EzODRkNjVmNmYxN2ZhZWVjYTNmNGNmOCIsImV4cCI6MTc3ODkwOTIwNn0.zY7EaFlXAnnnCEBZpl6h3slRTYiqADKZH3RcvTXsQSs";
const PINATA_GATEWAY = "gold-changing-antelope-65.mypinata.cloud";

// Initialize Pinata SDK
export const pinata = new PinataSDK({
    pinataJwt: process.env.PINATA_JWT || PINATA_JWT,
    pinataGateway: process.env.PINATA_GATEWAY_URL || PINATA_GATEWAY,
});

/**
 * Upload image file to Pinata IPFS
 */
export const uploadImageToPinata = async (file: File): Promise<string> => {
    try {
        const { cid: imageHash } = await pinata.upload.file(file);
        console.log(`✅ Successfully uploaded image to Pinata with hash: ${imageHash}`);
        return imageHash;
    } catch (error: any) {
        console.error('❌ Failed to upload image to Pinata:', error);
        throw new Error(`Failed to upload image to IPFS: ${error.message}`);
    }
};

/**
 * Upload JSON metadata to Pinata IPFS
 */
export const uploadJsonToPinata = async (
    name: string,
    description: string,
    imageHash: string,
    properties: any = {}
): Promise<string> => {
    try {
        const jsonName = `${name
            .slice(0, 20)
            .replace(/\s/g, "_")}_${Date.now()}.json`;
        
        const metadata = {
            name: name,
            description: description,
            image: `ipfs://${imageHash}`,
            properties,
            // Additional Story Protocol specific fields
            created_at: new Date().toISOString(),
            protocol: "Story Protocol",
            version: "1.0"
        };

        const { cid: jsonHash } = await pinata.upload.json(metadata, {
            metadata: {
                name: jsonName,
            },
        });

        console.log(`✅ Successfully uploaded JSON ${jsonName} to Pinata with hash: ${jsonHash}`);
        return jsonHash;
    } catch (error: any) {
        console.error('❌ Failed to upload JSON to Pinata:', error);
        throw new Error(`Failed to upload JSON to IPFS: ${error.message}`);
    }
};

/**
 * Upload Story Protocol IP metadata (follows IpMetadata standard)
 */
export const uploadIPMetadata = async (ipMetadata: {
    title: string;
    description: string;
    creators: Array<{
        name: string;
        address: string;
        contributionPercent: number;
    }>;
    image?: string;
    imageHash?: string;
    mediaUrl?: string;
    mediaHash?: string;
    mediaType?: string;
    attributes?: Array<{
        trait_type: string;
        value: string;
    }>;
}): Promise<{ ipfsHash: string; contentHash: string }> => {
    try {
        const metadata = {
            title: ipMetadata.title,
            description: ipMetadata.description,
            createdAt: Math.floor(Date.now() / 1000).toString(),
            creators: ipMetadata.creators,
            image: ipMetadata.image,
            imageHash: ipMetadata.imageHash,
            mediaUrl: ipMetadata.mediaUrl,
            mediaHash: ipMetadata.mediaHash,
            mediaType: ipMetadata.mediaType,
            attributes: ipMetadata.attributes || [],
            // Story Protocol specific fields
            protocol: "Story Protocol",
            version: "1.0",
            standard: "IpMetadata"
        };

        const fileName = `ip_metadata_${ipMetadata.title
            .slice(0, 20)
            .replace(/\s/g, "_")}_${Date.now()}.json`;

        const { cid: ipfsHash } = await pinata.upload.json(metadata, {
            metadata: {
                name: fileName,
                keyvalues: {
                    type: "ip_metadata",
                    protocol: "story",
                    title: ipMetadata.title
                }
            },
        });

        // Generate content hash for Story Protocol
        const contentHash = createHash('sha256')
            .update(JSON.stringify(metadata))
            .digest('hex');

        console.log(`✅ Successfully uploaded IP metadata to Pinata with hash: ${ipfsHash}`);
        console.log(`📝 Content hash: 0x${contentHash}`);

        return {
            ipfsHash,
            contentHash: `0x${contentHash}`
        };
    } catch (error: any) {
        console.error('❌ Failed to upload IP metadata to Pinata:', error);
        throw new Error(`Failed to upload IP metadata to IPFS: ${error.message}`);
    }
};

/**
 * Upload NFT metadata (follows OpenSea standard)
 */
export const uploadNFTMetadata = async (nftMetadata: {
    name: string;
    description: string;
    image: string;
    animation_url?: string;
    attributes?: Array<{
        trait_type?: string;
        key?: string;
        value: string;
    }>;
    external_url?: string;
}): Promise<{ ipfsHash: string; contentHash: string }> => {
    try {
        const metadata = {
            name: nftMetadata.name,
            description: nftMetadata.description,
            image: nftMetadata.image,
            animation_url: nftMetadata.animation_url,
            external_url: nftMetadata.external_url,
            attributes: nftMetadata.attributes || [],
            // Additional metadata
            created_at: new Date().toISOString(),
            protocol: "Story Protocol"
        };

        const fileName = `nft_metadata_${nftMetadata.name
            .slice(0, 20)
            .replace(/\s/g, "_")}_${Date.now()}.json`;

        const { cid: ipfsHash } = await pinata.upload.json(metadata, {
            metadata: {
                name: fileName,
                keyvalues: {
                    type: "nft_metadata",
                    protocol: "story",
                    name: nftMetadata.name
                }
            },
        });

        // Generate content hash
        const contentHash = createHash('sha256')
            .update(JSON.stringify(metadata))
            .digest('hex');

        console.log(`✅ Successfully uploaded NFT metadata to Pinata with hash: ${ipfsHash}`);
        console.log(`📝 Content hash: 0x${contentHash}`);

        return {
            ipfsHash,
            contentHash: `0x${contentHash}`
        };
    } catch (error: any) {
        console.error('❌ Failed to upload NFT metadata to Pinata:', error);
        throw new Error(`Failed to upload NFT metadata to IPFS: ${error.message}`);
    }
};

/**
 * Upload raw file to Pinata IPFS
 */
export const uploadFileToPinata = async (
    fileBuffer: Buffer,
    fileName: string,
    mimeType?: string
): Promise<string> => {
    try {
        const file = new File([fileBuffer], fileName, { 
            type: mimeType || 'application/octet-stream' 
        });
        
        const { cid: fileHash } = await pinata.upload.file(file);
        console.log(`✅ Successfully uploaded file ${fileName} to Pinata with hash: ${fileHash}`);
        return fileHash;
    } catch (error: any) {
        console.error('❌ Failed to upload file to Pinata:', error);
        throw new Error(`Failed to upload file to IPFS: ${error.message}`);
    }
};

/**
 * Upload URL content to Pinata (downloads and uploads)
 */
export const uploadFromUrl = async (
    url: string,
    fileName?: string
): Promise<string> => {
    try {
        console.log(`📥 Downloading content from: ${url}`);
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch URL: ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type') || 'application/octet-stream';
        const buffer = Buffer.from(await response.arrayBuffer());
        
        const finalFileName = fileName || `content_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const fileHash = await uploadFileToPinata(buffer, finalFileName, contentType);
        console.log(`✅ Successfully uploaded URL content to IPFS: ${fileHash}`);
        
        return fileHash;
    } catch (error: any) {
        console.error('❌ Failed to upload from URL:', error);
        throw new Error(`Failed to upload from URL: ${error.message}`);
    }
};

/**
 * Get IPFS URL from hash
 */
export const getIPFSUrl = (hash: string): string => {
    return `https://ipfs.io/ipfs/${hash}`;
};

/**
 * Get Pinata gateway URL from hash
 */
export const getPinataUrl = (hash: string): string => {
    return `https://${PINATA_GATEWAY}/ipfs/${hash}`;
};

/**
 * Verify IPFS content exists
 */
export const verifyIPFSContent = async (hash: string): Promise<boolean> => {
    try {
        const response = await fetch(getIPFSUrl(hash), { method: 'HEAD' });
        return response.ok;
    } catch (error) {
        console.error(`❌ Failed to verify IPFS content: ${hash}`, error);
        return false;
    }
};

/**
 * Generate metadata hash for Story Protocol
 */
export const generateMetadataHash = (metadata: any): string => {
    const hash = createHash('sha256')
        .update(JSON.stringify(metadata))
        .digest('hex');
    return `0x${hash}`;
};

/**
 * Test Pinata connection
 */
export const testPinataConnection = async (): Promise<boolean> => {
    try {
        console.log('🔍 Testing Pinata connection...');
        
        // Upload a small test JSON
        const testData = {
            test: true,
            timestamp: Date.now(),
            message: "Story Protocol Pinata connection test"
        };

        const { cid } = await pinata.upload.json(testData, {
            metadata: {
                name: `story_test_${Date.now()}.json`,
            },
        });

        console.log(`✅ Pinata connection successful! Test file uploaded: ${cid}`);
        return true;
    } catch (error: any) {
        console.error('❌ Pinata connection failed:', error);
        return false;
    }
};