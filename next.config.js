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
        BASE_URL: process.env.BASE_URL,
        REPO: process.env.REPO,
        AUTH_TOKEN: process.env.AUTH_TOKEN,
    },
}

module.exports = nextConfig