module.exports = [
  // Add support for native node modules
  {
    test: /native_modules[/\\].+\.node$/,
    use: 'node-loader',
  },
  {
    test: /[/\\]node_modules[/\\].+\.(m?js|node)$/,
    parser: { amd: false },
    use: {
      loader: '@vercel/webpack-asset-relocator-loader',
      options: {
        outputAssetBase: 'native_modules',
      },
    },
  },
  {
    test: /\.tsx?$/,
    exclude: /node_modules/,
    use: [
      {
        loader: 'babel-loader',
        options: {
          presets: [
            '@babel/preset-env',
            '@babel/preset-typescript',
            '@babel/preset-react',
          ],
          plugins: ['@babel/plugin-proposal-class-properties'],
        },
      },
    ],
  },
  // Add the rule for image files
  {
    test: /\.(png|jpe?g|gif|svg)$/i,
    type: 'asset/resource', // Use asset modules for better performance
    generator: {
      filename: 'images/[hash][ext][query]', // Customize output directory
    },
  },
];

module.exports.resolve = {
  extensions: ['.tsx', '.ts', '.js'], // Ensure these extensions are resolved automatically
};
