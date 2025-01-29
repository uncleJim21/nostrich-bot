module.exports = {
  entry: './src/preload.js',
  module: {
    rules: require('./webpack.rules'),
  },
  target: 'electron-preload',
};