/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  distDir: "out",
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.target = "electron-renderer"
    }

    // Handle node modules that need to be external
    config.externals = config.externals || []
    config.externals.push({
      "better-sqlite3": "commonjs better-sqlite3",
      electron: "commonjs electron",
      fs: "commonjs fs",
      path: "commonjs path",
      os: "commonjs os",
    })

    return config
  },
  experimental: {
    esmExternals: false,
  },
}

module.exports = nextConfig
