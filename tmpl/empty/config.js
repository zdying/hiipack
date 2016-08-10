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
        lib: [/*'jquery', 'backbone', 'and so on'*/]
    },
    /**
     * loaders
     */
    loaders: {
        /*'dev': [
            { test: /\.(mustache|html)$/, loader: 'mustache' }
        ]*/
    },
    /**
     * 业务代码入口
     */
    entry: {
        // page1: "src/js/page1",
        // page2: "src/js/page2",
    },
    /**
     * 别名
     */
    alias: {
        // 'foo' : 'src/path/to/foo'
    }
};