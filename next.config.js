/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  basePath: '',
  assetPrefix: '',
  eslint: {
    // Ignore ESLint errors during builds
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig