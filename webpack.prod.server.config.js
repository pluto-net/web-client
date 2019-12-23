const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: 'development',
  entry: ['./server/prodHandler.tsx'],
  output: {
    libraryTarget: 'commonjs2',
    path: path.resolve(__dirname, 'dist', 'server'),
    filename: '[name].js',
  },
  devtool: false,
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      'react-pdf': 'react-pdf/dist/esm/entry.webpack',
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader?cacheDirectory=true',
          },
          {
            loader: 'ts-loader',
          },
        ],
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: 'svg-sprite-loader',
            options: {
              esModule: false,
            },
          },
          'svg-transform-loader',
          'svgo-loader',
        ],
      },
      {
        test: /\.html$/,
        use: ['raw-loader'],
      },
      {
        test: /\.css$/,
        use: ['isomorphic-style-loader', 'css-loader'],
      },
      {
        test: /\.scss$/,
        use: [
          { loader: 'isomorphic-style-loader' },
          {
            loader: 'css-loader',
            options: {
              modules: true,
              localIdentName: '[name]_[local]_[hash:base64:5]',
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              plugins: () => {
                return [require('precss'), require('autoprefixer'), require('postcss-flexbugs-fixes')];
              },
            },
          },
          { loader: 'sass-loader' },
          {
            loader: 'sass-resources-loader',
            options: {
              resources: ['./app/_variables.scss'],
            },
          },
        ],
      },
    ],
  },
  target: 'node',
  node: {
    __dirname: false,
    __filename: false,
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.TARGET': JSON.stringify('server'),
    }),
    new webpack.DefinePlugin({ 'process.env.NODE_ENV': JSON.stringify('production') }),
  ],
};
