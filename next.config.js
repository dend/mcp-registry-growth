/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  basePath: process.env.NODE_ENV === 'production' ? '/' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/' : '',
  eslint: {
    // Ignore ESLint errors during builds
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig