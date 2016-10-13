/**
 * @file 项目配置
 * @author zdying
 */

module.exports = {
    extend: {
        module: {
            loaders: [
                { test: /\.vue$/, loader: require.resolve('vue-loader') }
            ]
        }
    }
};