/** @type {import('next').NextConfig} */
const nextConfig = {
  // App Router est maintenant stable dans Next.js 14+
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig
