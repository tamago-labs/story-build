#!/usr/bin/env ts-node

import { StoryAgent } from '../src/agent';
import { GetAccountBalancesTool } from '../src/mcp/wallet/get_account_balances_tool'; 

/**
 * 🔍 Wallet Status Checker
 * 
 * Comprehensive check of wallet status and readiness for Story Protocol operations
 */

async function checkWalletStatus() {
    console.log('🔍 Story Protocol Wallet Status Check\\n');

    try {
        // Initialize agent
        const agent = new StoryAgent();
        console.log(`🌐 Network: ${agent.network}`);
        console.log(`📍 Wallet: ${agent.account.address}`);
        console.log('');

        await agent.connect();

        // Check basic wallet info
        console.log('💰 Balance Check:');
        const balances = await GetAccountBalancesTool.handler(agent, {});
        
        const ethBalance = parseFloat(balances.native_balance.balance);
        const wipBalance = parseFloat(balances.story_protocol_tokens.wip.balance);
        const ipBalance = parseFloat(balances.story_protocol_tokens.ip.balance);

        console.log(`   ETH: ${balances.native_balance.balance}`);
        console.log(`   WIP: ${balances.story_protocol_tokens.wip.balance}`);
        console.log(`   IP:  ${balances.story_protocol_tokens.ip.balance}`);
        console.log('');

        // Operational readiness assessment
        console.log('🎯 Operational Readiness:');
        
        // Gas fees
        if (ethBalance >= 0.01) {
            console.log('   ✅ Gas Fees: Sufficient ETH for transactions');
        } else if (ethBalance >= 0.001) {
            console.log('   ⚠️  Gas Fees: Low ETH - recommended 0.01+ ETH');
        } else {
            console.log('   ❌ Gas Fees: Insufficient ETH for operations');
        }

        // IP registration
        if (ethBalance >= 0.01) {
            console.log('   ✅ IP Registration: Ready to register IP assets');
        } else {
            console.log('   ❌ IP Registration: Need ETH for gas fees');
        }

        // Licensing operations
        if (wipBalance > 0 && ethBalance >= 0.001) {
            console.log('   ✅ Licensing: Ready for license operations');
        } else if (ethBalance >= 0.001) {
            console.log('   ⚠️  Licensing: Need WIP tokens for licensing fees');
        } else {
            console.log('   ❌ Licensing: Need ETH and WIP tokens');
        }

        // Governance
        if (ipBalance > 0) {
            console.log('   ✅ Governance: Can participate in protocol governance');
        } else {
            console.log('   ℹ️  Governance: No IP tokens (optional for basic operations)');
        }

        console.log('');

        // Network information
        console.log('🌐 Network Information:');
        console.log(`   Network: ${agent.network}`);
        console.log(`   RPC: ${agent.networkInfo.rpcProviderUrl}`);
        console.log(`   Block Explorer: ${agent.networkInfo.blockExplorer}`);
        console.log(`   Protocol Explorer: ${agent.networkInfo.protocolExplorer}`);
        console.log('');

        // Recommendations
        console.log('💡 Recommendations:');
        
        if (ethBalance < 0.01) {
            console.log('   🔋 Fund wallet with ETH for gas fees');
            if (agent.network === 'aeneid') {
                console.log('      • Join Story Protocol Discord');
                console.log('      • Request testnet ETH in #faucet channel');
                console.log(`      • Your address: ${agent.account.address}`);
            } else {
                console.log('      • Bridge ETH to Story Protocol mainnet');
                console.log('      • Recommended: 0.1+ ETH for operations');
            }
        }

        if (wipBalance === 0 && ethBalance >= 0.01) {
            console.log('   💎 Acquire WIP tokens for licensing operations');
            console.log('      • WIP tokens are used for licensing fees');
            console.log('      • Check DEXs or community for WIP tokens');
        }

        if (ethBalance >= 0.01 && wipBalance > 0) {
            console.log('   ✅ Wallet is fully ready for Story Protocol operations!');
            console.log('   🎨 Try registering your first IP asset');
        }

        console.log('');

        // Quick test commands
        console.log('🧪 Test Commands:');
        console.log('   npm run test:wallet     # Test all wallet operations');
        console.log('   npm run dev             # Start MCP server');
        console.log('');
        console.log('📱 Claude Desktop Test:');
        console.log(`   "What's my wallet balance?"`);
        console.log(`   "Send 0.001 ETH to 0x742d35Cc6634C0532925a3b8D2fEE1b0e5dBC27C"`);
        console.log(`   "Get details about WIP token"`);

        await agent.disconnect();

    } catch (error: any) {
        console.error('❌ Wallet check failed:', error.message);
        console.log('');
        console.log('🛠️  Troubleshooting:');
        console.log('   1. Check .env file exists with WALLET_PRIVATE_KEY');
        console.log('   2. Verify private key format (64 hex chars, no 0x prefix)');
        console.log('   3. Check network connectivity');
        console.log('   4. Run: npm run setup:wallet');
    }
}

// Utility to show wallet info in table format
async function showWalletTable() {
    try {
        const agent = new StoryAgent();
        await agent.connect();

        const balances = await GetAccountBalancesTool.handler(agent, {});
        
        console.log('┌─────────────────────────────────────────────────┐');
        console.log('│               WALLET STATUS                     │');
        console.log('├─────────────────────────────────────────────────┤');
        console.log(`│ Address: ${agent.account.address.slice(0, 20)}...     │`);
        console.log(`│ Network: ${agent.network.padEnd(20)}            │`);
        console.log('├─────────────────────────────────────────────────┤');
        console.log(`│ ETH:  ${balances.native_balance.balance.padEnd(20)} │`);
        console.log(`│ WIP:  ${balances.story_protocol_tokens.wip.balance.padEnd(20)} │`);
        console.log(`│ IP:   ${balances.story_protocol_tokens.ip.balance.padEnd(20)} │`);
        console.log('└─────────────────────────────────────────────────┘');

        await agent.disconnect();
    } catch (error) {
        console.error('❌ Failed to show wallet table:', error);
    }
}

// CLI handling
if (require.main === module) {
    const command = process.argv[2];
    
    if (command === 'table') {
        showWalletTable().catch(console.error);
    } else {
        checkWalletStatus().catch(console.error);
    }
}

export { checkWalletStatus, showWalletTable };