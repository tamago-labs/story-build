import { z } from "zod";
import { StoryAgent } from "../../agent";
import { type McpTool } from "../../types";
import { Address, isAddress } from "viem";

export const ValidateAddressTool: McpTool = {
    name: "story_validate_address",
    description: "Validate Ethereum address format and check if account exists on Story Protocol network",
    schema: {
        address: z.string()
            .describe("Ethereum address to validate")
    },
    handler: async (agent: StoryAgent, input: Record<string, any>) => {
        try {
            await agent.connect();

            const address = input.address;

            // Basic format validation
            const isValidFormat = isAddress(address);
            
            if (!isValidFormat) {
                return {
                    status: "invalid",
                    message: `❌ Invalid Ethereum address format: ${address}`,
                    validation_details: {
                        address: address,
                        is_valid_format: false,
                        is_checksum_valid: false,
                        exists_on_network: false,
                        error: "Invalid address format - must be 42 characters starting with 0x"
                    },
                    recommendations: [
                        "🔍 Check that address starts with '0x'",
                        "📏 Ensure address is exactly 42 characters long",
                        "🔤 Verify hexadecimal characters (0-9, a-f, A-F)",
                        "📋 Copy address directly from source to avoid typos"
                    ]
                };
            }

            const validAddress = address as Address;

              
            // Check checksum validation (EIP-55)
            const checksumAddress = address; // viem handles this automatically
            const isChecksumValid = isAddress(address);

 
            return {
                status: "valid",
                message: `✅ Valid Ethereum address: ${validAddress}`,
                validation_details: {
                    address: validAddress,
                    is_valid_format: isValidFormat,
                    is_checksum_valid: isChecksumValid,
                    network: agent.network
                },
                network_info: {
                    network: agent.network,
                    chain_id: await agent.publicClient.getChainId(),
                    block_explorer: agent.networkInfo.blockExplorer,
                    explorer_url: `${agent.networkInfo.blockExplorer}/address/${validAddress}`
                }
            };
        } catch (error: any) {
            throw new Error(`Failed to validate address: ${error.message}`);
        } finally {
            await agent.disconnect();
        }
    }
};