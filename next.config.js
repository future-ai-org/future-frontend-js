/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Enable static file serving
  staticPageGenerationTimeout: 1000,
  // Configure webpack for CSS handling
  webpack: (config) => {
    config.module.rules.push({
      test: /\.css$/,
      use: [
        'style-loader',
        {
          loader: 'css-loader',
          options: {
            importLoaders: 1,
            modules: {
              auto: true,
              localIdentName: '[name]__[local]--[hash:base64:5]',
            },
          },
        },
      ],
    });
    return config;
  },
  // Ensure static assets are properly handled
  images: {
    domains: [],
  },
};

module.exports = nextConfig; 
