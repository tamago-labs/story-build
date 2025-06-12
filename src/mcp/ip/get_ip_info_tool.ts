import { z } from "zod";
import { StoryAgent } from "../../agent";
import { type McpTool } from "../../types";
import { Address } from 'viem';

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

            // Get basic IP asset info
            console.error(`📋 Fetching basic IP asset data...`);
            const ipAsset = await agent.client.ipAccount.getToken(ipId);

            if (!ipAsset) {
                throw new Error(`IP asset not found: ${ipId}`);
            }

            const tokenURI = await agent.client.nftClient.getTokenURI({
                tokenId: ipAsset.tokenId,
                spgNftContract: ipAsset.tokenContract
            });

            // Get IP metadata if available
            let ipMetadata = null;
            try {
                if (tokenURI) {
                    console.error(`📝 Fetching IP metadata from: ${tokenURI}`);
                    const response = await fetch(tokenURI);
                    if (response.ok) {
                        ipMetadata = await response.json();
                    }
                }
            } catch (error) {
                console.error(`⚠️ Failed to fetch IP metadata: ${error}`);
            }

            console.error("ipMetadata: ", ipMetadata)
 
            // TODO: Figure out how to get its full information

            console.error(`✅ Successfully retrieved IP asset information`);

            return {
                status: "success",
                message: `✅ Successfully retrieved information for IP: ${ipId}`,
                ip_asset: {
                    ip_id: ipId, 
                    token_id: `${ipAsset.tokenId}`
                },
                ipMetadata
            };

        } catch (error: any) {
            console.error('❌ Failed to get IP info:', error);
            throw new Error(`Failed to get IP info: ${error.message}`);
        } finally {
            await agent.disconnect();
        }
    }
};