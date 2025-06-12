// Wallet Tools
import { GetWalletInfoTool } from "./wallet/get_wallet_info_tool";
import { GetAccountBalancesTool } from "./wallet/get_account_balances_tool";
import { SendETHTool } from "./wallet/send_eth_tool";
import { SendTokenTool } from "./wallet/send_token_tool";
import { ApproveTokenTool } from "./wallet/approve_token_tool";
import { CheckAllowanceTool } from "./wallet/check_allowance_tool";
import { GetTokenInfoTool } from "./wallet/get_token_info_tool";
import { GetTransactionHistoryTool } from "./wallet/get_transaction_history_tool";
import { ValidateAddressTool } from "./wallet/validate_address_tool";
import { WrapIPTool } from "./wallet/wrap_ip_tool";
import { UnwrapWIPTool } from "./wallet/unwrap_wip_tool";

// IP & License Tools (Phase 1)
import { RegisterIPTool } from "./ip/register_ip_tool";
import { GetIPInfoTool } from "./ip/get_ip_info_tool";
import { CreateLicenseTermsTool } from "./license/create_license_terms_tool";
import { AttachLicenseTool } from "./license/attach_license_tool";
import { MintLicenseTool } from "./license/mint_license_tool";

// TODO: Derivative & Revenue Tools (to be implemented in Phase 2)
// import { RegisterDerivativeTool } from "./derivative/register_derivative_tool";
// import { PayRoyaltyTool } from "./revenue/pay_royalty_tool";
// import { ClaimRevenueTool } from "./revenue/claim_revenue_tool";

// TODO: Platform Generation Tools (to be implemented in Phase 3)
// import { GenerateWebappProjectTool } from "./webapp/generate_webapp_project_tool";

export const StoryMcpTools = { 
    
    // Basic wallet information and account management
    "GetWalletInfoTool": GetWalletInfoTool,                    // Get wallet address, balance, network info
    "GetAccountBalancesTool": GetAccountBalancesTool,          // Get ETH, WIP, IP token balances
    "ValidateAddressTool": ValidateAddressTool,                // Validate Ethereum addresses
    "GetTransactionHistoryTool": GetTransactionHistoryTool,    // View recent transaction history
    
    // Token and ETH operations
    "SendETHTool": SendETHTool,                                // Send ETH for gas fees
    "SendTokenTool": SendTokenTool,                            // Send WIP, IP, or other tokens
    
    // EVM-specific token operations
    "ApproveTokenTool": ApproveTokenTool,                      // Approve tokens for Story Protocol contracts
    "CheckAllowanceTool": CheckAllowanceTool,                  // Check token allowances for contracts
    "GetTokenInfoTool": GetTokenInfoTool,                      // Get comprehensive ERC20 token information
    
    // Story Protocol token operations
    "WrapIPTool": WrapIPTool,                                  // Wrap IP tokens to WIP (like WETH)
    "UnwrapWIPTool": UnwrapWIPTool,                            // Unwrap WIP tokens back to IP

    // ========================================
    // PHASE 1: CORE IP OPERATIONS (✅ COMPLETE)
    // ========================================
    
    // IP Registration & Management
    "RegisterIPTool": RegisterIPTool,                       // ✅ Register IP from URLs or metadata
    "GetIPInfoTool": GetIPInfoTool,                         // ✅ Get IP asset details and metadata
    // "MintAndRegisterIPTool": MintAndRegisterIPTool,         // Mint NFT + register IP in one tx
    // "BatchRegisterTool": BatchRegisterTool,                 // Register multiple IP assets
    
    // License Terms & Management  
    "CreateLicenseTermsTool": CreateLicenseTermsTool,       // ✅ AI-powered license term creation
    "AttachLicenseTool": AttachLicenseTool,                 // ✅ Attach license terms to IP
    // "GetLicenseTermsTool": GetLicenseTermsTool,             // View available license terms
    
    // License Token Operations
    "MintLicenseTool": MintLicenseTool,                     // ✅ Mint license tokens for purchase
    // "BuyLicenseTool": BuyLicenseTool,                       // Purchase license token for derivatives
    // "TransferLicenseTool": TransferLicenseTool,             // Transfer license tokens

    // ========================================
    // PHASE 2: ADVANCED FEATURES (🚧 TO DO)
    // ========================================
    
    // Derivative Work Management
    // "RegisterDerivativeTool": RegisterDerivativeTool,       // Register derivative content
    // "GetDerivativesTool": GetDerivativesTool,               // Find all derivative works
    // "GetIPFamilyTool": GetIPFamilyTool,                     // View complete IP family tree
    
    // Revenue & Royalties
    // "PayRoyaltyTool": PayRoyaltyTool,                       // Pay royalties to IP owners
    // "ClaimRevenueTool": ClaimRevenueTool,                   // Claim accumulated revenue
    // "GetRevenueInfoTool": GetRevenueInfoTool,               // Check revenue and earnings

    // ========================================
    // PHASE 3: PLATFORM GENERATION (🚧 TO DO)
    // ========================================
    
    // Platform Generation
    // "GenerateMarketplaceTool": GenerateMarketplaceTool,     // AI-powered marketplace creation
    // "GeneratePortfolioTool": GeneratePortfolioTool,         // Generate artist portfolio sites
    // "GenerateWebappProjectTool": GenerateWebappProjectTool, // Generate complete licensing platforms
};

// Helper function to get available tools by phase
export const getToolsByPhase = (phase: 'wallet' | 'core' | 'advanced' | 'platform') => {
    const toolEntries = Object.entries(StoryMcpTools);
    
    switch (phase) {
        case 'wallet':
            return toolEntries.filter(([name]) => 
                name.includes('Wallet') || 
                name.includes('Account') || 
                name.includes('Send') || 
                name.includes('Approve') || 
                name.includes('Transaction') ||
                name.includes('Validate')
            );
        case 'core':
            return toolEntries.filter(([name]) => 
                name.includes('IP') || 
                name.includes('License') || 
                name.includes('Register')
            );
        case 'advanced':
            return toolEntries.filter(([name]) => 
                name.includes('Derivative') || 
                name.includes('Revenue') || 
                name.includes('Royalty')
            );
        case 'platform':
            return toolEntries.filter(([name]) => 
                name.includes('Generate') || 
                name.includes('Marketplace') || 
                name.includes('Portfolio')
            );
        default:
            return toolEntries;
    }
};

// Get count of implemented tools
export const getImplementationStatus = () => {
const allTools = Object.keys(StoryMcpTools);
const implementedTools = allTools.filter(toolName => StoryMcpTools[toolName as keyof typeof StoryMcpTools]);

return {
total_defined: allTools.length,
implemented: implementedTools.length,
completion_percentage: Math.round((implementedTools.length / allTools.length) * 100),
phases: {
wallet: getToolsByPhase('wallet').length,
core: getToolsByPhase('core').length,
advanced: getToolsByPhase('advanced').length,
platform: getToolsByPhase('platform').length
}
};
};