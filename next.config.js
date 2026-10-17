/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // pdf.js requires canvas to be disabled in webpack
    config.resolve.alias.canvas = false;
    return config;
  },
}

module.exports = nextConfig
