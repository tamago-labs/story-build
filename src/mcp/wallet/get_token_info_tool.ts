import { z } from "zod";
import { StoryAgent } from "../../agent";
import { type McpTool } from "../../types";
import { Address, formatEther } from "viem";
import { WIP_TOKEN_ADDRESS } from "@story-protocol/core-sdk";

export const GetTokenInfoTool: McpTool = {
    name: "story_get_token_info",
    description: "Get comprehensive information about ERC20 tokens including metadata and user balances",
    schema: {
        token_address: z.string()
            .regex(/^0x[0-9a-fA-F]{40}$/)
            .describe("Token contract address (use 'WIP' for WIP token shortcut)"),
        account_address: z.string()
            .regex(/^0x[0-9a-fA-F]{40}$/)
            .optional()
            .describe("Address to check balance for (optional, defaults to wallet address)")
    },
    handler: async (agent: StoryAgent, input: Record<string, any>) => {
        try {
            await agent.connect();

            let tokenAddress = input.token_address as Address;
            const accountAddress = (input.account_address || agent.account.address) as Address;
            
            // Handle shortcuts
            if (input.token_address === "WIP") {
                tokenAddress = WIP_TOKEN_ADDRESS;
            }

            // Extended ERC20 ABI for comprehensive token info
            const erc20Abi = [
                {
                    name: 'name',
                    type: 'function',
                    stateMutability: 'view',
                    inputs: [],
                    outputs: [{ name: '', type: 'string' }],
                },
                {
                    name: 'symbol',
                    type: 'function',
                    stateMutability: 'view',
                    inputs: [],
                    outputs: [{ name: '', type: 'string' }],
                },
                {
                    name: 'decimals',
                    type: 'function',
                    stateMutability: 'view',
                    inputs: [],
                    outputs: [{ name: '', type: 'uint8' }],
                },
                {
                    name: 'totalSupply',
                    type: 'function',
                    stateMutability: 'view',
                    inputs: [],
                    outputs: [{ name: '', type: 'uint256' }],
                },
                {
                    name: 'balanceOf',
                    type: 'function',
                    stateMutability: 'view',
                    inputs: [{ name: 'account', type: 'address' }],
                    outputs: [{ name: '', type: 'uint256' }],
                }
            ];

            // Get basic token information
            const [name, symbol, decimals, totalSupply, balance] = await Promise.all([
                agent.publicClient.readContract({
                    address: tokenAddress,
                    abi: erc20Abi,
                    functionName: 'name'
                }) as Promise<string>,
                agent.publicClient.readContract({
                    address: tokenAddress,
                    abi: erc20Abi,
                    functionName: 'symbol'
                }) as Promise<string>,
                agent.publicClient.readContract({
                    address: tokenAddress,
                    abi: erc20Abi,
                    functionName: 'decimals'
                }) as Promise<number>,
                agent.publicClient.readContract({
                    address: tokenAddress,
                    abi: erc20Abi,
                    functionName: 'totalSupply'
                }) as Promise<bigint>,
                agent.publicClient.readContract({
                    address: tokenAddress,
                    abi: erc20Abi,
                    functionName: 'balanceOf',
                    args: [accountAddress]
                }) as Promise<bigint>
            ]);

            // Get contract bytecode to verify it's a contract
            const bytecode = await agent.publicClient.getBytecode({
                address: tokenAddress
            });

            const isContract = !!(bytecode && bytecode !== '0x');

            // Calculate formatted values
            const totalSupplyFormatted = formatEther(totalSupply);
            const balanceFormatted = formatEther(balance);
            const balancePercentage = totalSupply > 0 ? (Number(balance) / Number(totalSupply)) * 100 : 0;

            // Determine token type and purpose
            const getTokenInfo = () => {
                if (tokenAddress === WIP_TOKEN_ADDRESS) {
                    return {
                        type: "story_protocol_token",
                        category: "wrapped_token",
                        purpose: "Used for licensing fees and royalty payments on Story Protocol",
                        official: true
                    };
                } else {
                    return {
                        type: "erc20_token",
                        category: "custom",
                        purpose: "Custom ERC20 token - verify legitimacy before use",
                        official: false
                    };
                }
            };

            const tokenInfo = getTokenInfo();

            return {
                status: "success",
                message: `✅ Token information retrieved for ${symbol}`,
                token_metadata: {
                    contract_address: tokenAddress,
                    name: name,
                    symbol: symbol,
                    decimals: decimals,
                    total_supply: totalSupplyFormatted,
                    total_supply_wei: totalSupply.toString(),
                    is_contract: isContract,
                    ...tokenInfo
                },
                account_balance: {
                    address: accountAddress,
                    balance: balanceFormatted,
                    balance_wei: balance.toString(),
                    percentage_of_supply: balancePercentage.toFixed(6) + "%",
                    is_holder: balance > 0,
                    is_own_wallet: accountAddress.toLowerCase() === agent.account.address.toLowerCase()
                },
                supply_analysis: {
                    total_supply_formatted: totalSupplyFormatted,
                    user_balance_formatted: balanceFormatted,
                    supply_concentration: balancePercentage > 1 ? "significant_holder" : 
                                        balancePercentage > 0.1 ? "moderate_holder" : 
                                        balancePercentage > 0 ? "small_holder" : "non_holder"
                },
                story_protocol_integration: {
                    is_story_token: tokenInfo.official,
                    can_use_for_licensing: tokenAddress === WIP_TOKEN_ADDRESS,
                    can_use_for_governance: false,
                    purpose: tokenInfo.purpose,
                    recommended_for_ip_operations: tokenInfo.official
                },
                network_info: {
                    network: agent.network,
                    block_explorer: agent.networkInfo.blockExplorer,
                    token_explorer_url: `${agent.networkInfo.blockExplorer}/token/${tokenAddress}`,
                    account_explorer_url: `${agent.networkInfo.blockExplorer}/token/${tokenAddress}?a=${accountAddress}`
                },
                operational_status: {
                    has_balance: balance > 0,
                    can_transfer: balance > 0,
                    ready_for_story_operations: tokenInfo.official && balance > 0,
                    needs_acquisition: balance === BigInt(0) && tokenInfo.official
                },
                next_steps: balance === BigInt(0) 
                    ? [
                        `💰 Acquire ${symbol} tokens to use for Story Protocol`,
                        tokenInfo.official ? `🎯 ${symbol} is required for licensing operations` : "⚠️ Verify token legitimacy before acquiring",
                        `🔍 View token details on ${agent.networkInfo.blockExplorer}`,
                        "💡 Use story_send_token to receive tokens from others"
                    ]
                    : [
                        `✅ You have ${balanceFormatted} ${symbol} tokens`,
                        tokenInfo.official ? "🎨 Ready for Story Protocol operations" : "⚠️ Verify token legitimacy before using",
                        "💎 Use story_approve_token to enable contract spending",
                        "🔄 Use story_send_token to transfer to others"
                    ]
            };
        } catch (error: any) {
            throw new Error(`Failed to get token info: ${error.message}`);
        } finally {
            await agent.disconnect();
        }
    }
};