/* diabled-eslint */
module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
    ? '/drawboard/'
    : '/',
  chainWebpack: config => {
    // alias
    config.resolve.alias
      .set('fabric', 'fabric-pure-browser');
  }
}
