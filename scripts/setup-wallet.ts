#!/usr/bin/env ts-node

import { generatePrivateKey, privateKeyToAccount, Address } from 'viem/accounts';
import { createPublicClient, createWalletClient, http, formatEther } from 'viem';
import { aeneid, mainnet } from '@story-protocol/core-sdk';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 🚀 Complete Story.build Setup Script
 * 
 * One-command setup for Story.build development:
 * 1. Generates Ethereum wallet for Story Protocol
 * 2. Creates .env configuration
 * 3. Provides funding instructions
 * 4. Verifies setup
 * 5. Ready to register IP!
 */

type NetworkType = 'aeneid' | 'mainnet';

const networkConfigs = {
    aeneid: {
        name: 'Aeneid Testnet',
        rpcUrl: 'https://aeneid.storyrpc.io',
        chain: aeneid,
        explorer: 'https://aeneid.storyscan.io',
        protocolExplorer: 'https://aeneid.explorer.story.foundation',
        faucetInfo: 'Story Protocol Discord #faucet channel',
        recommended: true
    },
    mainnet: {
        name: 'Story Mainnet',
        rpcUrl: 'https://mainnet.storyrpc.io', 
        chain: mainnet,
        explorer: 'https://storyscan.io',
        protocolExplorer: 'https://explorer.story.foundation',
        faucetInfo: 'Use bridges or exchanges to get ETH',
        recommended: false
    }
} as const;

