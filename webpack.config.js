const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const main = {
  mode: 'development',
  target: 'electron-main',
  devtool: 'inline-source-map',
  entry: path.join(__dirname, 'src', 'index'),
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist')
  },
  node: {
    __dirname: false,
    __filename: false
  },
  module: {
    rules: [{
      test: /.ts?$/,
      include: [
        path.resolve(__dirname, 'src'),
      ],
      exclude: [
        path.resolve(__dirname, 'node_modules'),
      ],
      loader: 'ts-loader',
    }]
  },
  resolve: {
    extensions: ['.js', '.ts']
  },
};

const render = {
  mode: 'development',
  target: 'electron-renderer',
  entry: path.join(__dirname, 'src', 'renderer', 'index'),
  output: {
    path: path.resolve(__dirname, 'dist', 'scripts'),
    filename: 'index.js'
  },
  resolve: {
    extensions: ['.json', '.js', '.jsx', '.css', '.ts', '.tsx', '.scss']
  },
  module: {
    rules: [{
      test: /\.(tsx|ts)$/,
      use: [
        'ts-loader'
      ],
      include: [
        path.resolve(__dirname, 'src'),
        path.resolve(__dirname, 'node_modules'),
      ],
    }, {
      test: /\.css$/,
      exclude: '/node_modules/',
      use: [
        'style-loader',
        {
          'loader': 'css-loader',
          options: {
            url: false
          }
        }
      ]
    }, {
      test: /\.scss$/,
      use: [
        'style-loader',
        {
          loader: 'css-loader',
          options: {
            url: false,
          },
        },
        'sass-loader',
      ],
    }]
  },
  plugins: [
    new CopyWebpackPlugin([
      {
        // Copy html files
        from: 'src/renderer/html',
        to: 'html',
      },
      {
        // Copy images
        from: 'node_modules/hypermd/theme/',
        to: 'html',
      },
    ]),
  ]
};

module.exports = [
  main, render,
];
