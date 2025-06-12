import { z } from "zod";
import { StoryAgent } from "../../agent";
import { type McpTool } from "../../types";
import { parseEther, formatEther } from 'viem';
import { WIP_TOKEN_ADDRESS } from "@story-protocol/core-sdk";


export const WrapIPTool: McpTool = {
    name: "story_wrap_ip",
    description: "Wrap IP tokens to WIP tokens for use in licensing and trading",
    schema: {
        amount: z.number()
            .positive()
            .describe("Amount of IP tokens to wrap into WIP tokens"),
        check_balance: z.boolean()
            .default(true)
            .describe("Check IP balance before wrapping")
    },
    handler: async (agent: StoryAgent, input: Record<string, any>) => {
        try {
            await agent.connect();

            const amount = input.amount;
            const amountWei = parseEther(amount.toString());

            console.error(`🔄 Wrapping ${amount} IP tokens to WIP...`);

            // Check IP balance if requested
            if (input.check_balance) {
                console.error(`💰 Checking IP token balance...`);
                try {
                    const ipBalance = await agent.publicClient.getBalance({
                        address: agent.account.address
                    });

                    const ipBalanceFormatted = Number(formatEther(ipBalance));
                    
                    if (ipBalanceFormatted < amount) {
                        throw new Error(`Insufficient IP balance. Required: ${amount} IP, Available: ${ipBalanceFormatted} IP`);
                    }
                    
                    console.error(`✅ Sufficient IP balance: ${ipBalanceFormatted} IP`);
                } catch (error) {
                    console.error(`⚠️ Could not verify IP balance: ${error}`);
                }
            }

            // Wrap IP to WIP using Story Protocol client
            console.error(`🔄 Executing wrap transaction...`);
            const response = await agent.client.wipClient.deposit({
                amount: amountWei
            });

            // Get updated balances
            console.error(`📊 Fetching updated balances...`); 
            let newWIPBalance = "0";

            try { 

                // Get new WIP balance
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
                newWIPBalance = formatEther(wipBalance);
            } catch (error) {
                console.error(`⚠️ Could not fetch updated balances: ${error}`);
            }

            console.error(`✅ Successfully wrapped ${amount} IP to WIP!`);

            return {
                status: "success",
                message: `✅ Successfully wrapped ${amount} IP tokens to WIP`,
                wrap_details: {
                    amount_wrapped: `${amount} IP`,
                    received: `${amount} WIP`,
                    exchange_rate: "1:1 (IP to WIP)",
                    wrapped_at: new Date().toISOString()
                },
                transaction_info: {
                    tx_hash: response.txHash,
                    block_explorer: `${agent.networkInfo.blockExplorer}/tx/${response.txHash}`,
                    gas_used: "Varies by network congestion"
                },
                balance_changes: { 
                    wip_balance: {
                        before: `${Number(newWIPBalance) - amount} WIP (estimated)`,
                        after: `${newWIPBalance} WIP`,
                        change: `+${amount} WIP`
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
                    wip_advantages: [
                        "🎫 Required for license token minting fees",
                        "💰 Used for royalty payments",
                        "🔄 ERC20 compatibility for DeFi integrations",
                        "🎨 Derivative work licensing payments",
                        "💱 Trading on DEXs and markets"
                    ],
                    when_to_wrap: [
                        "Before minting license tokens with fees",
                        "To pay for derivative licensing",
                        "For revenue sharing payments",
                        "To interact with Story Protocol contracts",
                        "For trading on secondary markets"
                    ]
                },
                next_steps: [
                    "✅ WIP tokens ready for Story Protocol operations",
                    "🎫 Use WIP for license token minting fees",
                    "💰 Pay royalties and licensing fees",
                    "🔄 Unwrap back to IP using story_unwrap_wip if needed",
                    `💎 Current WIP balance: ${newWIPBalance} WIP`
                ]
            };

        } catch (error: any) {
            console.error('❌ Failed to wrap IP tokens:', error);
            throw new Error(`Failed to wrap IP tokens: ${error.message}`);
        } finally {
            await agent.disconnect();
        }
    }
};