/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'standalone', // Disabled for development
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
    esmExternals: 'loose',
    // Optimize build performance
    optimizeCss: true,
    optimizeServerReact: true,
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
    domains: ['images.pexels.com', 'eldhtxtnwdanyavkikap.supabase.co', 'images.unsplash.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'eldhtxtnwdanyavkikap.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      }
    ],
    unoptimized: false,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Webpack configuration for stable chunk loading and better performance
  webpack: (config, { dev, isServer }) => {
    // Optimize for development
    if (dev) {
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
      };
      
      // Don't override devtool to avoid Next.js warnings
      // Let Next.js handle devtool configuration
    }
    
    // Exclude script files with emoji from webpack processing
    const webpack = require('webpack');
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^\.\/(?:check-|debug-|deploy|fix-|insert-|manual-|setup-|simple-|test-).*\.js$/
      })
    );
    
    // Optimize chunk splitting for better caching
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        ...config.optimization.splitChunks,
        chunks: 'all',
        cacheGroups: {
          ...config.optimization.splitChunks?.cacheGroups,
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          supabase: {
            test: /[\\/]node_modules[\\/]@supabase[\\/]/,
            name: 'supabase',
            chunks: 'all',
            priority: 20,
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 5,
            reuseExistingChunk: true,
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
      /Critical dependency: the request of a dependency is an expression/,
      /Module not found: Can't resolve 'utf-8-validate'/,
      /Module not found: Can't resolve 'bufferutil'/,
    ];
    
    // Optimize module resolution
    config.resolve.modules = ['node_modules'];
    config.resolve.symlinks = false;
    
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
