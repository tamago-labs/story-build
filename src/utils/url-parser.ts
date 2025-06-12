import axios from 'axios';
import { uploadFromUrl, uploadIPMetadata, uploadNFTMetadata } from './pinata';

/**
 * URL parsing utilities for social media and content platforms
 * Extracts metadata and media from various platforms for IP registration
 */

interface ParsedContent {
    title: string;
    description: string;
    imageUrl?: string;
    mediaUrl?: string;
    mediaType?: string;
    creator?: string;
    platform: string;
    originalUrl: string;
    attributes?: Array<{
        trait_type: string;
        value: string;
    }>;
}

/**
 * Parse Instagram post URL
 */
export const parseInstagramUrl = async (url: string): Promise<ParsedContent> => {
    try {
        console.error(`📸 Parsing Instagram URL: ${url}`);

        // Extract post ID from URL
        const match = url.match(/\/p\/([A-Za-z0-9_-]+)/);
        if (!match) {
            throw new Error('Invalid Instagram URL format');
        }

        const postId = match[1];

        // For now, return a structured format that can be enhanced with actual API calls
        return {
            title: `Instagram Post ${postId}`,
            description: `Content from Instagram post ${postId}`,
            platform: 'Instagram',
            originalUrl: url,
            attributes: [
                { trait_type: 'Platform', value: 'Instagram' },
                { trait_type: 'Post ID', value: postId },
                { trait_type: 'Content Type', value: 'Social Media Post' }
            ]
        };
    } catch (error: any) {
        throw new Error(`Failed to parse Instagram URL: ${error.message}`);
    }
};

/**
 * Parse Twitter/X post URL
 */
export const parseTwitterUrl = async (url: string): Promise<ParsedContent> => {
    try {
        console.error(`🐦 Parsing Twitter URL: ${url}`);

        // Extract username and tweet ID
        const match = url.match(/\/([^\/]+)\/status\/(\d+)/);
        if (!match) {
            throw new Error('Invalid Twitter URL format');
        }

        const [, username, tweetId] = match;

        return {
            title: `Tweet by @${username}`,
            description: `Content from Twitter post ${tweetId}`,
            creator: `@${username}`,
            platform: 'Twitter',
            originalUrl: url,
            attributes: [
                { trait_type: 'Platform', value: 'Twitter' },
                { trait_type: 'Username', value: `@${username}` },
                { trait_type: 'Tweet ID', value: tweetId },
                { trait_type: 'Content Type', value: 'Social Media Post' }
            ]
        };
    } catch (error: any) {
        throw new Error(`Failed to parse Twitter URL: ${error.message}`);
    }
};

/**
 * Parse ArtStation artwork URL
 */
export const parseArtStationUrl = async (url: string): Promise<ParsedContent> => {
    try {
        console.error(`🎨 Parsing ArtStation URL: ${url}`);

        // Extract artwork info from URL
        const match = url.match(/artstation\.com\/artwork\/([A-Za-z0-9]+)/);
        if (!match) {
            throw new Error('Invalid ArtStation URL format');
        }

        const artworkId = match[1];

        return {
            title: `ArtStation Artwork ${artworkId}`,
            description: `Digital artwork from ArtStation`,
            platform: 'ArtStation',
            originalUrl: url,
            mediaType: 'image',
            attributes: [
                { trait_type: 'Platform', value: 'ArtStation' },
                { trait_type: 'Artwork ID', value: artworkId },
                { trait_type: 'Content Type', value: 'Digital Art' },
                { trait_type: 'Medium', value: 'Digital' }
            ]
        };
    } catch (error: any) {
        throw new Error(`Failed to parse ArtStation URL: ${error.message}`);
    }
};

/**
 * Parse Behance project URL
 */
export const parseBehanceUrl = async (url: string): Promise<ParsedContent> => {
    try {
        console.error(`💼 Parsing Behance URL: ${url}`);

        // Extract project info from URL
        const match = url.match(/behance\.net\/gallery\/([0-9]+)\/([^?]+)/);
        if (!match) {
            throw new Error('Invalid Behance URL format');
        }

        const [, projectId, projectSlug] = match;
        const projectName = projectSlug.replace(/-/g, ' ');

        return {
            title: `Behance Project: ${projectName}`,
            description: `Creative project from Behance`,
            platform: 'Behance',
            originalUrl: url,
            attributes: [
                { trait_type: 'Platform', value: 'Behance' },
                { trait_type: 'Project ID', value: projectId },
                { trait_type: 'Content Type', value: 'Creative Project' }
            ]
        };
    } catch (error: any) {
        throw new Error(`Failed to parse Behance URL: ${error.message}`);
    }
};

/**
 * Parse YouTube video URL
 */
export const parseYouTubeUrl = async (url: string): Promise<ParsedContent> => {
    try {
        console.error(`📺 Parsing YouTube URL: ${url}`);

        // Extract video ID from various YouTube URL formats
        let videoId = '';

        if (url.includes('youtube.com/watch')) {
            const match = url.match(/[?&]v=([^&]+)/);
            if (match) videoId = match[1];
        } else if (url.includes('youtu.be/')) {
            const match = url.match(/youtu\.be\/([^?]+)/);
            if (match) videoId = match[1];
        }

        if (!videoId) {
            throw new Error('Invalid YouTube URL format');
        }

        return {
            title: `YouTube Video ${videoId}`,
            description: `Video content from YouTube`,
            platform: 'YouTube',
            originalUrl: url,
            mediaType: 'video',
            mediaUrl: url,
            imageUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
            attributes: [
                { trait_type: 'Platform', value: 'YouTube' },
                { trait_type: 'Video ID', value: videoId },
                { trait_type: 'Content Type', value: 'Video' },
                { trait_type: 'Medium', value: 'Video' }
            ]
        };
    } catch (error: any) {
        throw new Error(`Failed to parse YouTube URL: ${error.message}`);
    }
};

