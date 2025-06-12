import { z } from "zod";
import { StoryAgent } from "../../agent";
import { type McpTool } from "../../types";
import { formatEther, Address } from "viem";
import { WIP_TOKEN_ADDRESS } from "@story-protocol/core-sdk";

export const GetAccountBalancesTool: McpTool = {
    name: "story_get_account_balances",
    description: "Get all token balances including ETH, IP tokens, and license tokens",
    schema: {
        account_address: z.string()
            .regex(/^0x[0-9a-fA-F]{40}$/)
            .optional()
            .describe("Ethereum address to check (optional, defaults to wallet address)")
    },
    handler: async (agent: StoryAgent, input: Record<string, any>) => {
        try {
            await agent.connect();

            const targetAddress = (input.account_address || agent.account.address) as Address;

            // Get ETH balance
            const ethBalance = await agent.publicClient.getBalance({
                address: targetAddress
            });

            // Get WIP token balance (Story Protocol's token)
            let wipBalance = BigInt(0);
            try {
                wipBalance = await agent.publicClient.readContract({
                    address: WIP_TOKEN_ADDRESS,
                    abi: [
                        {
                            name: 'balanceOf',
                            type: 'function',
                            stateMutability: 'view',
                            inputs: [{ name: 'account', type: 'address' }],
                            outputs: [{ name: '', type: 'uint256' }],
                        }
                    ],
                    functionName: 'balanceOf',
                    args: [targetAddress]
                });
            } catch (error) {
                console.error('Error fetching WIP balance:', error);
            }

            // Get IP token balance (for IP registration fees)
            let ipBalance = BigInt(0);
            try {
                // IP token address on the network
                const IP_TOKEN_ADDRESS = "0x1516000000000000000000000000000000000000" as Address;
                ipBalance = await agent.publicClient.readContract({
                    address: IP_TOKEN_ADDRESS,
                    abi: [
                        {
                            name: 'balanceOf',
                            type: 'function',
                            stateMutability: 'view',
                            inputs: [{ name: 'account', type: 'address' }],
                            outputs: [{ name: '', type: 'uint256' }],
                        }
                    ],
                    functionName: 'balanceOf',
                    args: [targetAddress]
                });
            } catch (error) {
                console.error('Error fetching IP balance:', error);
            }

            return {
                status: "success",
                message: `✅ Account balances retrieved for ${targetAddress}`,
                account_info: {
                    address: targetAddress,
                    network: agent.network,
                    is_own_wallet: targetAddress.toLowerCase() === agent.account.address.toLowerCase()
                },
                native_balance: {
                    symbol: "ETH",
                    balance: formatEther(ethBalance),
                    balance_wei: ethBalance.toString(),
                    usd_value: "N/A" // Could integrate price feeds later
                },
                story_protocol_tokens: {
                    wip: {
                        symbol: "WIP",
                        name: "Wrapped IP Token",
                        balance: formatEther(wipBalance),
                        balance_wei: wipBalance.toString(),
                        contract_address: WIP_TOKEN_ADDRESS,
                        purpose: "Used for licensing fees and royalty payments"
                    },
                    ip: {
                        symbol: "IP",
                        name: "IP Token", 
                        balance: formatEther(ipBalance),
                        balance_wei: ipBalance.toString(),
                        contract_address: "0x1516000000000000000000000000000000000000",
                        purpose: "Native Story Protocol governance and utility token"
                    }
                },
                portfolio_summary: {
                    total_eth_balance: formatEther(ethBalance),
                    total_wip_balance: formatEther(wipBalance),
                    total_ip_balance: formatEther(ipBalance),
                    can_pay_gas: Number(formatEther(ethBalance)) > 0.001,
                    can_pay_licensing_fees: wipBalance > 0 || ipBalance > 0,
                    ready_for_ip_operations: Number(formatEther(ethBalance)) > 0.001
                },
                next_steps: Number(formatEther(ethBalance)) < 0.001
                    ? [
                        "🔋 Fund wallet with ETH for gas fees",
                        "💎 Acquire WIP tokens for licensing operations",
                        "🎨 Ready to register IP assets once funded"
                    ]
                    : [
                        "✅ Sufficient ETH for gas fees",
                        "🎨 Ready to register IP assets",
                        "🎫 Ready to mint and purchase licenses",
                        wipBalance === BigInt(0) ? "💡 Consider acquiring WIP tokens for licensing" : "💎 WIP tokens available for licensing"
                    ]
            };
        } catch (error: any) {
            throw new Error(`Failed to get account balances: ${error.message}`);
        } finally {
            await agent.disconnect();
        }
    }
};