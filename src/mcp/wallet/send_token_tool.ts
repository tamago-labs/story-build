import { z } from "zod";
import { StoryAgent } from "../../agent";
import { type McpTool } from "../../types";
import { parseEther, Address, formatEther } from "viem";
import { WIP_TOKEN_ADDRESS } from "@story-protocol/core-sdk";

export const SendTokenTool: McpTool = {
    name: "story_send_token",
    description: "Send Story Protocol tokens (WIP, or custom tokens) to another address",
    schema: {
        token_address: z.string()
            .regex(/^0x[0-9a-fA-F]{40}$/)
            .describe("Token contract address (use 'WIP' for WIP token shortcut)"),
        destination: z.string()
            .regex(/^0x[0-9a-fA-F]{40}$/)
            .describe("Recipient's Ethereum address"),
        amount: z.number()
            .positive()
            .describe("Amount of tokens to send"),
        memo: z.string()
            .optional()
            .describe("Optional memo for the transaction")
    },
    handler: async (agent: StoryAgent, input: Record<string, any>) => {
        try {
            await agent.connect();

            const destination = input.destination as Address;
            let tokenAddress = input.token_address as Address;
            
            // Handle shortcuts
            if (input.token_address === "WIP") {
                tokenAddress = WIP_TOKEN_ADDRESS;
            } 

            const amount = parseEther(input.amount.toString());

            // ERC20 ABI for token operations
            const erc20Abi = [
                {
                    name: 'transfer',
                    type: 'function',
                    stateMutability: 'nonpayable',
                    inputs: [
                        { name: 'to', type: 'address' },
                        { name: 'amount', type: 'uint256' }
                    ],
                    outputs: [{ name: '', type: 'bool' }],
                },
                {
                    name: 'balanceOf',
                    type: 'function',
                    stateMutability: 'view',
                    inputs: [{ name: 'account', type: 'address' }],
                    outputs: [{ name: '', type: 'uint256' }],
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
                }
            ];

            // Get token info
            const [balance, symbol, decimals] = await Promise.all([
                agent.publicClient.readContract({
                    address: tokenAddress,
                    abi: erc20Abi,
                    functionName: 'balanceOf',
                    args: [agent.account.address]
                }) as Promise<bigint>,
                agent.publicClient.readContract({
                    address: tokenAddress,
                    abi: erc20Abi,
                    functionName: 'symbol'
                }) as Promise<string>,
                agent.publicClient.readContract({
                    address: tokenAddress,
                    abi: erc20Abi,
                    functionName: 'decimals'
                }) as Promise<number>
            ]);

            if (balance < amount) {
                throw new Error(`Insufficient ${symbol} balance. Available: ${formatEther(balance)}, Required: ${input.amount}`);
            }

            // Simulate token transfer first to catch errors and get accurate gas estimate
            const { request, result } = await agent.publicClient.simulateContract({
                address: tokenAddress,
                abi: erc20Abi,
                functionName: 'transfer',
                args: [destination, amount],
                account: agent.account.address
            });

            console.error(`✅ Transfer simulation successful. Proceeding with transaction...`);

            // Send token transfer transaction using the simulated request
            const txHash = await agent.walletClient.writeContract(request);

            // Wait for confirmation
            const receipt = await agent.publicClient.waitForTransactionReceipt({
                hash: txHash,
                confirmations: 1
            });

            return {
                status: "success",
                message: `✅ Successfully sent ${input.amount} ${symbol} to ${destination}`,
                transaction_details: {
                    transaction_hash: txHash,
                    from: agent.account.address,
                    to: destination,
                    token_address: tokenAddress,
                    token_symbol: symbol,
                    amount: `${input.amount} ${symbol}`,
                    amount_wei: amount.toString(),
                    decimals: decimals,
                    gas_used: receipt.gasUsed.toString(),
                    block_number: receipt.blockNumber.toString(),
                    confirmations: 1,
                    memo: input.memo || "N/A"
                },
                token_info: {
                    contract_address: tokenAddress,
                    symbol: symbol,
                    decimals: decimals,
                    is_story_protocol_token: tokenAddress === WIP_TOKEN_ADDRESS
                },
                network_info: {
                    network: agent.network,
                    explorer_url: `${agent.networkInfo.blockExplorer}/tx/${txHash}`
                },
                next_steps: [
                    "✅ Token transfer confirmed on blockchain",
                    "🔍 View transaction details on block explorer",
                    `💎 Recipient can now use ${symbol} tokens for Story Protocol operations`
                ]
            };
        } catch (error: any) {
            throw new Error(`Failed to send tokens: ${error.message}`);
        } finally {
            await agent.disconnect();
        }
    }
};