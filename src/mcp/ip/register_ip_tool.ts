import { z } from "zod";
import { StoryAgent } from "../../agent";
import { type McpTool } from "../../types";
import { parseContentUrl, generateIPMetadataFromContent, validateUrl } from "../../utils";
import { createHash } from 'crypto';
import { Address, toHex } from 'viem';
import { createCommercialRemixTerms } from "../../utils/license-terms"


export const RegisterIPTool: McpTool = {
    name: "story_register_ip",
    description: "Register IP from URLs or metadata with automatic content parsing and IPFS upload",
    schema: {
        content_url: z.string()
            .optional()
            .describe("URL to content (Instagram, Twitter, ArtStation, Behance, YouTube, or direct image URL)"),
        title: z.string()
            .optional()
            .describe("Title of the IP asset (auto-extracted from URL if not provided)"),
        description: z.string()
            .optional()
            .describe("Description of the IP asset (auto-extracted from URL if not provided)"),
        image_url: z.string()
            .optional()
            .describe("Direct image URL if not using content_url"),
        media_url: z.string()
            .optional()
            .describe("Direct media URL (video, audio) if not using content_url"),
        creator_name: z.string()
            .optional()
            .describe("Name of the creator (defaults to wallet address)"),
        attributes: z.array(z.object({
            trait_type: z.string(),
            value: z.string()
        }))
            .optional()
            .describe("Additional attributes for the IP asset"),
        commercial_use: z.boolean()
            .default(true)
            .describe("Allow commercial use of this IP"),
        derivatives_allowed: z.boolean()
            .default(true)
            .describe("Allow derivative works"),
        commercial_rev_share: z.number()
            .min(0)
            .max(100)
            .default(5)
            .describe("Commercial revenue share percentage for derivatives (0-100)"),
        minting_fee: z.number()
            .min(0)
            .default(1)
            .describe("License minting fee in WIP tokens")
    },
    handler: async (agent: StoryAgent, input: Record<string, any>) => {
        try {
            await agent.connect();

            let contentData;
            let finalTitle = input.title;
            let finalDescription = input.description;
            let finalImageUrl = input.image_url;
            let finalMediaUrl = input.media_url;
            let finalAttributes = input.attributes || [];

            // Parse content URL if provided
            if (input.content_url) {
                if (!validateUrl(input.content_url)) {
                    throw new Error('Invalid URL format');
                }

                console.error(`🔍 Parsing content from URL: ${input.content_url}`);
                contentData = await parseContentUrl(input.content_url);

                // Use parsed data as defaults if not explicitly provided
                finalTitle = finalTitle || contentData.title;
                finalDescription = finalDescription || contentData.description;
                finalImageUrl = finalImageUrl || contentData.imageUrl;
                finalMediaUrl = finalMediaUrl || contentData.mediaUrl;

                // Merge attributes
                if (contentData.attributes) {
                    finalAttributes = [...finalAttributes, ...contentData.attributes];
                }
            }

            // Validate required fields
            if (!finalTitle) {
                throw new Error('Title is required (provide title or content_url)');
            }
            if (!finalDescription) {
                throw new Error('Description is required (provide description or content_url)');
            }

            // Generate metadata and upload to IPFS
            console.error(`📝 Generating metadata for IP: ${finalTitle}`);

            const { ipMetadata, nftMetadata, ipfsHashes } = await generateIPMetadataFromContent(
                {
                    title: finalTitle,
                    description: finalDescription,
                    imageUrl: finalImageUrl,
                    mediaUrl: finalMediaUrl,
                    mediaType: contentData?.mediaType,
                    creator: input.creator_name,
                    platform: contentData?.platform || 'Direct Upload',
                    originalUrl: input.content_url || '',
                    attributes: finalAttributes
                },
                agent.account.address
            );

            // Generate content hashes
            const ipHash = createHash('sha256').update(JSON.stringify(ipMetadata)).digest('hex');
            const nftHash = createHash('sha256').update(JSON.stringify(nftMetadata)).digest('hex');

            console.error("nft metadata :", nftMetadata)

            console.error(`📤 Uploading metadata to IPFS...`);
            console.error(`📁 IP Metadata IPFS: ${ipfsHashes.ipMetadataHash}`);
            console.error(`📁 NFT Metadata IPFS: ${ipfsHashes.nftMetadataHash}`);

            // Prepare license terms if requested
            console.error(`📜 Creating license terms...`);
            const licenseTermsData = {
                terms: createCommercialRemixTerms({
                    defaultMintingFee: input.minting_fee,
                    commercialRevShare: input.commercial_rev_share
                })
            };

            // Register IP with Story Protocol
            console.error(`🎨 Registering IP with Story Protocol...`);

            const spgNftContract = agent.networkInfo.defaultSPGNFTContractAddress;
            if (!spgNftContract) {
                throw new Error('SPG NFT contract not configured for this network');
            }

            const response = await agent.client.ipAsset.mintAndRegisterIpAssetWithPilTerms({
                spgNftContract: spgNftContract,
                licenseTermsData: [
                    licenseTermsData
                ],
                ipMetadata: {
                    ipMetadataURI: `https://ipfs.io/ipfs/${ipfsHashes.ipMetadataHash}`,
                    ipMetadataHash: `0x${ipHash}`,
                    nftMetadataURI: `https://ipfs.io/ipfs/${ipfsHashes.nftMetadataHash}`,
                    nftMetadataHash: `0x${nftHash}`,
                }
            })

            console.error(`✅ IP registered successfully: ${response.ipId}`);

            return {
                status: "success",
                message: `✅ Successfully registered IP: ${finalTitle}`,
                ip_details: {
                    ip_id: response.ipId,
                    token_id: `${response.tokenId}`,
                    title: finalTitle,
                    description: finalDescription,
                    creator: input.creator_name || 'IP Creator',
                    creator_address: agent.account.address
                },
                transaction_info: {
                    tx_hash: response.txHash,
                    explorer_url: `${agent.networkInfo.protocolExplorer}/ipa/${response.ipId}`,
                    block_explorer: `${agent.networkInfo.blockExplorer}/tx/${response.txHash}`
                },
                metadata: {
                    ip_metadata_uri: `https://ipfs.io/ipfs/${ipfsHashes.ipMetadataHash}`,
                    nft_metadata_uri: `https://ipfs.io/ipfs/${ipfsHashes.nftMetadataHash}`,
                    // image_ipfs: ipfsHashes.imageHash ? `https://ipfs.io/ipfs/${ipfsHashes.imageHash}` : null,
                    // media_ipfs: ipfsHashes.mediaHash ? `https://ipfs.io/ipfs/${ipfsHashes.mediaHash}` : null
                },
                license_info: {
                    attached: true,
                    license_terms_ids: response.licenseTermsIds?.map(id => `${id}`),
                    commercial_use: input.commercial_use,
                    derivatives_allowed: input.derivatives_allowed,
                    commercial_rev_share: `${input.commercial_rev_share}%`,
                    minting_fee: `${input.minting_fee} WIP`
                },
                content_source: {
                    original_url: input.content_url,
                    platform: contentData?.platform || 'Direct Upload',
                    parsed_automatically: !!input.content_url
                },
                next_steps: [
                    "✅ IP asset registered and ready for licensing",
                    "🎫 License terms attached - ready to mint license tokens",
                    "🔗 Share your IP with the explorer URL above",
                    "💰 Start earning from derivatives and licensing"
                ]
            };

        } catch (error: any) {
            console.error('❌ Failed to register IP:', error);
            throw new Error(`Failed to register IP: ${error.message}`);
        } finally {
            await agent.disconnect();
        }
    }
};