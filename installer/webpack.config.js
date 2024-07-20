module.exports = {
    entry: './publc/background.js',
    target: 'web',
    output: {
      path: path.join(__dirname, 'build'),
      filename: 'background.js'
    }
  }