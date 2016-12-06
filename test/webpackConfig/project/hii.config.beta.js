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
        module: {
            loaders: [
                { test: /\.(markdown|md)$/, loader: 'html-loader!markdown-loader' },
                {
                    // 'mustache-loader': { test: /\.(mustache|html)$/, loader: 'mustache' }
                    'mustache mustache-loader': function(loader, path){
                        // console.log('callback   ====> ', loader, path)
                        return { test: /\.(mustache|html)$/, loader: 'mustache-loader' }
                    }
                }
            ]
        }
    },
    babel: {
        plugins: ['babel-plugin-add-module-exports', 'babel-plugin-transform-object-assign'],
        presets: ['babel-preset-react', 'babel-preset-es2015-loose'],
        include: ['src', 'app'],
        exclude: /^(lib|test)$/
    }
};
