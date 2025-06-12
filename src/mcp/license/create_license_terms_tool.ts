import { z } from "zod";
import { StoryAgent } from "../../agent";
import { type McpTool } from "../../types";
import { createCommercialRemixTerms, createNonCommercialTerms } from "../../utils";
import { parseEther, zeroAddress } from 'viem';
import { WIP_TOKEN_ADDRESS } from '@story-protocol/core-sdk';

export const CreateLicenseTermsTool: McpTool = {
    name: "story_create_license_terms",
    description: "Create custom PIL (Programmable IP License) terms that can be reused across multiple IP assets",
    schema: {
        license_type: z.enum(['custom', 'commercial_remix', 'non_commercial', 'commercial_use'])
            .default('custom')
            .describe("Type of license to create"),
        
        // Basic licensing permissions
        commercial_use: z.boolean()
            .default(true)
            .describe("Allow commercial use of the IP"),
        derivatives_allowed: z.boolean()
            .default(true)
            .describe("Allow creation of derivative works"),
        
        // Commercial terms
        minting_fee: z.number()
            .min(0)
            .default(1)
            .describe("Fee to mint license tokens (in WIP tokens)"),
        commercial_rev_share: z.number()
            .min(0)
            .max(100)
            .default(0)
            .describe("Revenue share percentage for commercial use (0-100)"),
        commercial_rev_ceiling: z.number()
            .min(0)
            .default(5)
            .describe("Maximum revenue amount subject to sharing (0 = unlimited)"),
        
        // Attribution requirements
        commercial_attribution: z.boolean()
            .default(true)
            .describe("Require attribution for commercial use"),
        derivatives_attribution: z.boolean()
            .default(true)
            .describe("Require attribution for derivatives"),
        
        // Approval requirements
        derivatives_approval: z.boolean()
            .default(false)
            .describe("Require approval before creating derivatives"),
        derivatives_reciprocal: z.boolean()
            .default(true)
            .describe("Derivatives must use same license terms"),
        
        // Advanced settings
        transferable: z.boolean()
            .default(true)
            .describe("License tokens can be transferred"),
        expiration: z.number()
            .min(0)
            .default(0)
            .describe("License expiration timestamp (0 = never expires)"),
        
        // Custom URI for license terms
        terms_uri: z.string()
            .url()
            .optional()
            .describe("URI pointing to human-readable license terms"),
        
        // AI-powered natural language input
        description: z.string()
            .optional()
            .describe("Natural language description of license terms (AI will parse this)")
    },
    handler: async (agent: StoryAgent, input: Record<string, any>) => {
        try {
            await agent.connect();

            let licenseTerms: any;
            let licenseType = input.license_type;
            let description = "Custom license terms";

            // Handle predefined license types
            if (licenseType === 'commercial_remix') {
                console.error(`📜 Creating Commercial Remix license terms...`);
                licenseTerms = createCommercialRemixTerms({
                    defaultMintingFee: input.minting_fee || 1,
                    commercialRevShare: input.commercial_rev_share || 5
                });
                description = `Commercial Remix (${input.minting_fee || 1} WIP fee, ${input.commercial_rev_share || 5}% revenue share)`;
                
            } else if (licenseType === 'non_commercial') {
                console.error(`📜 Creating Non-Commercial Social Remixing license terms...`);
                licenseTerms = createNonCommercialTerms();
                description = "Non-Commercial Social Remixing";
                
            } else if (licenseType === 'commercial_use') {
                console.error(`📜 Creating Commercial Use (No Derivatives) license terms...`);
                licenseTerms = {
                    transferable: input.transferable,
                    royaltyPolicy: input.commercial_rev_share > 0 ? "0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E" : zeroAddress,
                    defaultMintingFee: parseEther(input.minting_fee.toString()),
                    expiration: BigInt(input.expiration),
                    commercialUse: true,
                    commercialAttribution: input.commercial_attribution,
                    commercializerChecker: zeroAddress,
                    commercializerCheckerData: '0x',
                    commercialRevShare: input.commercial_rev_share,
                    commercialRevCeiling: BigInt(input.commercial_rev_ceiling),
                    derivativesAllowed: false, // No derivatives for this type
                    derivativesAttribution: false,
                    derivativesApproval: false,
                    derivativesReciprocal: false,
                    derivativeRevCeiling: BigInt(0),
                    currency: WIP_TOKEN_ADDRESS,
                    uri: input.terms_uri || '',
                };
                description = `Commercial Use Only (${input.minting_fee} WIP fee, ${input.commercial_rev_share}% revenue share)`;
                
            } else {
                // Custom license terms
                console.error(`📜 Creating custom license terms...`);
                
                // Parse natural language description if provided
                if (input.description) {
                    console.error(`🤖 Parsing natural language: "${input.description}"`);
                    // Simple AI parsing - could be enhanced with actual NLP
                    const desc = input.description.toLowerCase();
                    
                    // Override settings based on natural language
                    if (desc.includes('no commercial') || desc.includes('non-commercial')) {
                        input.commercial_use = false;
                    }
                    if (desc.includes('no derivatives') || desc.includes('no remixes')) {
                        input.derivatives_allowed = false;
                    }
                    if (desc.includes('free') || desc.includes('no fee')) {
                        input.minting_fee = 0;
                    }
                    
                    // Extract percentage if mentioned
                    const percentMatch = desc.match(/(\d+)%/);
                    if (percentMatch) {
                        input.commercial_rev_share = parseInt(percentMatch[1]);
                    }
                    
                    // Extract fee amount
                    const feeMatch = desc.match(/\$?(\d+(?:\.\d+)?)\s*(?:wip|dollars?|usd)/);
                    if (feeMatch) {
                        input.minting_fee = parseFloat(feeMatch[1]);
                    }
                }

                licenseTerms = {
                    transferable: input.transferable,
                    royaltyPolicy: (input.commercial_use && input.commercial_rev_share > 0) 
                        ? "0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E" 
                        : zeroAddress,
                    defaultMintingFee: parseEther(input.minting_fee.toString()),
                    expiration: BigInt(input.expiration),
                    commercialUse: input.commercial_use,
                    commercialAttribution: input.commercial_attribution,
                    commercializerChecker: zeroAddress,
                    commercializerCheckerData: '0x',
                    commercialRevShare: input.commercial_rev_share,
                    commercialRevCeiling: BigInt(input.commercial_rev_ceiling),
                    derivativesAllowed: input.derivatives_allowed,
                    derivativesAttribution: input.derivatives_attribution,
                    derivativesApproval: input.derivatives_approval,
                    derivativesReciprocal: input.derivatives_reciprocal,
                    derivativeRevCeiling: BigInt(0),
                    currency: WIP_TOKEN_ADDRESS,
                    uri: input.terms_uri || '',
                };
                
                description = input.description || `Custom License (Commercial: ${input.commercial_use}, Derivatives: ${input.derivatives_allowed})`;
            }

            // Register the license terms on Story Protocol
            console.error(`🔗 Registering license terms on Story Protocol...`);
            
            const response = await agent.client.license.registerPILTerms(licenseTerms);

            console.error(`✅ License terms created with ID: ${response.licenseTermsId}`);

            return {
                status: "success",
                message: `✅ Successfully created license terms: ${description}`,
                license_terms: {
                    license_terms_id: `${response.licenseTermsId}`,
                    description: description,
                    type: licenseType,
                    created_by: agent.account.address
                },
                transaction_info: {
                    tx_hash: response.txHash,
                    block_explorer: `${agent.networkInfo.blockExplorer}/tx/${response.txHash}`
                },
                terms_details: {
                    commercial_use: licenseTerms.commercialUse,
                    derivatives_allowed: licenseTerms.derivativesAllowed,
                    minting_fee: `${input.minting_fee} WIP`,
                    commercial_rev_share: `${licenseTerms.commercialRevShare}%`,
                    commercial_attribution: licenseTerms.commercialAttribution,
                    derivatives_attribution: licenseTerms.derivativesAttribution,
                    derivatives_approval: licenseTerms.derivativesApproval,
                    derivatives_reciprocal: licenseTerms.derivativesReciprocal,
                    transferable: licenseTerms.transferable,
                    expires: input.expiration > 0 ? new Date(input.expiration * 1000).toISOString() : "Never",
                    currency: "WIP Token"
                },
                usage_examples: [
                    `🔗 Attach to IP: story_attach_license with license_terms_id: ${response.licenseTermsId}`,
                    `🎫 Mint tokens: story_mint_license after attaching to IP`,
                    `📋 Reuse: Use license_terms_id ${response.licenseTermsId} for multiple IP assets`
                ],
                pil_flavors_info: {
                    available_flavors: [
                        "Non-Commercial Social Remixing (ID: 1) - Built-in",
                        "Commercial Use (ID: 2) - Built-in", 
                        "Commercial Remix (ID: 3) - Built-in",
                        `Custom License (ID: ${response.licenseTermsId}) - Your creation`
                    ],
                    note: "You can use built-in PIL flavor IDs (1, 2, 3) or your custom ID for attaching to IP assets"
                },
                next_steps: [
                    "✅ License terms created and ready to use",
                    "🔗 Attach these terms to IP assets using story_attach_license",
                    "📋 Save the license_terms_id for reuse across multiple IP assets",
                    "🎫 Mint license tokens after attaching to IP assets"
                ]
            };

        } catch (error: any) {
            console.error('❌ Failed to create license terms:', error);
            throw new Error(`Failed to create license terms: ${error.message}`);
        } finally {
            await agent.disconnect();
        }
    }
};