# Story.build

![NPM Version](https://img.shields.io/npm/v/story-build)

**Story.build** is an AI MCP toolkit that lets anyone manage IP projects on Story Protocol with ease, letting AI handle IP registration, license creation, purchase flows, and full web app generation. The entire process is streamlined and completed in minutes.

- [NPM Registry](https://www.npmjs.com/package/story-build)
- [Documentation](https://github.com/tamago-labs/story-build)

## Overview

Traditional IP registration and licensing involves expensive legal processes, complex paperwork, and months of negotiation. Existing platforms often lack transparency, have high barriers to entry, and provide limited monetization options for creators.

**Model Context Protocol (MCP)** revolutionizes this by enabling natural language interaction with complex IP operations. Story.build leverages MCP to make IP protection and monetization as simple as having a conversation, while maintaining professional-grade legal frameworks through Story Protocol's programmable IP licensing system.

**Story.build** is a toolkit that acts as an interface between AI and **Story Protocol**, enabling the creation of a transparent IP value chain where creators get paid every time their work is built upon:

### **🎨 1. Original IP Creation**
```
Register artwork → Attach license terms → Ready for licensing
```

### **🎫 2. License Token Purchase (for Derivatives)**
```
Want to create remix → Buy license token → Pay licensing fee → Get permission
```

### **🔗 3. Derivative Work Creation**
```
Register remix as derivative → Link to original → Automatic royalty sharing
```

### **💰 4. Revenue Flow**
```
Derivative earns money → Original creator gets royalty → Claim revenue
```

**Example:** Artist registers song → Someone buys license for $100 + 10% royalty → Creates remix → Original artist automatically gets 10% of remix earnings!

Please note that the project is under development. Check out the video demo to see the current progress or refer to the following section for more details.

## Key Features

We have 15+ MCP tools allow you to use AI for wallet operations, check balances, wrap and unwrap IP tokens, and manage IP projects as follows:

### **IP Asset Management**
- **IP asset registration** from URLs and metadata with automatic content parsing
- **Social media URL parsing** (Instagram, Twitter, ArtStation, Behance, YouTube)
- **IPFS upload integration** for decentralized content storage via Pinata

### **License Management**
- **License term creation** that lets AI write it for you
- **License term attachment** to IP assets for monetization
- **License token minting** for direct sales and derivative permissions

### 🏗️ **AI-Powered App Generation**
- **Complete showcase platforms** - Let AI generate complete Next.js applications from your IP asset data
- **Revenue analytics dashboards** That have revenue analytics dashboards tailored for creators
- **One-click deployment** to Vercel, Netlify, or custom hosting

## Using with Claude Desktop

1. **Install Claude Desktop** if you haven't already
2. **Open Claude Desktop settings**
3. **Add to Claude Desktop:**
   ```json
   {
     "mcpServers": {
       "story-build": {
         "command": "npx",
         "args": [
           "-y",
           "story-build",
           "--wallet_private_key=YOUR_PRIVATE_KEY", 
           "--story_network=aeneid"
         ],
         "disabled": false
       }
     }
   }
   ```

## Use Cases

### 1. **Complete IP Licensing Workflow**
Transform your creative work into a revenue-generating IP asset:

- **Register original content** with AI-generated license terms
- **Manage license token sales** for derivative work permissions  
- **Automate royalty collection** from all derivative works
- **Track revenue flows** across the entire IP family tree

*Example:*
```
"Register my digital art from this URL: https://images.unsplash.com/photo-1578321272176-b7bbc0679853 with commercial licensing: $500 upfront + 15% ongoing royalty for any remixes"
```

### 2. **Music & Audio Licensing**
Enable transparent music derivative ecosystems:

- **Register original tracks** with sync and remix licensing
- **Sell remix rights** through license token marketplace
- **Automate royalty splits** between original and derivative creators
- **Track all derivative works** and their earnings

*Example:*
```
"Register my beat from SoundCloud: https://soundcloud.com/example-artist/sample-track and create remix licensing: $100 for non-exclusive rights + 10% royalty"
```

### 3. **Visual Art & Design Networks**
Create interconnected creative communities:

- **Register artwork** with modification and commercial rights
- **Enable fan art ecosystems** with automatic attribution
- **Monetize derivative collections** with transparent revenue sharing
- **Build IP families** showing creative evolution

*Example:*
```
"Register my character design from Behance: https://www.behance.net/gallery/example-character and create fan art licensing: $50 for personal use, $200 commercial + 5% of sales"
```

### 4. **Professional Licensing Platforms**
Generate complete licensing ecosystems with simple prompts:

- **Professional showcase platforms** from natural language descriptions
- **Custom licensing interfaces** with Story Protocol integration
- **Automated wallet connectivity** and payment processing
- **Real-time revenue dashboards** and analytics

*Example:*
```
"Register my photography portfolio from Behance: https://www.behance.net/gallery/nature-photography and generate a licensing platform with instant downloads and tiered pricing"
```

## Available Tools

### 🔐 **Wallet & Token Operations**
| Tool Name | Description | Example Usage |
|-----------|-------------|---------------|
| `story_get_wallet_info` | Get wallet address and account info | "What's my wallet address and balance?" |
| `story_get_account_balances` | Get ETH, WIP, and IP token balances | "Show all my token holdings" |
| `story_send_native_ip` | Send native IP tokens | "Send 0.1 IP to address 0x..." |
| `story_send_token` | Send WIP or other tokens | "Send 100 WIP tokens to address 0x..." |
| `story_approve_token` | Approve tokens for Story Protocol | "Approve WIP tokens for licensing operations" |
| `story_check_allowance` | Check token allowances for contracts | "Check WIP allowance for Story Protocol contract" |
| `story_get_token_info` | Get comprehensive ERC20 token info | "Get details about WIP token" |
| `story_get_transaction_history` | View recent transaction history | "Show my recent transactions" |
| `story_validate_address` | Validate Ethereum addresses | "Is this a valid address: 0x..." |
| `story_wrap_ip` | Wrap IP tokens to WIP | "Wrap 100 IP tokens to WIP for licensing" |
| `story_unwrap_wip` | Unwrap WIP tokens back to IP | "Unwrap 50 WIP tokens back to IP" |

### 🎨 **IP Asset Management**
| Tool Name | Description | Example Usage |
|-----------|-------------|---------------|
| `story_register_ip` | Register IP from URLs or metadata | "Register my artwork: https://artstation.com/artwork/abc123" |
| `story_get_ip_info` | Get IP asset details and metadata | "Show details of my registered IP asset" |

### 📜 **License Management**
| Tool Name | Description | Example Usage |
|-----------|-------------|---------------|
| `story_create_license_terms` | AI-powered license term creation | "Create commercial license: $500 upfront + 10% royalty for remixes" |
| `story_attach_license` | Attach license terms to IP | "Attach my commercial license terms to this artwork" |
| `story_mint_license` | Mint license tokens for purchase | "Create 100 commercial licenses for my photo" |

### 🏗️ **Platform Generation**
| Tool Name | Description | Example Usage |
|-----------|-------------|---------------|
| `story_generate_showcase_platform` | Generate complete IP showcase platform | "Create a platform for my art portfolio with licensing and analytics" |

## Complete Workflow Examples

### 1. **From Artwork to Licensed Platform**

```
1. "Register my digital painting from this Instagram post: https://instagram.com/p/abc123"
   → Automatically extracts metadata, uploads to IPFS, registers IP asset

2. "Create licensing terms: $200 for commercial use, $50 for personal, 15% royalty on derivatives"
   → AI generates proper PIL license terms with specified conditions

3. "Attach these license terms to my painting and create 1000 license tokens"
   → Makes the IP asset available for licensing with token-based purchasing

4. "Generate a professional showcase platform called 'My Art Studio' with dark theme"
   → Creates complete Next.js platform with licensing interface, analytics, and deployment ready
```

### 2. **Music Producer Licensing Flow**

```
1. "Register my beat from SoundCloud: https://soundcloud.com/producer/new-beat"
   → Registers audio IP with metadata from SoundCloud

2. "Create exclusive license for $500 and non-exclusive for $100, both allow commercial use"
   → Sets up tiered licensing structure for different use cases

3. "Generate a beat marketplace platform with audio previews and instant purchase"
   → Creates professional platform with player integration and licensing
```

### 3. **Photography Portfolio Monetization**

```
1. "Register all photos from my Behance portfolio: https://behance.net/portfolio/nature"
   → Batch registers multiple IP assets from portfolio

2. "Create license terms: Editorial $25, commercial $100, exclusive rights $500"
   → Sets up professional photography licensing tiers

3. "Generate a photography platform with categories for nature, portraits, events"
   → Creates organized platform with filtering and licensing options
```

## Work with Local Files

When working with local files, especially when using the webapp generation tool to create complete Next.js applications on your machine, you'll need to import an additional MCP server library of `filesystem` made by the Claude team. Use with:

```json
"filesystem": {
  "command": "npx",
  "args": [
    "-y",
    "@modelcontextprotocol/server-filesystem",
    "${workspaceFolder}"
  ],
  "disabled": false
}
```

`workspaceFolder` refers to your working directory. You can provide more than one argument. Subfolders or specific files can then be referenced in your AI prompt.

If you're using Linux and encounter issues during setup, please refer to the troubleshooting section.

## Troubleshooting

If you're using Ubuntu or another Linux environment with NVM, you'll need to manually configure the path. Follow these steps:

1. **Install Story.build under your current NVM-managed Node.js version:**

```bash
npm install -g story-build
```

2. **Due to how NVM installs libraries, you may need to use absolute paths in your config.** Replace the example values below with your actual username and Node version:

```json
{
  "mcpServers": {
    "story-build": {
      "command": "/home/YOUR_NAME/.nvm/versions/node/YOUR_NODE_VERSION/bin/node",
      "args": [
        "/home/YOUR_NAME/.nvm/versions/node/YOUR_NODE_VERSION/bin/story-build",
        "--wallet_private_key=YOUR_PRIVATE_KEY",
        "--story_network=aeneid"
      ]
    }
  }
}
```

3. **Restart Claude Desktop** and it should work now.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
