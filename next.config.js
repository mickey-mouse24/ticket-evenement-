/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimisations de performance
  compress: true,
  poweredByHeader: false,
  
  // Configuration des images
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
  
  // Optimisations du bundle
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Configuration expérimentale pour de meilleures performances
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  
  // TypeScript et ESLint
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig
