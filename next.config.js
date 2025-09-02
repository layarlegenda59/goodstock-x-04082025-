/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'standalone', // Disabled for development
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
    esmExternals: 'loose'
  },
  
  // Fix for Supabase realtime warnings
  transpilePackages: ['@supabase/supabase-js', '@supabase/realtime-js'],
  
  // Prevent hydration errors
  swcMinify: true,
  reactStrictMode: false,

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true
  },
  images: {
    domains: ['images.pexels.com', 'eldhtxtnwdanyavkikap.supabase.co', 'rkfkxhfvldavnirarytg.supabase.co', 'images.unsplash.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'eldhtxtnwdanyavkikap.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'rkfkxhfvldavnirarytg.supabase.co',
        port: '',
        pathname: '/storage/v1/object/**',
      },
    ],
    unoptimized: false,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Webpack configuration for stable chunk loading
  webpack: (config, { dev, isServer }) => {
    // Don't override devtool in development to avoid syntax errors
    
    // Exclude script files with emoji from webpack processing
    const webpack = require('webpack');
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^\.\/(?:check-|debug-|deploy|fix-|insert-|manual-|setup-|simple-|test-).*\.js$/
      })
    );
    
    // Optimize chunk splitting
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks?.cacheGroups,
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      },
    };
    
    // Ignore optional dependencies that cause warnings
    config.resolve.fallback = {
      ...config.resolve.fallback,
      'utf-8-validate': false,
      'bufferutil': false,
    };
    
    // Suppress Supabase realtime warnings
    config.ignoreWarnings = [
      { module: /node_modules\/@supabase\/realtime-js/ },
      /Critical dependency: the request of a dependency is an expression/
    ];
    
    return config;
    },
    // Add headers for CORS only
  async headers() {
    return [
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, apikey'
          }
        ]
      }
    ]
  }
};

module.exports = nextConfig;
