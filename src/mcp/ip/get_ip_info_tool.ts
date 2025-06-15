import { z } from "zod";
import { StoryAgent } from "../../agent";
import { type McpTool } from "../../types";
import { Address } from 'viem';
import axios from 'axios';

// Story Protocol API configuration
const STORY_API_BASE_URL = 'https://api.storyapis.com/api/v3';
const STORY_API_KEY = 'MhBsxkU1z9fG6TofE59KqiiWV-YlYE8Q4awlLQehF3U';

// API response interfaces
interface StoryAPIResponse {
    data: {
        ancestorCount: number;
        blockNumber: string;
        blockTimestamp: string;
        childrenCount: number;
        descendantCount: number;
        id: string;
        ipId: string;
        isGroup: boolean;
        latestArbitrationPolicy: string;
        nftMetadata: {
            chainId: string;
            imageUrl: string;
            name: string;
            tokenContract: string;
            tokenId: string;
            tokenUri: string;
        };
        parentCount: number;
        rootCount: number;
        rootIpIds: string[];
        transactionHash: string;
    };
}

export const GetIPInfoTool: McpTool = {
    name: "story_get_ip_info",
    description: "Get comprehensive information about an IP asset including metadata, license terms, and derivatives",
    schema: {
        ip_id: z.string()
            .regex(/^0x[0-9a-fA-F]{40}$/)
            .describe("IP asset ID (Ethereum address format)")
    },
    handler: async (agent: StoryAgent, input: Record<string, any>) => {
        try {
            await agent.connect();

            const ipId = input.ip_id as Address;
            console.error(`🔍 Getting IP asset information for: ${ipId}`);

            // Determine the chain based on network
            const chain = agent.network === 'mainnet' ? 'story' : 'story-aeneid';
            
            console.error(`🌐 Using Story API with chain: ${chain}`);

            // Fetch IP asset data from Story Protocol API
            console.error(`📡 Fetching IP asset from Story Protocol API...`);
            
            const apiHeaders = {
                'X-Api-Key': STORY_API_KEY,
                'X-Chain': chain,
                'Content-Type': 'application/json'
            };

            let apiResponse: StoryAPIResponse | null = null;
            let apiError: string | null = null;

            try {
                const response = await axios.get(
                    `${STORY_API_BASE_URL}/assets/${ipId}`,
                    { headers: apiHeaders }
                );
                apiResponse = response.data;
                console.error(`✅ Successfully fetched data from Story Protocol API`);
            } catch (error: any) {
                apiError = `API Error: ${error.response?.data?.message || error.message}`;
                console.error(`⚠️ Story Protocol API error: ${apiError}`);
            }

            // Fetch additional metadata from tokenURI if available
            let nftMetadata = null;
            let ipMetadata = null;

            if (apiResponse?.data?.nftMetadata?.tokenUri) {
                try {
                    console.error(`📝 Fetching NFT metadata from: ${apiResponse.data.nftMetadata.tokenUri}`);
                    const metadataResponse = await axios.get(apiResponse.data.nftMetadata.tokenUri, {
                        timeout: 10000
                    });
                    nftMetadata = metadataResponse.data;
                    console.error(`✅ Successfully fetched NFT metadata`);
                } catch (error: any) {
                    console.error(`⚠️ Failed to fetch NFT metadata: ${error.message}`);
                }
            }
 
        
            // Build comprehensive response
            const ipAssetInfo = apiResponse?.data ? {
                // Basic IP information
                ip_id: apiResponse.data.ipId,
                id: apiResponse.data.id,
                is_group: apiResponse.data.isGroup,
                
                // Transaction information
                block_number: apiResponse.data.blockNumber,
                block_timestamp: apiResponse.data.blockTimestamp,
                transaction_hash: apiResponse.data.transactionHash,
                
                // NFT information
                nft_metadata: {
                    chain_id: apiResponse.data.nftMetadata.chainId,
                    token_contract: apiResponse.data.nftMetadata.tokenContract,
                    token_id: apiResponse.data.nftMetadata.tokenId,
                    token_uri: apiResponse.data.nftMetadata.tokenUri,
                    name: apiResponse.data.nftMetadata.name,
                    image_url: apiResponse.data.nftMetadata.imageUrl
                },
                
                // Family tree information
                family_tree: {
                    ancestor_count: apiResponse.data.ancestorCount,
                    children_count: apiResponse.data.childrenCount,
                    descendant_count: apiResponse.data.descendantCount,
                    parent_count: apiResponse.data.parentCount,
                    root_count: apiResponse.data.rootCount,
                    root_ip_ids: apiResponse.data.rootIpIds
                },
                
                // Policy information
                latest_arbitration_policy: apiResponse.data.latestArbitrationPolicy
            } : null;

            console.error(`✅ Successfully retrieved IP asset information`);

            return {
                status: "success",
                message: `✅ Successfully retrieved information for IP: ${ipId}`,
                ip_asset: ipAssetInfo,
                metadata: {
                    nft_metadata: nftMetadata,
                    ip_metadata: ipMetadata
                },
                network_info: {
                    network: agent.network,
                    chain: chain,
                    explorer_url: `${agent.networkInfo.protocolExplorer}/ipa/${ipId}`
                },
                api_status: {
                    story_api_success: !!apiResponse,
                    story_api_error: apiError,
                    metadata_fetched: !!nftMetadata
                },
                derivatives_info: apiResponse?.data ? {
                    has_children: apiResponse.data.childrenCount > 0,
                    has_descendants: apiResponse.data.descendantCount > 0,
                    is_derivative: apiResponse.data.parentCount > 0,
                    is_root: apiResponse.data.rootCount === 1,
                    family_size: apiResponse.data.ancestorCount + apiResponse.data.descendantCount + 1
                } : null,
                licensing_info: {
                    ready_for_licensing: !!apiResponse?.data,
                    licensing_url: `${agent.networkInfo.protocolExplorer}/ipa/${ipId}/licenses`,
                    can_create_derivatives: !!apiResponse?.data
                },
                recommendations: [
                    apiResponse?.data ? "✅ IP asset found and accessible" : "⚠️ IP asset not found in Story Protocol API",
                    nftMetadata ? "✅ NFT metadata successfully loaded" : "⚠️ NFT metadata not available",
                    (apiResponse?.data?.childrenCount || 0) > 0 ? `📈 This IP has ${apiResponse?.data?.childrenCount || 0} derivative(s)` : "📋 No derivatives found",
                    (apiResponse?.data?.parentCount || 0) > 0 ? `🔗 This IP is a derivative of ${apiResponse?.data?.parentCount || 0} parent(s)` : "🌱 This is an original IP asset",
                    "💡 Use story_attach_license to enable licensing",
                    "🎫 Use story_mint_license to create license tokens"
                ]
            };

        } catch (error: any) {
            console.error('❌ Failed to get IP info:', error);
            throw new Error(`Failed to get IP info: ${error.message}`);
        } finally {
            await agent.disconnect();
        }
    }
};