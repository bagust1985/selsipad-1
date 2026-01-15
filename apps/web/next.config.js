const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@selsipad/ui', '@selsipad/sdk'],
  webpack: (config, { webpack }) => {
    // Path to our empty stub module
    const emptyStubPath = path.resolve(__dirname, 'src/lib/stubs/empty-wallet-sdk.js');

    // Use NormalModuleReplacementPlugin to replace optional SDK imports
    // This intercepts module resolution BEFORE webpack tries to find them in node_modules
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        // Match any of these optional wallet SDKs
        /^(porto\/internal|porto|@safe-global\/safe-apps-sdk|@safe-global\/safe-apps-provider|@gemini-wallet\/core|@ledgerhq\/iframe-provider|@mew-wallet\/connect|@imtbl\/imx-sdk)$/,
        emptyStubPath
      )
    );

    // Add fallbacks for Node.js modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      encoding: false,
      bufferutil: false,
      'utf-8-validate': false,
    };

    return config;
  },
};

module.exports = nextConfig;