/**
 * Parse generic image URL
 */
export const parseImageUrl = async (url: string): Promise<ParsedContent> => {
    try {
        console.error(`🖼️ Parsing image URL: ${url}`);

        // Check if it's actually an image
        const response = await axios.head(url);
        const contentType = response.headers['content-type'];

        if (!contentType?.startsWith('image/')) {
            throw new Error('URL does not point to an image');
        }

        const fileName = url.split('/').pop() || 'image';
        const extension = fileName.split('.').pop()?.toLowerCase();

        return {
            title: `Image: ${fileName}`,
            description: `Image file from URL`,
            platform: 'Direct URL',
            originalUrl: url,
            imageUrl: url,
            mediaType: 'image',
            attributes: [
                { trait_type: 'Content Type', value: 'Image' },
                { trait_type: 'File Format', value: extension?.toUpperCase() || 'Unknown' },
                { trait_type: 'Source', value: 'Direct URL' }
            ]
        };
    } catch (error: any) {
        throw new Error(`Failed to parse image URL: ${error.message}`);
    }
};

/**
 * Auto-detect and parse URL based on domain
 */
export const parseContentUrl = async (url: string): Promise<ParsedContent> => {
    try {
        console.error(`🔍 Auto-detecting URL type: ${url}`);

        if (url.includes('instagram.com')) {
            return await parseInstagramUrl(url);
        } else if (url.includes('twitter.com') || url.includes('x.com')) {
            return await parseTwitterUrl(url);
        } else if (url.includes('artstation.com')) {
            return await parseArtStationUrl(url);
        } else if (url.includes('behance.net')) {
            return await parseBehanceUrl(url);
        } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
            return await parseYouTubeUrl(url);
        } else {
            // Try as image URL
            return await parseImageUrl(url);
        }
    } catch (error: any) {
        throw new Error(`Failed to parse URL: ${error.message}`);
    }
};

/**
 * Generate IP metadata from parsed content
 */
export const generateIPMetadataFromContent = async (
    content: ParsedContent,
    creatorAddress: string,
    additionalCreators: Array<{
        name: string;
        address: string;
        contributionPercent: number;
    }> = []
): Promise<{
    ipMetadata: any;
    nftMetadata: any;
    ipfsHashes: {
        // imageHash?: string;
        // mediaHash?: string;
        ipMetadataHash: string;
        nftMetadataHash: string;
    };
}> => {
    try {
        console.error(`📝 Generating metadata for: ${content.title}`);

        // Upload media to IPFS
        // let imageHash: string | undefined;
        // let mediaHash: string | undefined;

        // if (content.imageUrl) {
        //     try {
        //         imageHash = await uploadFromUrl(content.imageUrl, `image_${Date.now()}`);
        //     } catch (error) {
        //         console.error(`⚠️ Failed to upload image: ${error}`);
        //     }
        // }

        // if (content.mediaUrl && content.mediaUrl !== content.imageUrl) {
        //     try {
        //         mediaHash = await uploadFromUrl(content.mediaUrl, `media_${Date.now()}`);
        //     } catch (error) {
        //         console.error(`⚠️ Failed to upload media: ${error}`);
        //     }
        // }

        // Prepare creators array
        const creators = [
            {
                name: content.creator || 'Content Creator',
                address: creatorAddress,
                contributionPercent: additionalCreators.length > 0 ? 80 : 100
            },
            ...additionalCreators
        ];

        // Generate IP metadata
        const ipMetadata = {
            title: content.title,
            description: content.description,
            creators: creators,
            image: content.imageUrl,
            // imageHash: imageHash,
            mediaUrl: content.mediaUrl,
            // mediaHash: mediaHash,
            mediaType: content.mediaType,
            attributes: content.attributes
        };

        // Generate NFT metadata
        const nftMetadata = {
            name: content.title,
            description: content.description,
            image: content?.imageUrl,
            animation_url: content?.mediaUrl,
            external_url: content.originalUrl,
            attributes: content.attributes?.map(attr => ({
                trait_type: attr.trait_type,
                value: attr.value
            }))
        };

        // Upload metadata to IPFS
        const { ipfsHash: ipMetadataHash } = await uploadIPMetadata(ipMetadata);
        const { ipfsHash: nftMetadataHash } = await uploadNFTMetadata(nftMetadata);

        return {
            ipMetadata,
            nftMetadata,
            ipfsHashes: { 
                ipMetadataHash,
                nftMetadataHash
            }
        };
    } catch (error: any) {
        throw new Error(`Failed to generate metadata: ${error.message}`);
    }
};

/**
 * Validate URL format
 */
export const validateUrl = (url: string): boolean => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

/**
 * Get supported platforms
 */
export const getSupportedPlatforms = (): string[] => {
    return [
        'Instagram',
        'Twitter/X',
        'ArtStation',
        'Behance',
        'YouTube',
        'Direct Image URLs'
    ];
};