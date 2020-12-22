const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');

const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const path = require('path');

module.exports = {
  entry: "./bootstrap.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bootstrap.js",
  },
  mode: "development",
  module: {
    rules: [
      {
        test: /\.css/,
        use: ['style-loader', 'css-loader'],
        exclude: /node_modules/,
        include: path.resolve(__dirname, 'static')
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    // new CopyWebpackPlugin(['index.html'])
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'index.html')
  })
  ],
};