async function setupStoryBuild() {
    console.log('🎨 Story.build Complete Setup\\n');
    console.log('This will set up everything you need for IP registration and licensing!');
    console.log('────────────────────────────────────────────────────────────────────\\n');

    // Choose network
    const network: NetworkType = process.argv[2] as NetworkType || 'aeneid';
    const config = networkConfigs[network];

    if (!config) {
        console.error('❌ Invalid network. Use: aeneid or mainnet');
        process.exit(1);
    }

    console.log(`🌐 Setting up for: ${config.name}`);
    if (network === 'mainnet') {
        console.log('⚠️  Warning: Mainnet setup requires real ETH for transactions');
    }
    console.log('');

    try {
        // STEP 1: Generate wallet
        console.log('🔑 STEP 1: Generating your Ethereum wallet...');
        const privateKey = generatePrivateKey();
        const account = privateKeyToAccount(privateKey);
        
        console.log('✅ New wallet generated');
        console.log(`   Address: ${account.address}`);
        console.log(`   Network: ${config.name}\\n`);

        // STEP 2: Create clients
        console.log('🔗 STEP 2: Connecting to Story Protocol network...');
        const publicClient = createPublicClient({
            chain: config.chain,
            transport: http(config.rpcUrl),
        });

        const walletClient = createWalletClient({
            chain: config.chain,
            transport: http(config.rpcUrl),
            account,
        });

        // Test connection
        try {
            const chainId = await publicClient.getChainId();
            console.log('✅ Connected to Story Protocol');
            console.log(`   Chain ID: ${chainId}`);
            console.log(`   RPC: ${config.rpcUrl}\\n`);
        } catch (error) {
            throw new Error(`Failed to connect to ${config.name}: ${error}`);
        }

        // STEP 3: Check balance (will be 0 for new wallet)
        console.log('💰 STEP 3: Checking wallet balance...');
        const balance = await publicClient.getBalance({
            address: account.address
        });

        const balanceETH = formatEther(balance);
        console.log(`   Balance: ${balanceETH} ETH`);

        if (Number(balanceETH) === 0) {
            console.log('📝 Wallet needs funding for gas fees');
            console.log(`   Funding source: ${config.faucetInfo}\\n`);
        } else {
            console.log('✅ Wallet has balance for transactions\\n');
        }

        // STEP 4: Create .env file
        console.log('📄 STEP 4: Creating .env configuration...');

        const envPath = path.join(process.cwd(), '.env');
        const envContent = `# Story.build Configuration - Generated ${new Date().toISOString()}
# ${config.name} Setup

# Wallet Configuration  
WALLET_PRIVATE_KEY=${privateKey.slice(2)} # Remove 0x prefix for Story SDK
STORY_NETWORK=${network}

# Network Details (for reference)
# Address: ${account.address}
# Network: ${config.name}
# RPC URL: ${config.rpcUrl}
# Explorer: ${config.explorer}
# Protocol Explorer: ${config.protocolExplorer}
# Generated: ${new Date().toISOString()}

# Optional: Pinata for IPFS uploads (required for IP registration)
# PINATA_JWT=your_pinata_jwt_token_here

# Security Note: Keep this file secure and never commit to version control!
`;

        fs.writeFileSync(envPath, envContent);
        console.log('✅ .env file created with your credentials\\n');

        // STEP 5: Verify setup
        console.log('🔍 STEP 5: Verifying setup...');

        try {
            // Test Story Agent initialization
            const { StoryAgent } = await import('../src/agent');
            const agent = new StoryAgent();
            await agent.connect();

            const walletInfo = await agent.getWalletInfo();

            console.log('✅ Story Agent initialized successfully');
            console.log(`   Address: ${agent.account.address}`);
            console.log(`   Network: ${agent.network}`);
            console.log(`   Balance: ${Number(walletInfo.balance) / 1e18} ETH\\n`);

            await agent.disconnect();

        } catch (error: any) {
            console.log('⚠️  Story Agent verification failed:', error.message);
            console.log('   Configuration saved, manual verification needed\\n');
        }

        // STEP 6: Funding instructions
        if (Number(balanceETH) === 0) {
            console.log('💡 STEP 6: Funding your wallet...');
            
            if (network === 'aeneid') {
                console.log('📍 For Aeneid Testnet:');
                console.log('   1. Join Story Protocol Discord');
                console.log('   2. Go to #faucet channel');
                console.log('   3. Request testnet ETH with your address:');
                console.log(`      ${account.address}`);
                console.log('   4. Wait for confirmation (usually < 5 minutes)');
                console.log('   5. Run: npm run wallet:check\\n');
            } else {
                console.log('📍 For Mainnet:');
                console.log('   1. Use a bridge to transfer ETH to Story');
                console.log('   2. Or use a centralized exchange');
                console.log('   3. Send ETH to your address:');
                console.log(`      ${account.address}`);
                console.log('   4. Recommended: 0.1+ ETH for operations\\n');
            }
        }

        // STEP 7: Next steps
        console.log('🎯 STEP 7: Next steps...');
        console.log('');
        console.log('📚 Test your setup:');
        console.log('   npm run test:wallet     # Test wallet operations');
        console.log('   npm run dev             # Start MCP server');
        console.log('');
        console.log('🎨 Story Protocol operations:');
        console.log('   • Register IP assets from URLs');
        console.log('   • Create and attach license terms');
        console.log('   • Mint license tokens');
        console.log('   • Manage derivative works');
        console.log('   • Track royalties and revenue');
        console.log('');
        console.log('📖 Documentation:');
        console.log('   docs/SETUP_GUIDE.md     # Complete setup guide');
        console.log('   docs/WALLET_OPERATIONS.md  # Wallet tool reference');
        console.log('');

        // STEP 8: Setup complete!
        console.log('🎉 SETUP COMPLETE! Your Story.build environment is ready!\\n');
        console.log('🌟 Ready to revolutionize IP licensing! 🌟');

    } catch (error: any) {
        console.error('❌ Setup failed:', error.message);
        console.log('');
        console.log('🛠️  Troubleshooting:');
        console.log('   1. Check internet connection');
        console.log('   2. Verify Story Protocol network is accessible');
        console.log('   3. Try: npm run wallet:generate');
        console.log('   4. Check our documentation: docs/SETUP_GUIDE.md');
        console.log('   5. Join Story Protocol Discord for help');
    }
}

// Utility function to check wallet balance
async function checkWallet() {
    try {
        const { StoryAgent } = await import('../src/agent');
        const agent = new StoryAgent();
        await agent.connect();

        const walletInfo = await agent.getWalletInfo();
        const balance = Number(walletInfo.balance) / 1e18;

        console.log('🔍 Wallet Status Check\\n');
        console.log(`Address: ${agent.account.address}`);
        console.log(`Network: ${agent.network}`);
        console.log(`Balance: ${balance} ETH`);
        console.log(`Explorer: ${agent.networkInfo.blockExplorer}/address/${agent.account.address}`);
        console.log('');

        if (balance > 0.001) {
            console.log('✅ Wallet is funded and ready for operations!');
            console.log('🎨 Try: "What\\s my wallet balance?" in Claude Desktop');
        } else {
            console.log('⚠️  Wallet needs funding for gas fees');
            console.log('💡 Minimum recommended: 0.01 ETH');
        }

        await agent.disconnect();

    } catch (error) {
        console.error('❌ Wallet check failed:', error);
    }
}

// CLI handling
if (require.main === module) {
    const command = process.argv[2];
    
    if (command === 'check') {
        checkWallet().catch(console.error);
    } else {
        setupStoryBuild().catch(console.error);
    }
}

export { setupStoryBuild, checkWallet };