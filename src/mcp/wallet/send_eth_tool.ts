import { z } from "zod";
import { StoryAgent } from "../../agent";
import { type McpTool } from "../../types";
import { parseEther, Address } from "viem";

export const SendETHTool: McpTool = {
    name: "story_send_eth",
    description: "Send ETH to another address for gas fees or payments",
    schema: {
        destination: z.string()
            .regex(/^0x[0-9a-fA-F]{40}$/)
            .describe("Recipient's Ethereum address"),
        amount: z.number()
            .positive()
            .describe("Amount of ETH to send"),
        memo: z.string()
            .optional()
            .describe("Optional memo for the transaction")
    },
    handler: async (agent: StoryAgent, input: Record<string, any>) => {
        try {
            await agent.connect();

            const destination = input.destination as Address;
            const amount = parseEther(input.amount.toString());
            
            // Check sender balance
            const balance = await agent.publicClient.getBalance({
                address: agent.account.address
            });

            if (balance < amount) {
                throw new Error(`Insufficient balance. Available: ${Number(balance) / 1e18} ETH, Required: ${input.amount} ETH`);
            }

            // Simulate transaction first to get accurate gas estimate and catch errors
            let gasEstimate: bigint;
            try {
                // For ETH transfers, we use estimateGas directly since it's not a contract call
                gasEstimate = await agent.publicClient.estimateGas({
                    account: agent.account.address,
                    to: destination,
                    value: amount
                });
            } catch (error: any) {
                throw new Error(`Transaction simulation failed: ${error.message}. Check recipient address and amount.`);
            }

            // Get gas price for cost calculation
            const gasPrice = await agent.publicClient.getGasPrice();
            const gasCost = gasEstimate * gasPrice;

            if (balance < amount + gasCost) {
                throw new Error(`Insufficient balance for transaction + gas. Total needed: ${Number(amount + gasCost) / 1e18} ETH`);
            }

            console.error(`✅ ETH transfer simulation successful. Gas estimate: ${gasEstimate.toString()}`);

            // Send transaction
            const txHash = await agent.walletClient.sendTransaction({
                account: agent.account,
                to: destination,
                value: amount,
                gas: gasEstimate
            } as any);

            // Wait for confirmation
            const receipt = await agent.publicClient.waitForTransactionReceipt({
                hash: txHash,
                confirmations: 1
            });

            return {
                status: "success",
                message: `✅ Successfully sent ${input.amount} ETH to ${destination}`,
                transaction_details: {
                    transaction_hash: txHash,
                    from: agent.account.address,
                    to: destination,
                    amount: `${input.amount} ETH`,
                    amount_wei: amount.toString(),
                    gas_used: receipt.gasUsed.toString(),
                    gas_price: gasPrice.toString(),
                    total_cost: `${Number(amount + (receipt.gasUsed * gasPrice)) / 1e18} ETH`,
                    block_number: receipt.blockNumber.toString(),
                    confirmations: 1,
                    memo: input.memo || "N/A"
                },
                network_info: {
                    network: agent.network,
                    explorer_url: `${agent.networkInfo.blockExplorer}/tx/${txHash}`
                },
                next_steps: [
                    "✅ Transaction confirmed on blockchain",
                    "🔍 View transaction details on block explorer",
                    "💰 Recipient can now use ETH for Story Protocol operations"
                ]
            };
        } catch (error: any) {
            throw new Error(`Failed to send ETH: ${error.message}`);
        } finally {
            await agent.disconnect();
        }
    }
};