/* diabled-eslint */
module.exports = {
  chainWebpack: config => {
    // alias
    config.resolve.alias
      .set('fabric', 'fabric-pure-browser');
  }
}
