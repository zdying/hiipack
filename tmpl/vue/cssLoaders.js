var path = require('path')

var ExtractTextPlugin = require('extract-text-webpack-plugin')



module.exports = function (options) {
  options = options || {}

  var cssLoader = {
    loader: require.resolve('css-loader'),
    options: {
      minimize: process.env.NODE_ENV === 'production',
      sourceMap: options.sourceMap
    }
  }

  var postcss = {
    loader: require.resolve('postcss-loader')
  }

  // generate loader string to be used with extract text plugin
  function generateLoaders (loader, loaderOptions) {
    var loaders = [cssLoader, postcss]
    if (loader) {
      loaders.push({
        loader: require.resolve(loader + '-loader'),
        options: Object.assign({}, loaderOptions, {
          sourceMap: options.sourceMap
        })
      })
    }

    // Extract CSS when that option is specified
    // (which is the case during production build)
    if (options.extract) {
      return ExtractTextPlugin.extract({
        use: loaders,
        fallback: require.resolve('vue-style-loader')
      })
    } else {
      return [require.resolve('vue-style-loader')].concat(loaders)
    }
  }

  // https://vue-loader.vuejs.org/en/configurations/extract-css.html
  return {
    css: generateLoaders(),
    less: generateLoaders('less'),
    sass: generateLoaders('sass', { indentedSyntax: true }),
    scss: generateLoaders('sass'/*, {includePaths: [path.resolve('./src/yo')]}*/),
    // stylus: generateLoaders('stylus'),
    // styl: generateLoaders('stylus')
  }
}

