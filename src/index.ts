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
        
        
    } catch (error) {
        console.error('❌ Error starting Story.build MCP server:', error);
        process.exit(1);
    }
}

main();