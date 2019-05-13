const path = require("path");

module.exports = {
  mode: "production",
  entry: ["@babel/polyfill", "./app/index.tsx"],
  output: {
    libraryTarget: "commonjs2",
    path: path.resolve(__dirname, "dist", "server"),
    filename: "[name].js",
  },
  devtool: false,
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader?cacheDirectory=true",
          },
          {
            loader: "ts-loader",
            options: {
              transpileOnly: true,
              happyPackMode: true,
            },
          },
        ],
      },
      {
        test: /\.svg$/,
        loader: "svg-sprite-loader",
        options: {
          classPrefix: false,
          idPrefix: true,
        },
      },
      {
        test: /\.css$/,
        use: ["isomorphic-style-loader", "css-loader"],
      },
      {
        test: /\.scss$/,
        use: [
          { loader: "isomorphic-style-loader" },
          {
            loader: "css-loader",
            options: {
              modules: true,
              localIdentName: "[name]_[local]_[hash:base64:5]",
            },
          },
          {
            loader: "postcss-loader",
            options: {
              plugins: () => {
                return [require("precss"), require("autoprefixer"), require("postcss-flexbugs-fixes")];
              },
            },
          },
          { loader: "sass-loader" },
          {
            loader: "sass-resources-loader",
            options: {
              resources: ["./app/_variables.scss"],
            },
          },
        ],
      },
    ],
  },
  optimization: {
    minimize: false,
    nodeEnv: "dev",
  },
  target: "node",
  node: {
    __dirname: false,
    __filename: false,
  },
};
