/**
 * @file 项目配置
 * @author zdying
 */

module.exports = {
    /**
     * 需要单独打包的第三方库
     * 例如: {lib: ['react', 'react-dom']}
     * 会把'react'和'react-dom'打包到lib.js
     */
    library: {
        lib: ['jquery', 'backbone']
    },
    /**
     * loaders
     */
    loaders: {
        'dev': [
            { test: /\.(mustache|html)$/, loader: 'mustache' }
        ]
    },
    //TODO add next version
    // plugins: {
    //     'webpack': function(webpack){
    //         return [
    //             new webpack.HotModuleReplacementPlugin(),
    //             new webpack.NoErrorsPlugin()
    //         ]
    //     },
    //     'other-plugin': function(otherPlugin){
    //         return new otherPlugin({
    //             option1: 'opt1',
    //             option2: 'opt2'
    //         })
    //     }
    // },
    /**
     * 业务代码入口
     */
    entry: {
        main: "src/main",
    },
    /**
     * 别名
     */
    alias: {
        'root': 'src/'
    }
};