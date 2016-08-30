/**
 * @file 项目配置
 * @author zdying
 */

// console.log('---------- visit global variable -----------');
// console.log(__hiipack__.cwd);
// console.log(__hiipack__.root);
// console.log(__hiipack__.tmpdir);
// console.log(__hiipack__.resolve('webpack'));
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
        '*': [
            { test: /\.(mustache|html)$/, loader: 'mustache' }
            // {
            //     // 'mustache-loader': { test: /\.(mustache|html)$/, loader: 'mustache' }
            //     'mustache-loader': function(loader, path){
            //         console.log('callback   ====> ', loader, path)
            //         return { test: /\.(mustache|html)$/, loader: 'mustache' }
            //     }
            // }
        ]
    },
    /**
     * loaders
     */
    loaders: [
        // { test: /\.(mustache|html)$/, loader: 'mustache' }
        {
            // 'mustache-loader': { test: /\.(mustache|html)$/, loader: 'mustache' }
            'mustache mustache-loader': function(loader, path){
                // console.log('callback   ====> ', loader, path)
                return { test: /\.(mustache|html)$/, loader: 'mustache' }
            }
        }
    ],
    plugins: {
        '*': [
            function(){
                console.log('custom plugin 1');
            },
            {
                'date-format': function(dateFormat, pkgPath){
                    console.log('callback2: data-format,', dateFormat, pkgPath);
                    return function(){
                        console.log('custom plugin 2, date =>', dateFormat('yyyy-MM/dd hh||mm//ss.SSS', new Date()));
                    }
                },
                'underscore float-math': function(_, math, _path, mathPath){
                    console.log('callback3: data-utils,', _, math, _path, mathPath);
                    return function(){
                        console.log('custom plugin 3', 0.3 - 0.2, math.sub(0.3, 0.2), _.isEmpty([1, 2, 3]), _path, mathPath);
                    }
                }
            }
        ]
    },
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
    /**
     * 测试框架配置, 目前只支持mocha
     */
    autoTest: {
        framework: 'mocha',
        assertion: 'expect'
        // assertion: ['expect', 'assert']
    }
};
