module.exports = {
  configureWebpack: {
    resolve: {
      alias: {
        '@': require('path').resolve(__dirname, 'src')
      }
    }
  },
  publicPath: process.env.NODE_ENV === 'production' ? '/API-amoCRM/' : '/',
}