/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  staticPageGenerationTimeout: 1000,
  compiler: {
    styledComponents: true,
  },
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, 'src'),
    };

    config.resolve.fallback = {
      ...config.resolve.fallback,
      'webextension-polyfill': false,
      'extension-port-stream': false,
    };

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
