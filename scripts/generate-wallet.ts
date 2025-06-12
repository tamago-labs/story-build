#!/usr/bin/env ts-node

import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 🚀 Quick Wallet Generator for Story Protocol
 * 
 * Generates a new Ethereum wallet and saves to .env
 * No network connection required - just pure wallet generation
 */

function generateWallet() {
    console.log('🔑 Generating new Ethereum wallet for Story Protocol...\\n');

    // Generate wallet
    const privateKey = generatePrivateKey();
    const account = privateKeyToAccount(privateKey);

    console.log('✅ Wallet generated successfully!');
    console.log(`   Address: ${account.address}`);
    console.log(`   Private Key: ${privateKey}\\n`);

    // Create .env file
    const envPath = path.join(process.cwd(), '.env');
    const envExists = fs.existsSync(envPath);

    if (envExists) {
        console.log('⚠️  .env file already exists');
        console.log('   Backing up to .env.backup...');
        fs.copyFileSync(envPath, path.join(process.cwd(), '.env.backup'));
    }

    const envContent = `# Story.build Wallet Configuration
# Generated: ${new Date().toISOString()}

# Wallet Credentials
WALLET_PRIVATE_KEY=${privateKey.slice(2)} # Remove 0x prefix for Story SDK
STORY_NETWORK=aeneid

# Wallet Details (for reference)
# Address: ${account.address}
# Network: Aeneid Testnet (recommended for development)
# Generated: ${new Date().toISOString()}

# Optional: Pinata for IPFS uploads (required for IP registration)
# PINATA_JWT=your_pinata_jwt_token_here

# Security Warning: Never share your private key or commit this file!
`;

    fs.writeFileSync(envPath, envContent);
    console.log('📄 .env file created with wallet configuration\\n');

    // Next steps
    console.log('🎯 Next Steps:');
    console.log('   1. Fund your wallet with testnet ETH');
    console.log('   2. Join Story Protocol Discord for faucet access');
    console.log('   3. Request ETH in #faucet channel');
    console.log(`   4. Your address: ${account.address}`);
    console.log('   5. Run: npm run wallet:check\\n');

    console.log('📚 Commands:');
    console.log('   npm run wallet:check    # Check wallet balance');
    console.log('   npm run test:wallet     # Test wallet operations');
    console.log('   npm run dev             # Start MCP server\\n');

    console.log('🌟 Wallet ready for Story Protocol! 🌟');
}

if (require.main === module) {
    generateWallet();
}

export { generateWallet };