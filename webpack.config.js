const path = require('path');
const { node } = require('webpack');

module.exports = {
  mode: 'development',
  // module: 'commonjs',
  target: 'node',
  // type: "commonjs",
  entry: {
    app: [
        path.resolve(__dirname, './src/main.ts')
    ]
  },
  resolve: {
    extensions: ['.ts', '.js'], //resolve all the modules other than index.ts
    modules: ['node_modules']
  },
  module: {
    rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.node$/,
          use: 'node-loader'
        },
        {
          test: /\.(png|jpg|jpeg|gif)$/i,
          type: "asset/resource",
        },
      ]
    },
  output: {
    path: path.resolve(__dirname, './build'),
    filename: 'web.bundle.js'
  },
  devServer: {
    headers: {
      "Access-Control-Allow-Origin": "*",
      // "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, OPTIONS",
      // "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
    }
  }
};