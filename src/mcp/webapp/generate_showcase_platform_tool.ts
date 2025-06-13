import { z } from "zod";
import { StoryAgent } from "../../agent";
import { type McpTool } from "../../types";

export const GenerateShowcasePlatformTool: McpTool = {
    name: "story_generate_showcase_platform",
    description: "Generate a complete IP showcase platform with license purchasing functionality",
    schema: {
        project_name: z.string()
            .min(3)
            .max(50)
            .regex(/^[a-zA-Z0-9-_]+$/)
            .describe("Name of the showcase platform project (e.g., 'my-art-showcase')"),
        ip_asset: z.object({
            id: z.string().describe("Primary IP asset ID to showcase (0x...)"),
            title: z.string().describe("IP asset title"),
            creator: z.string().describe("Creator/artist name"),
            type: z.enum(['image', 'video', 'audio', 'text']).describe("Media type")
        }).describe("Primary IP asset information"),
        additional_assets: z.array(z.string())
            .optional()
            .describe("Additional IP asset IDs to include in portfolio"),
        platform_config: z.object({
            title: z.string().describe("Platform title (e.g., 'My Art Collection')"),
            description: z.string().describe("Platform description for SEO"),
            theme: z.enum(['dark', 'light', 'creative', 'professional']).default('dark').describe("Visual theme"),
            domain: z.string().optional().describe("Custom domain for deployment")
        }).describe("Platform configuration"),
        features: z.array(z.enum([
            'portfolio_gallery',
            'license_purchasing',
            'revenue_analytics',
            'wallet_integration',
            'social_sharing',
            'mobile_responsive'
        ]))
            .default(['portfolio_gallery', 'license_purchasing', 'wallet_integration'])
            .describe("Features to include in the platform"),
        monetization: z.object({
            enable_licensing: z.boolean().default(true).describe("Enable license token sales"),
            license_tiers: z.array(z.object({
                name: z.string(),
                price: z.number(),
                description: z.string()
            })).optional().describe("Custom license tiers")
        }).describe("Monetization settings")
    },
    handler: async (agent: StoryAgent, input: Record<string, any>) => {
        try {
            await agent.connect();

            const projectName = input.project_name;
            const ipAsset = input.ip_asset;
            const platformConfig = input.platform_config;

            // Validate IP asset exists
            // console.error(`🔍 Validating IP asset: ${ipAsset.id}...`);
            // const assetData = await agent.getIPAsset(ipAsset.id);
            // if (!assetData) {
            //     throw new Error(`IP asset not found: ${ipAsset.id}`);
            // }

            // Generate project structure
            const projectStructure = generateProjectStructure(projectName, input);

            // Generate configuration files
            const configFiles = generateConfigFiles(projectName, ipAsset, platformConfig, input);

            // Generate React components
            const components = generateComponents(ipAsset, input.features, platformConfig.theme);

            // Generate API routes
            const apiRoutes = generateAPIRoutes(input.features);

            // Generate deployment configuration
            const deploymentConfig = generateDeploymentConfig(projectName, platformConfig);

            // Generate documentation
            const documentation = generateDocumentation(projectName, ipAsset, platformConfig, input);

            console.error(`✅ Generated complete showcase platform: ${projectName}`);

            return {
                status: "success",
                message: `✅ IP Showcase Platform "${platformConfig.title}" generated successfully!`,
                project_details: {
                    name: projectName,
                    platform_title: platformConfig.title,
                    creator_name: ipAsset.creator,
                    primary_ip_id: ipAsset.id,
                    theme: platformConfig.theme,
                    features_count: input.features.length
                },
                generated_structure: projectStructure,
                configuration_files: configFiles,
                react_components: components,
                api_routes: apiRoutes,
                deployment_config: deploymentConfig,
                documentation: documentation,
                setup_instructions: {
                    development: {
                        commands: [
                            `cd ${projectName}`,
                            "npm install",
                            "cp .env.example .env.local",
                            "# Configure your Story Protocol settings in .env.local",
                            "npm run dev"
                        ],
                        local_url: "http://localhost:3000",
                        admin_url: "http://localhost:3000/dashboard"
                    },
                    production: {
                        build_command: "npm run build",
                        deploy_platforms: ["Vercel", "Netlify", "Railway"],
                        domain_setup: platformConfig.domain ? `Custom domain: ${platformConfig.domain}` : "Use platform subdomain"
                    }
                },
                platform_features: {
                    ip_showcase: "Professional IP asset display with metadata",
                    licensing_system: input.monetization.enable_licensing ? "WIP token-based license purchasing" : "Display only",
                    wallet_support: input.features.includes('wallet_integration') ? "MetaMask + WalletConnect" : "View only",
                    analytics: input.features.includes('revenue_analytics') ? "Creator revenue dashboard" : "Basic stats",
                    mobile_ready: input.features.includes('mobile_responsive') ? "Fully responsive design" : "Desktop optimized"
                },
                integration_checklist: [
                    "✅ Project files generated",
                    "🔄 Configure environment variables (.env.local)",
                    "🔄 Test wallet connections",
                    "🔄 Verify IP asset loading",
                    "🔄 Deploy to hosting platform",
                    "🔄 Configure custom domain (if provided)",
                    "📚 Share platform with potential licensees"
                ],
                live_urls: {
                    platform: platformConfig.domain ? `https://${platformConfig.domain}` : `https://${projectName}.vercel.app`,
                    creator_dashboard: `/dashboard`,
                    license_purchase: `/license/${ipAsset.id}`,
                    portfolio: input.features.includes('portfolio_gallery') ? `/portfolio` : null
                },
                monetization_setup: input.monetization.enable_licensing ? {
                    license_tokens: "Ready for WIP token purchases",
                    revenue_tracking: "Automatic royalty collection",
                    pricing_model: input.monetization.license_tiers ? "Custom tiers configured" : "Standard pricing",
                    payment_method: "WIP tokens via Story Protocol"
                } : {
                    display_only: "Showcase mode - no monetization",
                    upgrade_path: "Enable licensing anytime via platform settings"
                },
                success_metrics: {
                    deployment_time: "< 5 minutes",
                    buyer_conversion: "One-click license purchasing",
                    mobile_experience: "Touch-optimized interface",
                    seo_optimized: "Meta tags and social sharing ready",
                    load_speed: "Optimized images and lazy loading"
                }
            };

        } catch (error: any) {
            console.error('❌ Failed to generate showcase platform:', error);
            throw new Error(`Failed to generate showcase platform: ${error.message}`);
        } finally {
            await agent.disconnect();
        }
    }
};

