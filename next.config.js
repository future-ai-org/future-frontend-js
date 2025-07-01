/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  staticPageGenerationTimeout: 1000,
  compiler: {
    styledComponents: true,
  },
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, 'src'),
    };

    // Exclude problematic extension-related packages
    config.resolve.fallback = {
      ...config.resolve.fallback,
      // Exclude webextension-polyfill and extension-port-stream
      'webextension-polyfill': false,
      'extension-port-stream': false,
    };

    // Ignore these modules completely
    config.externals = config.externals || [];
    if (!isServer) {
      config.externals.push({
        'webextension-polyfill': 'webextension-polyfill',
        'extension-port-stream': 'extension-port-stream',
      });
    }

    return config;
  },
};

module.exports = nextConfig;
