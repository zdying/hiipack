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
    supportIE8: false,
    thread: 6,
    /**
     * 需要单独打包的第三方库
     * 例如: {lib: ['react', 'react-dom']}
     * 会把'react'和'react-dom'打包到lib.js
     */
    library: {
        lib: ['react', 'redux', 'flux']
    },
    /**
     * 业务代码入口
     */
    entry: {
        main_dev: "src/main",
    },
    /**
     * 别名
     */
    alias: {
        'root_dev': 'src'
    },
    /**
     * 测试框架配置, 目前只支持mocha
     */
    autoTest: {
        framework: 'mocha',
        assertion: 'expect'
        // assertion: ['expect', 'assert']
    },
    /**
     * 扩展配置， 这里的配置会合并到默认的配置， 上面所有的配置会覆盖默认配置
     */
    extend: {
        // module: {
        //     loaders: [
        //         // { test: /\.(mustache|html)$/, loader: 'mustache' }
        //         {
        //             // 'mustache-loader': { test: /\.(mustache|html)$/, loader: 'mustache' }
        //             'mustache mustache-loader': function(loader, path){
        //                 // console.log('callback   ====> ', loader, path)
        //                 return { test: /\.(mustache|html)$/, loader: 'mustache-loader' }
        //             }
        //         }
        //     ]
        // },
        plugins: [
            function(){
                console.log('custom plugin 1');
            },
            {
                'mathjs': function(math, pkgPath){
                    console.log('pkgPath ==>', pkgPath);
                    console.log('custom plugin 2, math.round(math.e, 3) =>', math.round(math.e, 3));

                    return function(){
                        console.log('custom plugin 2, math.round(math.e, 3) =>', math.round(math.e, 3));
                    }
                },
                'underscore float-math': function(_, math, _path, mathPath){
                    // console.log('callback3: data-utils,', _, math, _path, mathPath);
                    return function(){
                        console.log('custom plugin 3', 0.3 - 0.2, math.sub(0.3, 0.2), _.isEmpty([1, 2, 3]), _path, mathPath);
                    }
                }
            }
        ]
    },
    babel: {
        plugins: ['babel-plugin-add-module-exports', 'babel-plugin-transform-object-assign'],
        presets: ['babel-preset-react', 'babel-preset-es2015-loose'],
        include: ['src', 'app'],
        exclude: /^(lib|test)$/
    }
};
