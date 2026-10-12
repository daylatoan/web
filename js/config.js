/**
 * ==========================================================================
 * SITE CONFIGURATION — GROK SUPER INTELLIGENCE ($GSI)
 * ==========================================================================
 * All customizable site parameters, token details, social channels,
 * asset references, and feature toggles are centralized in this file.
 */

export const siteConfig = {
  // Brand Identity
  brand: {
    name: 'Grok Super Intelligence',
    symbol: '$GSI',
    shortName: 'GSI',
    tagline: 'THE SUPERHERO OF THE MEME UNIVERSE.',
    description: 'An image of Grok wearing a cape—superintelligence is near .A community-run meme on Robinhood.',
  },

  // Token Metrics & Chain Parameters
  // Note: If values are null or empty, the UI displays clear "Coming Soon" or unconfigured states.
  token: {
    name: 'Grok Super Intelligence',
    symbol: '$GSI',
    network: 'Robinhood',
    contractAddress: null, // e.g., '0x...' or null if not yet deployed
    tokenType: 'ERC-20 / Meme Coin',
    explorerUrl: 'https://robinhoodchain.blockscout.com/', // Robinhood Chain Explorer
    swapUrl: null,     // e.g., 'https://app.uniswap.org/explore/pools/...' (Uniswap v4)
    chartUrl: null,    // e.g., 'https://dexscreener.com/...'
  },

  // Official Social Channels
  social: {
    twitterUrl: 'https://x.com', // Replace with official GSI X account when live
    telegramUrl: 'https://t.me', // Replace with official GSI Telegram channel
    discordUrl: null,            // Null if not active
    dexScreenerUrl: null,
    gitbookUrl: null,
  },

  // Asset Paths
  assets: {
    logo: 'assets/logo.png',
    heroCover: 'assets/cover 17.png',
    animatedBanner: 'assets/banner.gif',
    characterAvatar: 'assets/AVT (16).png',
    characterAvatarAlt: 'assets/AVT (14).png',
    communityGif: 'assets/new-buy.gif',
    favicon: 'assets/favicon.png',
  },

  // Feature Toggles
  features: {
    enableAnimations: true,
    enableGame: true,
    enableSound: true,
    enableParticles: true,
  },
};
