const { createVanillaExtractPlugin } = require('@vanilla-extract/next-plugin');
const withVanillaExtract = createVanillaExtractPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ['@frontend/common'],
    webpack: (config) => {
        config.externals.push('pino-pretty', 'lokijs', 'encoding');
        return config;
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    output: 'standalone',
};

module.exports = withVanillaExtract(nextConfig);
