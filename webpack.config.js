const path = require('path');
module.exports = {
  entry: [ 'babel-polyfill', './client/src/index.js'],
  output: {
    path: path.resolve('dist'),
    filename: 'index_bundle.js'
  },
 module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      }
    ]
  }
}
