import { z } from "zod";
import { StoryAgent } from "../../agent";
import { type McpTool } from "../../types";
import { parseEther, formatEther } from 'viem';
import { WIP_TOKEN_ADDRESS } from "@story-protocol/core-sdk";


export const UnwrapWIPTool: McpTool = {
    name: "story_unwrap_wip",
    description: "Unwrap WIP tokens back to IP tokens (reverse of wrapping)",
    schema: {
        amount: z.number()
            .positive()
            .describe("Amount of WIP tokens to unwrap back to IP tokens"),
        check_balance: z.boolean()
            .default(true)
            .describe("Check WIP balance before unwrapping")
    },
    handler: async (agent: StoryAgent, input: Record<string, any>) => {
        try {
            await agent.connect();

            const amount = input.amount;
            const amountWei = parseEther(amount.toString());

            console.error(`🔄 Unwrapping ${amount} WIP tokens to IP...`);

            // Check WIP balance if requested
            if (input.check_balance) {
                console.error(`💰 Checking WIP token balance...`);
                try {
                    const wipBalance = await agent.publicClient.readContract({
                        address: WIP_TOKEN_ADDRESS, // WIP token address
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
                        args: [agent.account.address]
                    });

                    const wipBalanceFormatted = Number(formatEther(wipBalance));

                    if (wipBalanceFormatted < amount) {
                        throw new Error(`Insufficient WIP balance. Required: ${amount} WIP, Available: ${wipBalanceFormatted} WIP`);
                    }

                    console.error(`✅ Sufficient WIP balance: ${wipBalanceFormatted} WIP`);
                } catch (error) {
                    console.warn(`⚠️ Could not verify WIP balance: ${error}`);
                }
            }

            // Unwrap WIP to IP using Story Protocol client
            console.error(`🔄 Executing unwrap transaction...`);
            const response = await agent.client.wipClient.withdraw({
                amount: amountWei
            });

            // Get updated balances
            console.error(`📊 Fetching updated balances...`);
            let newIPBalance = "0";

            try {
                // Get new IP balance
                const ipBalance = await agent.publicClient.getBalance({
                    address: agent.account.address
                });
                newIPBalance = formatEther(ipBalance);
            } catch (error) {
                console.warn(`⚠️ Could not fetch updated balances: ${error}`);
            }

            console.error(`✅ Successfully unwrapped ${amount} WIP to IP!`);

            return {
                status: "success",
                message: `✅ Successfully unwrapped ${amount} WIP tokens to IP`,
                unwrap_details: {
                    amount_unwrapped: `${amount} WIP`,
                    received: `${amount} IP`,
                    exchange_rate: "1:1 (WIP to IP)",
                    unwrapped_at: new Date().toISOString()
                },
                transaction_info: {
                    tx_hash: response.txHash,
                    block_explorer: `${agent.networkInfo.blockExplorer}/tx/${response.txHash}`,
                    gas_used: "Varies by network congestion"
                },
                balance_changes: { 
                    ip_balance: {
                        before: `${Number(newIPBalance) - amount} IP (estimated)`,
                        after: `${newIPBalance} IP`,
                        change: `+${amount} IP`
                    }
                },
                token_info: {
                    wip_token: {
                        name: "Wrapped IP Token",
                        symbol: "WIP",
                        address: WIP_TOKEN_ADDRESS,
                        type: "ERC20 wrapper for IP token"
                    }
                },
                use_cases: {
                    ip_advantages: [
                        "🏛️ Native Story Protocol governance token",
                        "🎯 Direct protocol participation",
                        "💎 Long-term holding and staking",
                        "🗳️ Voting on protocol proposals",
                        "🔄 Can be wrapped back to WIP anytime"
                    ],
                    when_to_unwrap: [
                        "After completing licensing operations",
                        "To participate in governance voting",
                        "For long-term storage as native token",
                        "When no longer needing ERC20 compatibility",
                        "To reduce smart contract interaction complexity"
                    ]
                },
                conversion_info: {
                    total_wrapped_supply: "Dynamic (based on user deposits)",
                    backing: "1:1 WIP backed by IP tokens",
                    reversibility: "Always reversible at 1:1 ratio",
                    fees: "Only gas fees, no protocol fees"
                },
                next_steps: [
                    "✅ IP tokens received and ready for use",
                    "🏛️ Participate in Story Protocol governance",
                    "💎 Hold native IP tokens long-term",
                    "🔄 Wrap back to WIP using story_wrap_ip if needed",
                    `💰 Current IP balance: ${newIPBalance} IP`
                ]
            };

        } catch (error: any) {
            console.error('❌ Failed to unwrap WIP tokens:', error);
            throw new Error(`Failed to unwrap WIP tokens: ${error.message}`);
        } finally {
            await agent.disconnect();
        }
    }
};