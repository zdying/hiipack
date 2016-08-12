/**
 * @file 项目配置
 * @author zdying
 */

// console.log('---------- visit global variable -----------');
// console.log(__hiipack__.cwd);
// console.log(__hiipack__.root);
// console.log(__hiipack__.tmpdir);
// console.log('---------- visit global variable -----------');

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
        ],
        //TODO add next version
        // '*': [
        //     { test: /\.(mustache|html)$/, loader: 'mustache' }
        // ],
        // '*': {
        //     "handlebars-loader handlebars": function(handlebarsLoader, handlebars){
        //         return { test: /\.(handlebars|hbs)$/, loader: 'handlebars' }
        //     },
        //     "vue-loader": function(vueLoader){
        //
        //     }
        // }
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
    //     },
    //     'plugin1 plugin2': function(Plugin1, Plugin2){
    //         return [
    //              new Plugin1({
    //                  option1: 'opt1',
    //                  option2: 'opt2'
    //              }),
    //              new Plugin2({
    //                  option1: 'opt1',
    //                  option2: 'opt2'
    //              }),
    //     },
    //     'plugin@version': function(Plugin){
    //         return new Plugin()
    //     },
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
    },
    //TODO extend customConfig to webpack config, add next version
    // customConfig: {
    //     test: 1
    // },
    // customConfig: {
    //     test: 2
    // },
};