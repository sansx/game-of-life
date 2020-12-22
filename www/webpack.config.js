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
  module: {
    rules: [
      {
        test: /\.css/,
        use: ['style-loader', 'css-loader'],
        exclude: /node_modules/,
        include: path.resolve(__dirname, 'static')
      },
      {
        test: /\.(woff|woff2|svg|ttf|eot)$/,
        use: [
          { loader: 'file-loader', options: { name: 'fonts/[name].[hash:8].[ext]' } }
        ]
      }
    ]
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    clientLogLevel: 'none',
    stats: {
      colors: true,
      hash: false,
      // version: false,
      // timings: false,
      entrypoints: false,
      assets: false,
      chunks: false,
      modules: false,
      reasons: false,
      children: false,
      source: false,
      // errors: false,
      // errorDetails: false,
      // warnings: false,
      publicPath: false
    },
    // stats: 'minimal',
  },
  plugins: [
    new CleanWebpackPlugin(),
    // new CopyWebpackPlugin(['index.html'])
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'index.html')
    })
  ],
};
