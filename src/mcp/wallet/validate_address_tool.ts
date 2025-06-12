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

            // Check if account exists on network
            let accountExists = false;
            let balance = BigInt(0);
            let nonce = 0;
            let isContract = false;

            try {
                // Get account information
                const [accountBalance, accountNonce, code] = await Promise.all([
                    agent.publicClient.getBalance({ address: validAddress }),
                    agent.publicClient.getTransactionCount({ address: validAddress }),
                    agent.publicClient.getBytecode({ address: validAddress })
                ]);

                balance = accountBalance;
                nonce = accountNonce;
                isContract = !!(code && code !== '0x');
                accountExists = balance > 0 || nonce > 0 || isContract;

            } catch (error) {
                console.error('Error checking account existence:', error);
                // Account might not exist or network issue
            }

            // Check checksum validation (EIP-55)
            const checksumAddress = address; // viem handles this automatically
            const isChecksumValid = isAddress(address);

            // Determine account type
            let accountType = "unknown";
            if (isContract) {
                accountType = "contract";
            } else if (nonce > 0 || balance > 0) {
                accountType = "externally_owned_account";
            } else {
                accountType = "new_account";
            }

            return {
                status: "valid",
                message: `✅ Valid Ethereum address: ${validAddress}`,
                validation_details: {
                    address: validAddress,
                    is_valid_format: isValidFormat,
                    is_checksum_valid: isChecksumValid,
                    exists_on_network: accountExists,
                    account_type: accountType,
                    is_contract: isContract,
                    balance_eth: (Number(balance) / 1e18).toFixed(6),
                    balance_wei: balance.toString(),
                    transaction_count: nonce,
                    network: agent.network
                },
                network_info: {
                    network: agent.network,
                    chain_id: await agent.publicClient.getChainId(),
                    block_explorer: agent.networkInfo.blockExplorer,
                    explorer_url: `${agent.networkInfo.blockExplorer}/address/${validAddress}`
                },
                story_protocol_compatibility: {
                    can_register_ip: accountExists && !isContract,
                    can_receive_tokens: true,
                    can_own_license_tokens: !isContract,
                    can_pay_royalties: accountExists,
                    ready_for_operations: accountExists && !isContract
                },
                security_notes: [
                    isChecksumValid ? "✅ Checksum validation passed" : "⚠️ Consider using checksummed address",
                    isContract ? "🤖 This is a smart contract address" : "👤 This is an externally owned account",
                    accountExists ? "✅ Account exists on network" : "🆕 New account (no transactions yet)",
                    balance > 0 ? `💰 Has balance: ${(Number(balance) / 1e18).toFixed(6)} ETH` : "💸 Zero balance"
                ],
                next_steps: accountExists
                    ? [
                        "✅ Address validation successful",
                        "🔍 View account details on block explorer",
                        "💎 Ready for Story Protocol operations",
                        isContract ? "⚠️ Smart contracts cannot register IP directly" : "🎨 Can register IP assets and own licenses"
                    ]
                    : [
                        "✅ Valid address format",
                        "🆕 New account - fund with ETH to activate",
                        "💡 Send ETH to this address to begin using Story Protocol",
                        "🎨 Once funded, can register IP and participate in licensing"
                    ]
            };
        } catch (error: any) {
            throw new Error(`Failed to validate address: ${error.message}`);
        } finally {
            await agent.disconnect();
        }
    }
};