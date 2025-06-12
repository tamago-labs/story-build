import { z } from "zod";
import { StoryAgent } from "../../agent";
import { type McpTool } from "../../types";
import { Address } from 'viem';

export const AttachLicenseTool: McpTool = {
    name: "story_attach_license",
    description: "Attach existing license terms to an IP asset to enable licensing and monetization",
    schema: {
        ip_id: z.string()
            .regex(/^0x[0-9a-fA-F]{40}$/)
            .describe("IP asset ID to attach license terms to"),
        license_terms_id: z.string()
            .describe("License terms ID to attach (from story_create_license_terms or built-in PIL flavors: 1, 2, 3)")
    },
    handler: async (agent: StoryAgent, input: Record<string, any>) => {
        try {
            await agent.connect();

            const ipId = input.ip_id as Address;
            const licenseTermsId = input.license_terms_id;

            console.error(`🔗 Attaching license terms ${licenseTermsId} to IP ${ipId}...`);

            // Verify IP exists
            // console.error(`🔍 Verifying IP asset exists...`);
            // const ipAsset = await agent.client.ipAsset.getIpAsset({ ipId });
            // if (!ipAsset) {
            //     throw new Error(`IP asset not found: ${ipId}`);
            // }

            // // Check if IP is owned by current wallet
            // if (ipAsset.owner.toLowerCase() !== agent.account.address.toLowerCase()) {
            //     throw new Error(`You don't own this IP asset. Owner: ${ipAsset.owner}, Your address: ${agent.account.address}`);
            // }

            // Get license terms info to validate
            let licenseTermsInfo: any;
            try {
                console.error(`📜 Fetching license terms ${licenseTermsId}...`);
                licenseTermsInfo = await agent.client.license.getLicenseTerms(licenseTermsId);
            } catch (error) {
                throw new Error(`Invalid license terms ID: ${licenseTermsId}. Make sure it exists.`);
            }


            // Attach license terms
            console.error(`🔗 Attaching license terms to IP asset...`);
            const response = await agent.client.license.attachLicenseTerms({
                ipId,
                licenseTermsId
            });

            // Get attached license terms to show current state
            // console.error(`📋 Fetching updated license terms...`);
            // const attachedTerms = await agent.client.license.getLicensingConfig({
            //     ipId,
            //     licenseTermsId
            // });

            // console.error(`✅ License terms attached successfully!`);

            // Determine license type description
            let licenseDescription = "Custom License Terms";
            if (licenseTermsId === "1") {
                licenseDescription = "Non-Commercial Social Remixing (PIL Flavor #1)";
            } else if (licenseTermsId === "2") {
                licenseDescription = "Commercial Use (PIL Flavor #2)";
            } else if (licenseTermsId === "3") {
                licenseDescription = "Commercial Remix (PIL Flavor #3)";
            }

            return {
                status: "success",
                message: `✅ Successfully attached license terms to IP asset`,
                attachment_info: {
                    ip_id: ipId,
                    license_terms_id: licenseTermsId,
                    license_description: licenseDescription,
                    attached_at: new Date().toISOString(),
                    attached_by: agent.account.address
                },
                transaction_info: {
                    tx_hash: response.txHash,
                    block_explorer: `${agent.networkInfo.blockExplorer}/tx/${response.txHash}`,
                    explorer_url: `${agent.networkInfo.protocolExplorer}/ipa/${ipId}`
                },
                license_terms_details: {
                    commercial_use: licenseTermsInfo.commercialUse,
                    derivatives_allowed: licenseTermsInfo.derivativesAllowed,
                    commercial_attribution: licenseTermsInfo.commercialAttribution,
                    derivatives_attribution: licenseTermsInfo.derivativesAttribution,
                    derivatives_approval: licenseTermsInfo.derivativesApproval,
                    derivatives_reciprocal: licenseTermsInfo.derivativesReciprocal,
                    transferable: licenseTermsInfo.transferable,
                    minting_fee: `${Number(licenseTermsInfo.mintingFee) / 1e18} WIP`,
                    commercial_rev_share: `${licenseTermsInfo.commercialRevShare}%`,
                    currency: licenseTermsInfo.currency || "WIP Token",
                    expires: licenseTermsInfo.expiration > 0 ? new Date(Number(licenseTermsInfo.expiration) * 1000).toISOString() : "Never"
                },
                monetization_info: {
                    revenue_model: licenseTermsInfo.commercialUse ?
                        (licenseTermsInfo.commercialRevShare > 0 ? "Fee + Revenue Share" : "Fee Only") :
                        "Non-Commercial",
                    earnings_potential: licenseTermsInfo.commercialUse ?
                        `${Number(licenseTermsInfo.mintingFee) / 1e18} WIP per license + ${licenseTermsInfo.commercialRevShare}% of derivative revenue` :
                        "Non-commercial use only",
                    license_token_price: `${Number(licenseTermsInfo.mintingFee) / 1e18} WIP`
                },
                pil_flavors_reference: {
                    "1": "Non-Commercial Social Remixing - Free derivatives, no commercial use",
                    "2": "Commercial Use - Commercial allowed, no derivatives",
                    "3": "Commercial Remix - Commercial + derivatives with revenue sharing",
                    [licenseTermsId]: licenseTermsId === "1" || licenseTermsId === "2" || licenseTermsId === "3" ?
                        "Built-in PIL Flavor" : "Your Custom License Terms"
                },
                next_steps: [
                    "✅ License terms attached - IP is now licensable",
                    "🎫 Mint license tokens using story_mint_license",
                    "💰 Start earning from license sales and derivative revenue",
                    "🔗 Share your licensable IP with the explorer URL",
                    licenseTermsInfo.derivativesAllowed ? "🎨 Others can now create derivatives" : "⚠️ Derivatives not allowed with these terms",
                    licenseTermsInfo.commercialRevShare > 0 ? "📈 You'll earn revenue share from all derivatives" : ""
                ].filter(Boolean),
                usage_examples: [
                    `🎫 Mint licenses: story_mint_license with ip_id: ${ipId}`,
                    `📊 Check IP status: story_get_ip_info with ip_id: ${ipId}`,
                    `🔍 View on explorer: ${agent.networkInfo.protocolExplorer}/ipa/${ipId}`
                ]
            };

        } catch (error: any) {
            console.error('❌ Failed to attach license terms:', error);
            throw new Error(`Failed to attach license terms: ${error.message}`);
        } finally {
            await agent.disconnect();
        }
    }
};