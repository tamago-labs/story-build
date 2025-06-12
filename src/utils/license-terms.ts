import { LicenseTerms, WIP_TOKEN_ADDRESS } from '@story-protocol/core-sdk';
import { parseEther, zeroAddress } from 'viem';

// Royalty policy addresses for Story Protocol
export const RoyaltyPolicyLAP = '0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E';
export const RoyaltyPolicyLRP = '0x9156e603C949481883B1d3355c6f1132D191fC41';

/**
 * Create commercial remix license terms
 */
export function createCommercialRemixTerms(terms: { 
    commercialRevShare: number; 
    defaultMintingFee: number 
}): LicenseTerms {
    return {
        transferable: true,
        royaltyPolicy: RoyaltyPolicyLAP,
        defaultMintingFee: parseEther(terms.defaultMintingFee.toString()),
        expiration: BigInt(0),
        commercialUse: true,
        commercialAttribution: true,
        commercializerChecker: zeroAddress,
        commercializerCheckerData: '0x',
        commercialRevShare: terms.commercialRevShare,
        commercialRevCeiling: BigInt(0),
        derivativesAllowed: true,
        derivativesAttribution: true,
        derivativesApproval: false,
        derivativesReciprocal: true,
        derivativeRevCeiling: BigInt(0),
        currency: WIP_TOKEN_ADDRESS,
        uri: 'https://github.com/piplabs/pil-document/blob/ad67bb632a310d2557f8abcccd428e4c9c798db1/off-chain-terms/CommercialRemix.json',
    };
}

/**
 * Create non-commercial social remixing terms
 */
export function createNonCommercialTerms(): LicenseTerms {
    return {
        transferable: true,
        royaltyPolicy: zeroAddress,
        defaultMintingFee: 0n,
        expiration: 0n,
        commercialUse: false,
        commercialAttribution: false,
        commercializerChecker: zeroAddress,
        commercializerCheckerData: '0x',
        commercialRevShare: 0,
        commercialRevCeiling: 0n,
        derivativesAllowed: true,
        derivativesAttribution: true,
        derivativesApproval: false,
        derivativesReciprocal: true,
        derivativeRevCeiling: 0n,
        currency: zeroAddress,
        uri: 'https://github.com/piplabs/pil-document/blob/998c13e6ee1d04eb817aefd1fe16dfe8be3cd7a2/off-chain-terms/NCSR.json',
    };
}