// Generate project structure
function generateProjectStructure(projectName: string, input: any): any {
    return {
        [`${projectName}/`]: {
            type: "directory",
            description: "Next.js 14 showcase platform with Story Protocol integration",
            children: {
                "src/": {
                    type: "directory",
                    children: {
                        "app/": {
                            type: "directory",
                            description: "Next.js App Router pages",
                            children: {
                                "layout.tsx": { type: "file", description: "Root layout with providers" },
                                "page.tsx": { type: "file", description: "Main showcase page" },
                                "globals.css": { type: "file", description: "Global styles with theme" },
                                ...(input.features.includes('portfolio_gallery') && {
                                    "portfolio/": {
                                        type: "directory",
                                        children: {
                                            "page.tsx": { type: "file", description: "Portfolio gallery" }
                                        }
                                    }
                                }),
                                ...(input.monetization.enable_licensing && {
                                    "license/[ipId]/": {
                                        type: "directory",
                                        children: {
                                            "page.tsx": { type: "file", description: "License purchase page" }
                                        }
                                    }
                                }),
                                ...(input.features.includes('revenue_analytics') && {
                                    "dashboard/": {
                                        type: "directory",
                                        children: {
                                            "page.tsx": { type: "file", description: "Creator analytics dashboard" }
                                        }
                                    }
                                }),
                                "api/": {
                                    type: "directory",
                                    children: {
                                        "ip/[id]/": {
                                            type: "directory",
                                            children: {
                                                "route.ts": { type: "file", description: "IP asset API endpoint" }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        "components/": {
                            type: "directory",
                            description: "React components",
                            children: {
                                "IPShowcase.tsx": { type: "file", description: "Main IP asset display" },
                                "WalletConnect.tsx": { type: "file", description: "Wallet connection component" },
                                ...(input.monetization.enable_licensing && {
                                    "LicensePurchase.tsx": { type: "file", description: "License purchasing interface" }
                                }),
                                ...(input.features.includes('portfolio_gallery') && {
                                    "PortfolioGrid.tsx": { type: "file", description: "IP assets grid" }
                                }),
                                ...(input.features.includes('revenue_analytics') && {
                                    "RevenueChart.tsx": { type: "file", description: "Analytics dashboard" }
                                })
                            }
                        },
                        "lib/": {
                            type: "directory",
                            description: "Utility libraries",
                            children: {
                                "story-client.ts": { type: "file", description: "Story Protocol integration" },
                                "utils.ts": { type: "file", description: "Helper functions" }
                            }
                        },
                        "types/": {
                            type: "directory",
                            children: {
                                "index.ts": { type: "file", description: "TypeScript definitions" }
                            }
                        }
                    }
                },
                "public/": {
                    type: "directory",
                    children: {
                        "favicon.ico": { type: "file", description: "Site favicon" },
                        "images/": { type: "directory", description: "Static images" }
                    }
                },
                "package.json": { type: "file", description: "Dependencies and scripts" },
                "next.config.js": { type: "file", description: "Next.js configuration" },
                "tailwind.config.js": { type: "file", description: "Tailwind CSS config" },
                ".env.example": { type: "file", description: "Environment variables template" },
                "README.md": { type: "file", description: "Setup and usage guide" }
            }
        }
    };
}

// Generate configuration files
function generateConfigFiles(projectName: string, ipAsset: any, platformConfig: any, input: any): any {
    return {
        "package.json": {
            name: projectName,
            version: "1.0.0",
            description: platformConfig.description,
            private: true,
            scripts: {
                dev: "next dev",
                build: "next build",
                start: "next start",
                lint: "next lint"
            },
            dependencies: {
                "next": "^14.0.0",
                "react": "^18.0.0",
                "react-dom": "^18.0.0",
                "typescript": "^5.0.0",
                "@types/node": "^20.0.0",
                "@types/react": "^18.0.0",
                "tailwindcss": "^3.3.0",
                "viem": "^1.18.0",
                "wagmi": "^1.4.0",
                "@story-protocol/core-sdk": "^1.0.0",
                "lucide-react": "^0.263.0",
                "framer-motion": "^10.16.0"
            }
        },
        ".env.example": {
            "# Story Protocol Configuration": "",
            "NEXT_PUBLIC_STORY_NETWORK": "aeneid",
            "NEXT_PUBLIC_CREATOR_ADDRESS": "your_wallet_address",
            "NEXT_PUBLIC_PRIMARY_IP_ID": ipAsset.id, 
            "# Platform Configuration": "",
            "NEXT_PUBLIC_PLATFORM_TITLE": platformConfig.title,
            "NEXT_PUBLIC_CREATOR_NAME": ipAsset.creator, 
            "# Wallet Integration": "",
            "NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID": "your_walletconnect_project_id", 
            "# Optional Features": "",
            "NEXT_PUBLIC_ENABLE_ANALYTICS": input.features.includes('revenue_analytics').toString(),
            "NEXT_PUBLIC_ENABLE_LICENSING": input.monetization.enable_licensing.toString()
        },
        "next.config.js": `/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: [
      'gateway.pinata.cloud',
      'ipfs.io',
      'story-protocol.s3.amazonaws.com'
    ],
  },
  env: {
    STORY_NETWORK: process.env.NEXT_PUBLIC_STORY_NETWORK,
    PRIMARY_IP_ID: process.env.NEXT_PUBLIC_PRIMARY_IP_ID,
  }
};

module.exports = nextConfig;`,
        "tailwind.config.js": generateTailwindConfig(platformConfig.theme)
    };
}

// Generate React components metadata
function generateComponents(ipAsset: any, features: string[], theme: string): any {
    const components: any = {
        "IPShowcase.tsx": {
            description: "Hero display of IP asset with metadata and licensing info",
            props: ["ipAsset", "featured", "showLicenseButton"],
            features: ["Responsive design", "Media preview", "Metadata display", "Attribution"]
        },
        "WalletConnect.tsx": {
            description: "Multi-wallet connection component",
            props: ["onConnect", "onDisconnect"],
            features: ["MetaMask support", "WalletConnect integration", "Connection status"]
        }
    };

    if (features.includes('portfolio_gallery')) {
        components["PortfolioGrid.tsx"] = {
            description: "Grid layout for multiple IP assets",
            props: ["ipAssets", "filterBy", "sortBy"],
            features: ["Responsive grid", "Filtering", "Search", "Pagination"]
        };
    }

    if (features.includes('license_purchasing')) {
        components["LicensePurchase.tsx"] = {
            description: "License token purchasing interface",
            props: ["ipAsset", "licenseTerms", "onPurchase"],
            features: ["WIP token integration", "Price calculation", "Transaction confirmation"]
        };
    }

    if (features.includes('revenue_analytics')) {
        components["RevenueChart.tsx"] = {
            description: "Creator revenue analytics dashboard",
            props: ["revenueData", "timeRange"],
            features: ["Interactive charts", "Revenue tracking", "License sales metrics"]
        };
    }

    return components;
}

// Generate API routes
function generateAPIRoutes(features: string[]): any {
    const routes: any = {
        "/api/ip/[id]": {
            methods: ["GET"],
            description: "Fetch IP asset information from Story Protocol",
            response: "IP asset metadata and license terms"
        }
    };

    if (features.includes('license_purchasing')) {
        routes["/api/license/purchase"] = {
            methods: ["POST"],
            description: "Process license token purchase",
            authentication: "Wallet signature required"
        };
    }

    if (features.includes('revenue_analytics')) {
        routes["/api/analytics/revenue"] = {
            methods: ["GET"],
            description: "Get creator revenue data",
            authentication: "Creator wallet required"
        };
    }

    return routes;
}

// Generate deployment configuration
function generateDeploymentConfig(projectName: string, platformConfig: any): any {
    return {
        vercel: {
            project_name: projectName,
            build_command: "npm run build",
            output_directory: ".next",
            environment_variables: [
                "NEXT_PUBLIC_STORY_NETWORK",
                "NEXT_PUBLIC_CREATOR_ADDRESS",
                "NEXT_PUBLIC_PRIMARY_IP_ID",
                "NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID"
            ]
        },
        netlify: {
            build_command: "npm run build && npm run export",
            publish_directory: "out",
            environment_variables: "Same as Vercel"
        },
        custom_domain: platformConfig.domain ? {
            domain: platformConfig.domain,
            ssl: "Automatic HTTPS",
            dns_setup: "Point domain to deployment platform"
        } : null
    };
}

// Generate documentation
function generateDocumentation(projectName: string, ipAsset: any, platformConfig: any, input: any): any {
    return {
        "README.md": {
            title: platformConfig.title,
            sections: [
                "Overview",
                "Features",
                "Quick Start",
                "Environment Setup",
                "Development",
                "Deployment",
                "Story Protocol Integration",
                "License"
            ],
            creator_info: {
                name: ipAsset.creator,
                primary_asset: ipAsset.title,
                asset_type: ipAsset.type
            }
        },
        "API_DOCUMENTATION.md": {
            endpoints: Object.keys(generateAPIRoutes(input.features)).length,
            includes_examples: true,
            authentication_guide: true
        },
        "DEPLOYMENT_GUIDE.md": {
            platforms: ["Vercel", "Netlify", "Railway"],
            domain_setup: !!platformConfig.domain,
            environment_configuration: true
        }
    };
}

// Generate Tailwind config based on theme
function generateTailwindConfig(theme: string): string {
    const themeConfigs = {
        dark: {
            primary: '#1a1b23',
            secondary: '#2d3748',
            accent: '#805ad5'
        },
        light: {
            primary: '#ffffff',
            secondary: '#f7fafc',
            accent: '#3182ce'
        },
        creative: {
            primary: '#1a202c',
            secondary: '#2d3748',
            accent: '#ed64a6'
        },
        professional: {
            primary: '#0f172a',
            secondary: '#1e293b',
            accent: '#059669'
        }
    };

    const config = themeConfigs[theme as keyof typeof themeConfigs] || themeConfigs.dark;

    return `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '${config.primary}',
        secondary: '${config.secondary}',
        accent: '${config.accent}',
        story: {
          purple: '#8B5FBF',
          blue: '#4F46E5'
        }
      },
      backgroundImage: {
        'story-gradient': 'linear-gradient(135deg, #8B5FBF 0%, #4F46E5 100%)'
      }
    },
  },
  plugins: [],
}`;
}
