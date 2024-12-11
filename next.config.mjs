/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["framer-motion", "geist"],
  experimental: {
    optimizePackageImports: ["geist"]
  }
}

export default nextConfig
