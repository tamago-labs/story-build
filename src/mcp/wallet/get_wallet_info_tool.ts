import { z } from "zod";
import { StoryAgent } from "../../agent";
import { type McpTool } from "../../types";

export const GetWalletInfoTool: McpTool = {
    name: "story_get_wallet_info",
    description: "Get wallet address and basic account information",
    schema: {},
    handler: async (agent: StoryAgent, input: Record<string, any>) => {
        try {
            await agent.connect();

            // const walletInfo = await agent.getWalletInfo();
            const balance = await agent.publicClient.getBalance({
                address: agent.account.address
            });
            
            const balanceInETH = Number(balance) / 1e18;

            return {
                status: "success",
                message: "✅ Wallet information retrieved successfully",
                wallet_details: {
                    address: agent.account.address,
                    network: agent.network,
                    balance: `${balanceInETH.toFixed(6)} IP`,
                    balance_in_wei: balance.toString(),
                    chain_id: await agent.publicClient.getChainId(),
                    block_explorer: agent.networkInfo.blockExplorer,
                    protocol_explorer: agent.networkInfo.protocolExplorer
                },
                account_status: {
                    activated: true,
                    minimum_balance_required: "0.01 IP",
                    can_register_ip: balanceInETH >= 0.01,
                    ready_for_operations: balanceInETH >= 0.001
                },
                recommendations: balanceInETH < 0.01 
                    ? [
                        "⚠️ Low IP balance detected",
                        "Fund wallet with at least 0.01 IP for IP registration",
                        "Gas fees required for all Story Protocol operations",
                        `Current balance: ${balanceInETH.toFixed(6)} IP`
                    ]
                    : [
                        "✅ Wallet has sufficient balance for operations",
                        "Ready to register IP assets",
                        "Ready to create license terms and mint tokens"
                    ]
            };
        } catch (error: any) {
            throw new Error(`Failed to get wallet info: ${error.message}`);
        } finally {
            await agent.disconnect();
        }
    }
};