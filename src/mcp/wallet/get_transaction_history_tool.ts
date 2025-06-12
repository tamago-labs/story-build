import { z } from "zod";
import { StoryAgent } from "../../agent";
import { type McpTool } from "../../types";
import { Address, formatEther } from "viem";

export const GetTransactionHistoryTool: McpTool = {
    name: "story_get_transaction_history",
    description: "Get recent transaction history for the wallet or specified address",
    schema: {
        account_address: z.string()
            .regex(/^0x[0-9a-fA-F]{40}$/)
            .optional()
            .describe("Address to check (optional, defaults to wallet address)"),
        limit: z.number()
            .min(1)
            .max(100)
            .default(20)
            .describe("Number of transactions to retrieve (max 100)")
    },
    handler: async (agent: StoryAgent, input: Record<string, any>) => {
        try {
            await agent.connect();

            const targetAddress = (input.account_address || agent.account.address) as Address;
            const limit = input.limit || 20;

            // Get current block number
            const currentBlock = await agent.publicClient.getBlockNumber();
            const fromBlock = currentBlock - BigInt(10000); // Look back ~10k blocks

            // Get recent blocks to find transactions
            const recentTransactions = [];
            const blocksToCheck = Math.min(Number(limit * 5), 1000); // Check enough blocks to find transactions

            for (let i = 0; i < blocksToCheck && recentTransactions.length < limit; i++) {
                try {
                    const blockNumber = currentBlock - BigInt(i);
                    const block = await agent.publicClient.getBlock({
                        blockNumber,
                        includeTransactions: true
                    });

                    // Find transactions involving our address
                    for (const tx of block.transactions) {
                        if (typeof tx === 'object') {
                            if ((tx.from?.toLowerCase() === targetAddress.toLowerCase() ||
                                tx.to?.toLowerCase() === targetAddress.toLowerCase()) &&
                                recentTransactions.length < limit) {

                                // Get transaction receipt for more details
                                try {
                                    const receipt = await agent.publicClient.getTransactionReceipt({
                                        hash: tx.hash
                                    });

                                    recentTransactions.push({
                                        hash: tx.hash,
                                        block_number: block.number?.toString(),
                                        timestamp: new Date(Number(block.timestamp) * 1000).toISOString(),
                                        from: tx.from,
                                        to: tx.to,
                                        value: tx.value ? formatEther(tx.value) : '0',
                                        gas_used: receipt.gasUsed.toString(),
                                        gas_price: tx.gasPrice?.toString(),
                                        status: receipt.status === 'success' ? 'success' : 'failed',
                                        type: tx.from?.toLowerCase() === targetAddress.toLowerCase() ? 'sent' : 'received',
                                        is_contract_interaction: tx.to && tx.input !== '0x'
                                    });
                                } catch (receiptError) {
                                    // If we can't get receipt, add basic info
                                    recentTransactions.push({
                                        hash: tx.hash,
                                        block_number: block.number?.toString(),
                                        timestamp: new Date(Number(block.timestamp) * 1000).toISOString(),
                                        from: tx.from,
                                        to: tx.to,
                                        value: tx.value ? formatEther(tx.value) : '0',
                                        gas_used: 'N/A',
                                        gas_price: tx.gasPrice?.toString(),
                                        status: 'unknown',
                                        type: tx.from?.toLowerCase() === targetAddress.toLowerCase() ? 'sent' : 'received',
                                        is_contract_interaction: tx.to && tx.input !== '0x'
                                    });
                                }
                            }
                        }
                    }
                } catch (blockError) {
                    console.error(`Error fetching block ${currentBlock - BigInt(i)}:`, blockError);
                    continue;
                }
            }

            // Sort by block number (most recent first)
            recentTransactions.sort((a, b) => {
                const blockA = parseInt(a.block_number || '0');
                const blockB = parseInt(b.block_number || '0');
                return blockB - blockA;
            });

            // Calculate summary statistics
            const sentTransactions = recentTransactions.filter(tx => tx.type === 'sent');
            const receivedTransactions = recentTransactions.filter(tx => tx.type === 'received');
            const contractInteractions = recentTransactions.filter(tx => tx.is_contract_interaction);

            const totalSent = sentTransactions.reduce((sum, tx) => sum + parseFloat(tx.value), 0);
            const totalReceived = receivedTransactions.reduce((sum, tx) => sum + parseFloat(tx.value), 0);

            return {
                status: "success",
                message: `✅ Retrieved ${recentTransactions.length} recent transactions for ${targetAddress}`,
                account_info: {
                    address: targetAddress,
                    network: agent.network,
                    is_own_wallet: targetAddress.toLowerCase() === agent.account.address.toLowerCase(),
                    blocks_searched: blocksToCheck,
                    from_block: fromBlock.toString(),
                    to_block: currentBlock.toString()
                },
                transaction_summary: {
                    total_transactions: recentTransactions.length,
                    sent_transactions: sentTransactions.length,
                    received_transactions: receivedTransactions.length,
                    contract_interactions: contractInteractions.length,
                    total_eth_sent: `${totalSent.toFixed(6)} ETH`,
                    total_eth_received: `${totalReceived.toFixed(6)} ETH`,
                    net_eth_flow: `${(totalReceived - totalSent).toFixed(6)} ETH`
                },
                transactions: recentTransactions.map(tx => ({
                    ...tx,
                    explorer_url: `${agent.networkInfo.blockExplorer}/tx/${tx.hash}`,
                    age: tx.timestamp ? getTimeAgo(new Date(tx.timestamp)) : 'Unknown'
                })),
                network_info: {
                    network: agent.network,
                    block_explorer: agent.networkInfo.blockExplorer,
                    current_block: currentBlock.toString()
                },
                story_protocol_activity: {
                    ip_registrations: contractInteractions.filter(tx =>
                        tx.to?.toLowerCase().includes('story') ||
                        tx.to?.toLowerCase().includes('ip')
                    ).length,
                    licensing_transactions: contractInteractions.filter(tx =>
                        tx.to?.toLowerCase().includes('license')
                    ).length,
                    total_protocol_interactions: contractInteractions.length
                },
                next_steps: recentTransactions.length === 0
                    ? [
                        "🔍 No recent transactions found",
                        "💡 Start by funding your wallet with ETH",
                        "🎨 Begin registering IP assets on Story Protocol"
                    ]
                    : [
                        "✅ Transaction history retrieved successfully",
                        "🔍 Click explorer URLs to view detailed transaction info",
                        `📊 Found ${contractInteractions.length} smart contract interactions`,
                        "💎 Ready to analyze Story Protocol activity"
                    ]
            };
        } catch (error: any) {
            throw new Error(`Failed to get transaction history: ${error.message}`);
        } finally {
            await agent.disconnect();
        }
    }
};


const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
}