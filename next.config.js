/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    trailingSlash: true,
    skipTrailingSlashRedirect: true,
    distDir: 'out',
    images: {
        unoptimized: true,
    },
    env: {
        BASE_URL: process.env.BASE_URL || 'https://api.cnb.cool',
        REPO: process.env.REPO || 'cnb.ai/testblog',
        AUTH_TOKEN: process.env.AUTH_TOKEN || '2Id119fZ36btt0Nckpwmr9vE3ZC',
    },
}

module.exports = nextConfig