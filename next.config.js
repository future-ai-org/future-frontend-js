/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  staticPageGenerationTimeout: 1000,
  compiler: {
    styledComponents: true,
  },
};

module.exports = nextConfig; 
