import { z } from "zod";
import { StoryAgent } from "../../agent";
import { type McpTool } from "../../types";
import { Address, parseEther } from 'viem';
import { WIP_TOKEN_ADDRESS } from "@story-protocol/core-sdk";

export const MintLicenseTool: McpTool = {
    name: "story_mint_license",
    description: "Mint license tokens from an IP asset with attached license terms",
    schema: {
        licensor_ip_id: z.string()
            .regex(/^0x[0-9a-fA-F]{40}$/)
            .describe("IP asset ID that will issue the license tokens"),
        license_terms_id: z.string()
            .describe("License terms ID to mint tokens from (must be attached to the IP)"),
        amount: z.number()
            .int()
            .min(1)
            .default(1)
            .describe("Number of license tokens to mint"),
        receiver: z.string()
            .regex(/^0x[0-9a-fA-F]{40}$/)
            .optional()
            .describe("Address to receive the license tokens (defaults to your wallet)"),
        max_minting_fee: z.number()
            .min(0)
            .optional()
            .describe("Maximum minting fee willing to pay in WIP tokens (for slippage protection)"),
        max_revenue_share: z.number()
            .min(0)
            .max(100)
            .default(100)
            .describe("Maximum revenue share percentage willing to accept (0-100)")
    },
    handler: async (agent: StoryAgent, input: Record<string, any>) => {
        try {
            await agent.connect();

            const licensorIpId = input.licensor_ip_id as Address;
            const licenseTermsId = input.license_terms_id;
            const amount = input.amount;
            const receiver = (input.receiver || agent.account.address) as Address;

            console.error(`🎫 Minting ${amount} license token(s) from IP ${licensorIpId}...`);

            // Verify IP exists and has license terms attached
            // console.log(`🔍 Verifying IP asset and license terms...`);
            // const ipAsset = await agent.client.ipAsset.getIpAsset({ ipId: licensorIpId });
            // if (!ipAsset) {
            //     throw new Error(`IP asset not found: ${licensorIpId}`);
            // }

            // Get attached license terms
            // const attachedTerms = await agent.client.license.getAttachedLicenseTerms({ ipId: licensorIpId });
            // const targetTerms = attachedTerms.find((terms: any) => terms.licenseTermsId === licenseTermsId);

            // if (!targetTerms) {
            //     throw new Error(`License terms ${licenseTermsId} not attached to IP ${licensorIpId}. Available terms: ${attachedTerms.map((t: any) => t.licenseTermsId).join(', ')}`);
            // }

            // Get detailed license terms info
            console.error(`📜 Fetching license terms details...`);
            const licenseConfig = await agent.client.license.getLicensingConfig({
                ipId: licensorIpId,
                licenseTermsId
            });
            const { terms } = await agent.client.license.getLicenseTerms(licenseTermsId)
            const licenseTermsInfo = terms

            // Calculate minting fee
            const mintingFeePerToken = licenseConfig.mintingFee;
            const totalMintingFee = mintingFeePerToken * BigInt(amount);
            const mintingFeeInWIP = Number(totalMintingFee) / 1e18;

            // Check if user has sufficient WIP balance for minting fees
            if (mintingFeePerToken > 0) {
                console.error(`💰 Checking WIP balance for minting fee...`);
                try {
                    const wipBalance = await agent.publicClient.readContract({
                        address: WIP_TOKEN_ADDRESS, // WIP token
                        abi: [
                            {
                                name: 'balanceOf',
                                type: 'function',
                                stateMutability: 'view',
                                inputs: [{ name: 'account', type: 'address' }],
                                outputs: [{ name: '', type: 'uint256' }],
                            }
                        ],
                        functionName: 'balanceOf',
                        args: [agent.account.address]
                    });

                    const wipBalanceInTokens = Number(wipBalance) / 1e18;

                    if (wipBalanceInTokens < mintingFeeInWIP) {
                        throw new Error(`Insufficient WIP balance. Required: ${mintingFeeInWIP} WIP, Available: ${wipBalanceInTokens} WIP`);
                    }

                    console.error(`✅ Sufficient WIP balance: ${wipBalanceInTokens} WIP (need ${mintingFeeInWIP} WIP)`);
                } catch (error) {
                    console.error(`⚠️ Could not verify WIP balance: ${error}`);
                }
            }

            // Set max minting fee if not provided
            const maxMintingFee = input.max_minting_fee !== undefined
                ? parseEther(input.max_minting_fee.toString())
                : totalMintingFee + (totalMintingFee / BigInt(10)); // 10% slippage protection

            // Mint license tokens
            console.error(`🔨 Minting license tokens...`);
            console.error(`   Amount: ${amount} tokens`);
            console.error(`   Receiver: ${receiver}`);
            console.error(`   Minting fee: ${mintingFeeInWIP} WIP`);

            const response = await agent.client.license.mintLicenseTokens({
                licenseTermsId,
                licensorIpId,
                amount,
                receiver,
                maxMintingFee,
                maxRevenueShare: input.max_revenue_share
            });

            console.error(`✅ License tokens minted successfully!`);

            // Determine license type description
            let licenseDescription = "Custom License";
            if (licenseTermsId === "1") {
                licenseDescription = "Non-Commercial Social Remixing";
            } else if (licenseTermsId === "2") {
                licenseDescription = "Commercial Use";
            } else if (licenseTermsId === "3") {
                licenseDescription = "Commercial Remix";
            }

            return {
                status: "success",
                message: `✅ Successfully minted ${amount} license token(s)`,
                minting_info: {
                    license_token_ids: response.licenseTokenIds?.map(id => `${id}`),
                    amount_minted: amount,
                    receiver: receiver,
                    licensor_ip_id: licensorIpId,
                    license_terms_id: licenseTermsId,
                    license_description: licenseDescription
                },
                transaction_info: {
                    tx_hash: response.txHash,
                    block_explorer: `${agent.networkInfo.blockExplorer}/tx/${response.txHash}`,
                    ip_explorer: `${agent.networkInfo.protocolExplorer}/ipa/${licensorIpId}`
                },
                cost_breakdown: {
                    minting_fee_per_token: `${Number(mintingFeePerToken) / 1e18} WIP`,
                    total_minting_fee: `${mintingFeeInWIP} WIP`,
                    gas_fee: "Paid in IP (see transaction)",
                    total_cost: mintingFeeInWIP > 0 ? `${mintingFeeInWIP} WIP + gas` : "Only gas fees"
                },
                license_terms_summary: {
                    commercial_use: licenseTermsInfo.commercialUse,
                    derivatives_allowed: licenseTermsInfo.derivativesAllowed,
                    commercial_attribution: licenseTermsInfo.commercialAttribution,
                    derivatives_attribution: licenseTermsInfo.derivativesAttribution,
                    transferable: licenseTermsInfo.transferable,
                    revenue_share: `${licenseTermsInfo.commercialRevShare}%`,
                    expires: licenseTermsInfo.expiration > 0 ?
                        new Date(Number(licenseTermsInfo.expiration) * 1000).toISOString() : "Never"
                },
                license_token_details: response.licenseTokenIds?.map((tokenId: any, index: number) => ({
                    token_id: `${tokenId}`,
                    token_number: index + 1,
                    owner: receiver,
                    licensor_ip: licensorIpId,
                    license_terms: licenseTermsId,
                    can_transfer: licenseTermsInfo.transferable
                })),
                usage_rights: {
                    what_you_can_do: [
                        ...(licenseTermsInfo.commercialUse ? ["✅ Use for commercial purposes"] : ["❌ No commercial use allowed"]),
                        ...(licenseTermsInfo.derivativesAllowed ? ["✅ Create derivative works"] : ["❌ No derivatives allowed"]),
                        ...(licenseTermsInfo.transferable ? ["✅ Transfer license tokens"] : ["❌ Cannot transfer tokens"]),
                        "✅ Use according to license terms"
                    ],
                    obligations: [
                        ...(licenseTermsInfo.commercialAttribution ? ["📝 Provide attribution for commercial use"] : []),
                        ...(licenseTermsInfo.derivativesAttribution ? ["📝 Provide attribution for derivatives"] : []),
                        ...(licenseTermsInfo.commercialRevShare > 0 ? [`💰 Pay ${licenseTermsInfo.commercialRevShare}% revenue share`] : []),
                        "📋 Follow all license terms"
                    ]
                },
                derivative_workflow: licenseTermsInfo.derivativesAllowed ? {
                    enabled: true,
                    next_steps: [
                        "🎨 Create your derivative work",
                        "📝 Register derivative using story_register_derivative",
                        `💰 Pay ${licenseTermsInfo.commercialRevShare}% revenue share to original creator`,
                        "🚀 Start earning from your derivative"
                    ]
                } : {
                    enabled: false,
                    message: "Derivatives not allowed with this license"
                },
                revenue_model: licenseTermsInfo.commercialUse ? {
                    type: licenseTermsInfo.commercialRevShare > 0 ? "Revenue Sharing" : "One-time Fee",
                    original_creator_earns: [
                        `💰 ${mintingFeeInWIP} WIP from this license purchase`,
                        ...(licenseTermsInfo.commercialRevShare > 0 ? [`📈 ${licenseTermsInfo.commercialRevShare}% of your commercial revenue`] : [])
                    ],
                    your_obligations: licenseTermsInfo.commercialRevShare > 0 ? [
                        `💸 Pay ${licenseTermsInfo.commercialRevShare}% of commercial revenue to original creator`,
                        "📊 Track and report commercial usage"
                    ] : [
                        "✅ No ongoing revenue sharing required"
                    ]
                } : {
                    type: "Non-Commercial",
                    message: "No commercial revenue allowed"
                },
                next_steps: [
                    "✅ License tokens minted and ready to use",
                    ...(receiver !== agent.account.address ? [`📤 Tokens sent to ${receiver}`] : ["💎 Tokens received in your wallet"]),
                    ...(licenseTermsInfo.derivativesAllowed ? ["🎨 Create derivative works using these licenses"] : []),
                    ...(licenseTermsInfo.commercialUse ? ["💼 Use for commercial purposes"] : ["🎭 Use for non-commercial purposes only"]),
                    ...(licenseTermsInfo.transferable ? ["🔄 Transfer tokens to others if needed"] : [])
                ],
                pil_reference: {
                    license_id: licenseTermsId,
                    type: licenseDescription,
                    standard: "PIL (Programmable IP License)",
                    chain: agent.network
                }
            };

        } catch (error: any) {
            console.error('❌ Failed to mint license tokens:', error);
            throw new Error(`Failed to mint license tokens: ${error.message}`);
        } finally {
            await agent.disconnect();
        }
    }
};