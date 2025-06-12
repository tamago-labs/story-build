#!/usr/bin/env node

import { validateEnvironment } from './config';
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StoryMcpTools, getImplementationStatus } from "./mcp";
import { StoryAgent } from './agent';

/**
 * Creates an MCP server for IP registration and licensing on Story Protocol
 */
function createMcpServer(agent: StoryAgent) {
    // Create MCP server instance
    const server = new McpServer({
        name: "story-build",
        version: "0.1.0"
    });

    // Register all Story Protocol tools
    for (const [_key, tool] of Object.entries(StoryMcpTools)) {
        server.tool(tool.name, tool.description, tool.schema, async (params: any): Promise<any> => {
            try {
                // Execute the handler with the params directly
                const result = await tool.handler(agent, params);

                // Format the result as MCP tool response
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                };
            } catch (error) {
                console.error("Tool execution error:", error);
                // Handle errors in MCP format
                return {
                    isError: true,
                    content: [
                        {
                            type: "text",
                            text: error instanceof Error
                                ? error.message
                                : "Unknown error occurred",
                        },
                    ],
                };
            }
        });
    }

    return server;
}

async function main() {
    try {
        console.error("🎨 Starting Story.build MCP Server...");

        // Validate environment before proceeding
        validateEnvironment();

        // Create Story agent
        const storyAgent = new StoryAgent();

        // Get implementation status
        const status = getImplementationStatus();
        console.error(`📊 Implementation Status: ${status.implemented}/${status.total_defined} tools (${status.completion_percentage}%)`);

        // Create and start MCP server
        const server = createMcpServer(storyAgent);
        const transport = new StdioServerTransport();
        await server.connect(transport);

        console.error("✅ Story.build MCP Server is running!");
        console.error("🎯 IP registration and licensing tools ready!");
        
        console.error("\n🔑 Phase 0 - Wallet Operations (✅ COMPLETE):");
        console.error("   • story_get_wallet_info - Get wallet address and account information");
        console.error("   • story_get_account_balances - Get ETH, WIP, and IP token balances");
        console.error("   • story_send_eth - Send ETH for gas fees");
        console.error("   • story_send_token - Send WIP, IP, or other tokens");
        console.error("   • story_approve_token - Approve tokens for Story Protocol contracts");
        console.error("   • story_check_allowance - Check token allowances for contracts");
        console.error("   • story_get_token_info - Get comprehensive ERC20 token information");
        console.error("   • story_get_transaction_history - View recent transaction history");
        console.error("   • story_validate_address - Validate Ethereum addresses");
        
        console.error("\n🎨 Phase 1 - Core IP Operations (🚧 TO IMPLEMENT):");
        console.error("   • story_register_ip - Register IP assets from URLs or metadata");
        console.error("   • story_attach_license - Create and attach license terms");
        console.error("   • story_mint_license - Mint license tokens for IP usage");
        
        console.error("\n💰 Phase 2 - Advanced Features (🚧 TO IMPLEMENT):");
        console.error("   • story_pay_royalty - Pay royalties to IP owners");
        console.error("   • story_claim_revenue - Claim accumulated revenue");
        console.error("   • story_register_derivative - Register derivative works");
        
        console.error("\n🏗️ Phase 3 - Platform Generation (🚧 TO IMPLEMENT):");
        console.error("   • story_generate_marketplace - AI-powered marketplace creation");
        console.error("   • story_generate_portfolio - Generate artist portfolio sites");
        
        console.error("");
        console.error("💡 Try: 'What's my wallet address and balance?'");
        console.error("🔋 Try: 'Send 0.1 ETH to address 0x...'");
        console.error("💎 Try: 'Approve WIP tokens for Story Protocol operations'");

    } catch (error) {
        console.error('❌ Error starting Story.build MCP server:', error);
        process.exit(1);
    }
}

main();